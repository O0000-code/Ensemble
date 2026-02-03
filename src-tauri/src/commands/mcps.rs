use crate::types::{McpConfigFile, McpMetadata, McpServer};
use crate::utils::{expand_path, get_data_file_path};
use std::fs;
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
