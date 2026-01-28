use crate::types::{Skill, SkillMetadata};
use crate::utils::{expand_path, get_data_file_path, parse_skill_md};
use std::fs;
use walkdir::WalkDir;

/// Scan skills directory and return list of skills
#[tauri::command]
pub fn scan_skills(source_dir: String) -> Result<Vec<Skill>, String> {
    let path = expand_path(&source_dir);
    
    if !path.exists() {
        return Ok(Vec::new());
    }

    let mut skills = Vec::new();
    let metadata_map = load_skill_metadata();

    for entry in WalkDir::new(&path)
        .min_depth(1)
        .max_depth(2)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let skill_md_path = if entry.file_type().is_dir() {
            entry.path().join("SKILL.md")
        } else if entry.file_name() == "SKILL.md" {
            entry.path().to_path_buf()
        } else {
            continue;
        };

        if skill_md_path.exists() {
            if let Ok(skill) = parse_skill_file(&skill_md_path, &metadata_map) {
                skills.push(skill);
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

/// Update skill metadata (category, tags, enabled status)
#[tauri::command]
pub fn update_skill_metadata(
    skill_id: String,
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
