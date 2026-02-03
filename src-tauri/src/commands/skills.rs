use crate::types::{Skill, SkillMetadata};
use crate::utils::{expand_path, get_data_file_path, parse_skill_md};
use std::fs;

/// Scan skills directory and return list of skills
///
/// Supports both regular directories and symlinked skill directories
#[tauri::command]
pub fn scan_skills(source_dir: String) -> Result<Vec<Skill>, String> {
    let path = expand_path(&source_dir);

    if !path.exists() {
        return Ok(Vec::new());
    }

    let mut skills = Vec::new();
    let metadata_map = load_skill_metadata();

    // Use fs::read_dir to properly handle symlinks and avoid duplicates
    // WalkDir with max_depth(2) would process both the directory and SKILL.md file,
    // causing each skill to be added twice
    if let Ok(entries) = fs::read_dir(&path) {
        for entry in entries.filter_map(|e| e.ok()) {
            let entry_path = entry.path();

            // Skip hidden files/directories
            if entry_path.file_name()
                .map(|n| n.to_string_lossy().starts_with('.'))
                .unwrap_or(true)
            {
                continue;
            }

            // Check if it's a directory (follows symlinks)
            if !entry_path.is_dir() {
                continue;
            }

            // Check for SKILL.md in the directory
            let skill_md_path = entry_path.join("SKILL.md");
            if skill_md_path.exists() {
                if let Ok(skill) = parse_skill_file(&skill_md_path, &metadata_map) {
                    skills.push(skill);
                }
            }
        }
    }

    Ok(skills)
}

/// Get a single skill by ID
#[tauri::command]
pub fn get_skill(source_dir: String, skill_id: String) -> Result<Option<Skill>, String> {
    let skills = scan_skills(source_dir)?;
    Ok(skills.into_iter().find(|s| s.id == skill_id))
}

/// Update skill metadata (category, tags, enabled status, icon)
#[tauri::command]
pub fn update_skill_metadata(
    skill_id: String,
    category: Option<String>,
    tags: Option<Vec<String>>,
    enabled: Option<bool>,
    icon: Option<String>,
) -> Result<(), String> {
    let data_path = get_data_file_path();

    let mut app_data: crate::types::AppData = if data_path.exists() {
        let content = fs::read_to_string(&data_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        crate::types::AppData::default()
    };

    let metadata = app_data
        .skill_metadata
        .entry(skill_id)
        .or_insert_with(SkillMetadata::default);

    if let Some(cat) = category {
        metadata.category = cat;
    }
    if let Some(t) = tags {
        metadata.tags = t;
    }
    if let Some(e) = enabled {
        metadata.enabled = e;
    }
    if let Some(i) = icon {
        metadata.icon = Some(i);
    }

    // Ensure directory exists
    if let Some(parent) = data_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let json = serde_json::to_string_pretty(&app_data).map_err(|e| e.to_string())?;
    fs::write(&data_path, json).map_err(|e| e.to_string())?;

    Ok(())
}

fn parse_skill_file(
    skill_md_path: &std::path::Path,
    metadata_map: &std::collections::HashMap<String, SkillMetadata>,
) -> Result<Skill, String> {
    let content = fs::read_to_string(skill_md_path).map_err(|e| e.to_string())?;
    let (frontmatter, instructions) = parse_skill_md(&content);

    // Get skill directory (parent of SKILL.md)
    let skill_dir = skill_md_path.parent().unwrap_or(skill_md_path);
    let skill_name = skill_dir
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    // Generate ID from path
    let id = skill_dir.to_string_lossy().to_string();

    // Get metadata if exists
    let metadata = metadata_map.get(&id);

    // Clone name before moving it
    let name = frontmatter.name.clone().unwrap_or(skill_name);
    let invocation = frontmatter.name.clone();

    // Get installed_at from directory creation time
    let installed_at = fs::metadata(skill_dir)
        .ok()
        .and_then(|m| m.created().ok())
        .map(|t| {
            let datetime: chrono::DateTime<chrono::Utc> = t.into();
            datetime.to_rfc3339()
        });

    let skill = Skill {
        id: id.clone(),
        name,
        description: frontmatter.description.unwrap_or_default(),
        category: metadata.map(|m| m.category.clone()).unwrap_or_default(),
        tags: metadata.map(|m| m.tags.clone()).unwrap_or_default(),
        enabled: metadata.map(|m| m.enabled).unwrap_or(true),
        source_path: skill_dir.to_string_lossy().to_string(),
        scope: "user".to_string(),
        invocation,
        allowed_tools: frontmatter.allowed_tools,
        instructions,
        created_at: chrono::Utc::now().to_rfc3339(),
        last_used: metadata.and_then(|m| m.last_used.clone()),
        usage_count: metadata.map(|m| m.usage_count).unwrap_or(0),
        icon: metadata.and_then(|m| m.icon.clone()),
        installed_at,
    };

    Ok(skill)
}

fn load_skill_metadata() -> std::collections::HashMap<String, SkillMetadata> {
    let data_path = get_data_file_path();
    if data_path.exists() {
        if let Ok(content) = fs::read_to_string(&data_path) {
            if let Ok(app_data) = serde_json::from_str::<crate::types::AppData>(&content) {
                return app_data.skill_metadata;
            }
        }
    }
    std::collections::HashMap::new()
}

/// Delete a skill by moving it to the trash directory
///
/// Instead of permanently deleting, moves the skill to ~/.ensemble/trash/skills/
/// for easy recovery if needed.
#[tauri::command]
pub fn delete_skill(skill_id: String, ensemble_dir: String) -> Result<(), String> {
    let ensemble_path = expand_path(&ensemble_dir);
    let skill_path = std::path::Path::new(&skill_id);

    // Verify the skill exists
    if !skill_path.exists() {
        return Err(format!("Skill not found: {}", skill_id));
    }

    // Get skill name from path
    let skill_name = skill_path
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or("Invalid skill path")?;

    // Create trash directory
    let trash_dir = ensemble_path.join("trash").join("skills");
    fs::create_dir_all(&trash_dir)
        .map_err(|e| format!("Failed to create trash directory: {}", e))?;

    // Generate unique destination path (add timestamp if exists)
    let mut dest_path = trash_dir.join(skill_name);
    if dest_path.exists() {
        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
        dest_path = trash_dir.join(format!("{}_{}", skill_name, timestamp));
    }

    // Move skill to trash
    fs::rename(skill_path, &dest_path)
        .map_err(|e| format!("Failed to move skill to trash: {}", e))?;

    // Remove metadata for this skill
    let data_path = get_data_file_path();
    if data_path.exists() {
        if let Ok(content) = fs::read_to_string(&data_path) {
            if let Ok(mut app_data) = serde_json::from_str::<crate::types::AppData>(&content) {
                app_data.skill_metadata.remove(&skill_id);
                if let Ok(json) = serde_json::to_string_pretty(&app_data) {
                    let _ = fs::write(&data_path, json);
                }
            }
        }
    }

    Ok(())
}
