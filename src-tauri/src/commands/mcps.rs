use crate::types::{FetchMcpToolsResult, McpConfigFile, McpMetadata, McpServer, McpServerRuntimeInfo, McpToolInfo};
use crate::utils::{expand_path, get_data_file_path};
use std::collections::HashMap;
use std::fs;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::Command as TokioCommand;
use tokio::time::{timeout, Duration};
use walkdir::WalkDir;

/// Scan MCPs directory and return list of MCP servers
#[tauri::command]
pub fn scan_mcps(source_dir: String) -> Result<Vec<McpServer>, String> {
    let path = expand_path(&source_dir);

    if !path.exists() {
        return Ok(Vec::new());
    }

    let mut mcps = Vec::new();
    let metadata_map = load_mcp_metadata();

    for entry in WalkDir::new(&path)
        .min_depth(1)
        .max_depth(2)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let file_path = entry.path();
        
        // Look for JSON files (MCP config files)
        if file_path.extension().map_or(false, |ext| ext == "json") {
            if let Ok(mcp) = parse_mcp_file(file_path, &metadata_map) {
                mcps.push(mcp);
            }
        }
    }

    Ok(mcps)
}

/// Get a single MCP by ID
#[tauri::command]
pub fn get_mcp(source_dir: String, mcp_id: String) -> Result<Option<McpServer>, String> {
    let mcps = scan_mcps(source_dir)?;
    Ok(mcps.into_iter().find(|m| m.id == mcp_id))
}

/// Update MCP metadata (category, tags, enabled status)
#[tauri::command]
pub fn update_mcp_metadata(
    mcp_id: String,
    category: Option<String>,
    tags: Option<Vec<String>>,
    enabled: Option<bool>,
) -> Result<(), String> {
    let data_path = get_data_file_path();

    let mut app_data: crate::types::AppData = if data_path.exists() {
        let content = fs::read_to_string(&data_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        crate::types::AppData::default()
    };

    let metadata = app_data
        .mcp_metadata
        .entry(mcp_id)
        .or_insert_with(McpMetadata::default);

    if let Some(cat) = category {
        metadata.category = cat;
    }
    if let Some(t) = tags {
        metadata.tags = t;
    }
    if let Some(e) = enabled {
        metadata.enabled = e;
    }

    // Ensure directory exists
    if let Some(parent) = data_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let json = serde_json::to_string_pretty(&app_data).map_err(|e| e.to_string())?;
    fs::write(&data_path, json).map_err(|e| e.to_string())?;

    Ok(())
}

fn parse_mcp_file(
    file_path: &std::path::Path,
    metadata_map: &std::collections::HashMap<String, McpMetadata>,
) -> Result<McpServer, String> {
    let content = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
    let config: McpConfigFile = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    // Generate ID from path
    let id = file_path.to_string_lossy().to_string();

    // Get metadata if exists
    let metadata = metadata_map.get(&id);

    // Get installed_at from file creation time
    let installed_at = fs::metadata(file_path)
        .ok()
        .and_then(|m| m.created().ok())
        .map(|t| {
            let datetime: chrono::DateTime<chrono::Utc> = t.into();
            datetime.to_rfc3339()
        });

    let mcp = McpServer {
        id: id.clone(),
        name: config.name,
        description: config.description.unwrap_or_default(),
        category: metadata.map(|m| m.category.clone()).unwrap_or_default(),
        tags: metadata.map(|m| m.tags.clone()).unwrap_or_default(),
        enabled: metadata.map(|m| m.enabled).unwrap_or(true),
        source_path: file_path.to_string_lossy().to_string(),
        scope: metadata.map(|m| m.scope.clone()).unwrap_or_else(|| "project".to_string()),
        command: config.command,
        args: config.args.unwrap_or_default(),
        env: config.env,
        provided_tools: config.provided_tools.unwrap_or_default(),
        created_at: chrono::Utc::now().to_rfc3339(),
        last_used: metadata.and_then(|m| m.last_used.clone()),
        usage_count: metadata.map(|m| m.usage_count).unwrap_or(0),
        installed_at,
    };

    Ok(mcp)
}

fn load_mcp_metadata() -> std::collections::HashMap<String, McpMetadata> {
    let data_path = get_data_file_path();
    if data_path.exists() {
        if let Ok(content) = fs::read_to_string(&data_path) {
            if let Ok(app_data) = serde_json::from_str::<crate::types::AppData>(&content) {
                return app_data.mcp_metadata;
            }
        }
    }
    std::collections::HashMap::new()
}

// ============================================================================
// MCP Tools Fetch Implementation
// ============================================================================

/// JSON-RPC response structure for MCP communication
#[derive(Debug, serde::Deserialize)]
struct JsonRpcResponse {
    #[allow(dead_code)]
    jsonrpc: String,
    #[allow(dead_code)]
    id: Option<u64>,
    result: Option<serde_json::Value>,
    error: Option<JsonRpcError>,
}

#[derive(Debug, serde::Deserialize)]
struct JsonRpcError {
    #[allow(dead_code)]
    code: i64,
    message: String,
}

/// Fetch tools from an MCP server by starting it and querying tools/list
///
/// This command:
/// 1. Starts the MCP server as a child process
/// 2. Sends initialize request via JSON-RPC
/// 3. Receives initialize response and sends initialized notification
/// 4. Sends tools/list request
/// 5. Parses and returns the tools
/// 6. Gracefully shuts down the server
#[tauri::command]
pub async fn fetch_mcp_tools(
    command: String,
    args: Vec<String>,
    env: Option<HashMap<String, String>>,
    timeout_ms: Option<u64>,
) -> Result<FetchMcpToolsResult, String> {
    let timeout_duration = Duration::from_millis(timeout_ms.unwrap_or(15000));

    // Build the command
    let mut cmd = TokioCommand::new(&command);
    cmd.args(&args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .kill_on_drop(true); // Ensure process is terminated when dropped

    // Inherit current environment and add custom env vars
    cmd.envs(std::env::vars());
    if let Some(env_vars) = &env {
        for (key, value) in env_vars {
            cmd.env(key, value);
        }
    }

    // Spawn the child process
    let mut child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) => {
            return Ok(FetchMcpToolsResult {
                success: false,
                tools: vec![],
                error: Some(format!("Failed to spawn MCP server '{}': {}", command, e)),
                server_info: None,
            });
        }
    };

    let stdin = match child.stdin.take() {
        Some(s) => s,
        None => {
            let _ = child.kill().await;
            return Ok(FetchMcpToolsResult {
                success: false,
                tools: vec![],
                error: Some("Failed to get stdin of MCP server process".to_string()),
                server_info: None,
            });
        }
    };

    let stdout = match child.stdout.take() {
        Some(s) => s,
        None => {
            let _ = child.kill().await;
            return Ok(FetchMcpToolsResult {
                success: false,
                tools: vec![],
                error: Some("Failed to get stdout of MCP server process".to_string()),
                server_info: None,
            });
        }
    };

    let mut stdin = stdin;
    let mut reader = BufReader::new(stdout).lines();

    // Wrap the entire communication in a timeout
    let result = timeout(timeout_duration, async {
        // Step 1: Send initialize request
        let init_request = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "roots": { "listChanged": true }
                },
                "clientInfo": {
                    "name": "Ensemble",
                    "version": "1.0.0"
                }
            }
        });

        let init_json = serde_json::to_string(&init_request)
            .map_err(|e| format!("Failed to serialize initialize request: {}", e))?;

        stdin.write_all(init_json.as_bytes()).await
            .map_err(|e| format!("Failed to write initialize request: {}", e))?;
        stdin.write_all(b"\n").await
            .map_err(|e| format!("Failed to write newline: {}", e))?;
        stdin.flush().await
            .map_err(|e| format!("Failed to flush: {}", e))?;

        // Step 2: Read initialize response
        let init_response_line = reader.next_line().await
            .map_err(|e| format!("Failed to read initialize response: {}", e))?
            .ok_or("No response from MCP server")?;

        let init_response: JsonRpcResponse = serde_json::from_str(&init_response_line)
            .map_err(|e| format!("Failed to parse initialize response: {} (raw: {})", e, init_response_line))?;

        if let Some(error) = init_response.error {
            return Err(format!("Initialize error: {}", error.message));
        }

        // Parse server info from initialize response
        let server_info = init_response.result
            .as_ref()
            .and_then(|r| r.get("serverInfo"))
            .map(|si| McpServerRuntimeInfo {
                name: si.get("name").and_then(|n| n.as_str()).unwrap_or("unknown").to_string(),
                version: si.get("version").and_then(|v| v.as_str()).map(|s| s.to_string()),
            });

        // Step 3: Send initialized notification (no id, it's a notification)
        let initialized_notification = serde_json::json!({
            "jsonrpc": "2.0",
            "method": "notifications/initialized"
        });

        let notif_json = serde_json::to_string(&initialized_notification)
            .map_err(|e| format!("Failed to serialize initialized notification: {}", e))?;

        stdin.write_all(notif_json.as_bytes()).await
            .map_err(|e| format!("Failed to write initialized notification: {}", e))?;
        stdin.write_all(b"\n").await
            .map_err(|e| format!("Failed to write newline: {}", e))?;
        stdin.flush().await
            .map_err(|e| format!("Failed to flush: {}", e))?;

        // Step 4: Send tools/list request
        let tools_request = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list",
            "params": {}
        });

        let tools_json = serde_json::to_string(&tools_request)
            .map_err(|e| format!("Failed to serialize tools/list request: {}", e))?;

        stdin.write_all(tools_json.as_bytes()).await
            .map_err(|e| format!("Failed to write tools/list request: {}", e))?;
        stdin.write_all(b"\n").await
            .map_err(|e| format!("Failed to write newline: {}", e))?;
        stdin.flush().await
            .map_err(|e| format!("Failed to flush: {}", e))?;

        // Step 5: Read tools/list response
        let tools_response_line = reader.next_line().await
            .map_err(|e| format!("Failed to read tools/list response: {}", e))?
            .ok_or("No tools response from MCP server")?;

        let tools_response: JsonRpcResponse = serde_json::from_str(&tools_response_line)
            .map_err(|e| format!("Failed to parse tools/list response: {} (raw: {})", e, tools_response_line))?;

        if let Some(error) = tools_response.error {
            return Err(format!("tools/list error: {}", error.message));
        }

        // Step 6: Parse tools from response
        let tools: Vec<McpToolInfo> = tools_response.result
            .and_then(|r| r.get("tools").cloned())
            .and_then(|t| serde_json::from_value(t).ok())
            .unwrap_or_default();

        Ok::<_, String>(FetchMcpToolsResult {
            success: true,
            tools,
            error: None,
            server_info,
        })
    })
    .await;

    // Ensure child process is terminated
    let _ = child.kill().await;

    match result {
        Ok(Ok(result)) => Ok(result),
        Ok(Err(e)) => Ok(FetchMcpToolsResult {
            success: false,
            tools: vec![],
            error: Some(e),
            server_info: None,
        }),
        Err(_) => Ok(FetchMcpToolsResult {
            success: false,
            tools: vec![],
            error: Some(format!("Operation timed out after {}ms", timeout_ms.unwrap_or(15000))),
            server_info: None,
        }),
    }
}

/// Delete an MCP by moving it to the trash directory
///
/// Instead of permanently deleting, moves the MCP config to ~/.ensemble/trash/mcps/
/// for easy recovery if needed.
#[tauri::command]
pub fn delete_mcp(mcp_id: String, ensemble_dir: String) -> Result<(), String> {
    let ensemble_path = expand_path(&ensemble_dir);
    let mcp_path = std::path::Path::new(&mcp_id);

    // Verify the MCP config file exists
    if !mcp_path.exists() {
        return Err(format!("MCP config not found: {}", mcp_id));
    }

    // Get MCP name from path
    let mcp_name = mcp_path
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or("Invalid MCP path")?;

    // Create trash directory
    let trash_dir = ensemble_path.join("trash").join("mcps");
    fs::create_dir_all(&trash_dir)
        .map_err(|e| format!("Failed to create trash directory: {}", e))?;

    // Generate unique destination path (add timestamp if exists)
    let mut dest_path = trash_dir.join(mcp_name);
    if dest_path.exists() {
        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
        let name_without_ext = mcp_name.trim_end_matches(".json");
        dest_path = trash_dir.join(format!("{}_{}.json", name_without_ext, timestamp));
    }

    // Move MCP config to trash
    fs::rename(mcp_path, &dest_path)
        .map_err(|e| format!("Failed to move MCP to trash: {}", e))?;

    // Remove metadata for this MCP
    let data_path = get_data_file_path();
    if data_path.exists() {
        if let Ok(content) = fs::read_to_string(&data_path) {
            if let Ok(mut app_data) = serde_json::from_str::<crate::types::AppData>(&content) {
                app_data.mcp_metadata.remove(&mcp_id);
                if let Ok(json) = serde_json::to_string_pretty(&app_data) {
                    let _ = fs::write(&data_path, json);
                }
            }
        }
    }

    Ok(())
}
