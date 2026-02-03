use crate::types::{AppData, AppSettings, Category, Project, Scene, Tag, TrashedProject, TrashedScene};
use crate::utils::{ensure_dir, get_app_data_dir, get_data_file_path, get_settings_file_path};
use std::fs;
use uuid::Uuid;

/// Read application data
#[tauri::command]
pub fn read_app_data() -> Result<AppData, String> {
    let data_path = get_data_file_path();

    if data_path.exists() {
        let content = fs::read_to_string(&data_path).map_err(|e| e.to_string())?;
        let data: AppData = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        Ok(data)
    } else {
        Ok(AppData::default())
    }
}

/// Write application data
#[tauri::command]
pub fn write_app_data(data: AppData) -> Result<(), String> {
    let data_path = get_data_file_path();

    // Ensure directory exists
    if let Some(parent) = data_path.parent() {
        ensure_dir(parent).map_err(|e| e.to_string())?;
    }

    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::write(&data_path, json).map_err(|e| e.to_string())?;

    Ok(())
}

/// Read application settings
#[tauri::command]
pub fn read_settings() -> Result<AppSettings, String> {
    let settings_path = get_settings_file_path();

    if settings_path.exists() {
        let content = fs::read_to_string(&settings_path).map_err(|e| e.to_string())?;
        let settings: AppSettings = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        Ok(settings)
    } else {
        Ok(AppSettings::default())
    }
}

/// Write application settings
#[tauri::command]
pub fn write_settings(settings: AppSettings) -> Result<(), String> {
    let settings_path = get_settings_file_path();

    // Ensure directory exists
    if let Some(parent) = settings_path.parent() {
        ensure_dir(parent).map_err(|e| e.to_string())?;
    }

    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(&settings_path, json).map_err(|e| e.to_string())?;

    Ok(())
}

/// Initialize application data directory and default data
#[tauri::command]
pub fn init_app_data() -> Result<(), String> {
    let app_dir = get_app_data_dir();
    ensure_dir(&app_dir).map_err(|e| e.to_string())?;

    // Create skills directory
    let skills_dir = app_dir.join("skills");
    ensure_dir(&skills_dir).map_err(|e| e.to_string())?;

    // Create mcps directory
    let mcps_dir = app_dir.join("mcps");
    ensure_dir(&mcps_dir).map_err(|e| e.to_string())?;

    // Initialize data.json if not exists
    let data_path = get_data_file_path();
    if !data_path.exists() {
        let default_data = AppData {
            categories: vec![
                Category {
                    id: Uuid::new_v4().to_string(),
                    name: "Development".to_string(),
                    color: "#3B82F6".to_string(),
                    count: 0,
                },
                Category {
                    id: Uuid::new_v4().to_string(),
                    name: "Writing".to_string(),
                    color: "#10B981".to_string(),
                    count: 0,
                },
                Category {
                    id: Uuid::new_v4().to_string(),
                    name: "Analysis".to_string(),
                    color: "#F59E0B".to_string(),
                    count: 0,
                },
            ],
            tags: vec![],
            scenes: vec![],
            projects: vec![],
            skill_metadata: std::collections::HashMap::new(),
            mcp_metadata: std::collections::HashMap::new(),
            trashed_scenes: vec![],
            trashed_projects: vec![],
        };
        write_app_data(default_data)?;
    }

    // Initialize settings.json if not exists
    let settings_path = get_settings_file_path();
    if !settings_path.exists() {
        write_settings(AppSettings::default())?;
    }

    Ok(())
}

// ============ Categories ============

/// Get all categories
#[tauri::command]
pub fn get_categories() -> Result<Vec<Category>, String> {
    let data = read_app_data()?;
    Ok(data.categories)
}

/// Add a new category
#[tauri::command]
pub fn add_category(name: String, color: String) -> Result<Category, String> {
    let mut data = read_app_data()?;

    let category = Category {
        id: Uuid::new_v4().to_string(),
        name,
        color,
        count: 0,
    };

    data.categories.push(category.clone());
    write_app_data(data)?;

    Ok(category)
}

/// Update a category
#[tauri::command]
pub fn update_category(id: String, name: Option<String>, color: Option<String>) -> Result<(), String> {
    let mut data = read_app_data()?;

    if let Some(category) = data.categories.iter_mut().find(|c| c.id == id) {
        if let Some(n) = name {
            category.name = n;
        }
        if let Some(c) = color {
            category.color = c;
        }
        write_app_data(data)?;
        Ok(())
    } else {
        Err("Category not found".to_string())
    }
}

/// Delete a category
#[tauri::command]
pub fn delete_category(id: String) -> Result<(), String> {
    let mut data = read_app_data()?;
    data.categories.retain(|c| c.id != id);
    write_app_data(data)?;
    Ok(())
}

// ============ Tags ============

/// Get all tags
#[tauri::command]
pub fn get_tags() -> Result<Vec<Tag>, String> {
    let data = read_app_data()?;
    Ok(data.tags)
}

/// Add a new tag
#[tauri::command]
pub fn add_tag(name: String) -> Result<Tag, String> {
    let mut data = read_app_data()?;

    let tag = Tag {
        id: Uuid::new_v4().to_string(),
        name,
        count: 0,
    };

    data.tags.push(tag.clone());
    write_app_data(data)?;

    Ok(tag)
}

/// Update a tag
#[tauri::command]
pub fn update_tag(id: String, name: String) -> Result<(), String> {
    let mut data = read_app_data()?;

    if let Some(tag) = data.tags.iter_mut().find(|t| t.id == id) {
        tag.name = name;
        write_app_data(data)?;
        Ok(())
    } else {
        Err("Tag not found".to_string())
    }
}

/// Delete a tag
#[tauri::command]
pub fn delete_tag(id: String) -> Result<(), String> {
    let mut data = read_app_data()?;
    data.tags.retain(|t| t.id != id);
    write_app_data(data)?;
    Ok(())
}

// ============ Scenes ============

/// Get all scenes
#[tauri::command]
pub fn get_scenes() -> Result<Vec<Scene>, String> {
    let data = read_app_data()?;
    Ok(data.scenes)
}

/// Add a new scene
#[tauri::command]
#[allow(non_snake_case)]
pub fn add_scene(
    name: String,
    description: String,
    icon: String,
    skillIds: Vec<String>,
    mcpIds: Vec<String>,
) -> Result<Scene, String> {
    println!("add_scene called: name={}, skillIds={:?}, mcpIds={:?}", name, skillIds, mcpIds);
    let mut data = read_app_data()?;
    println!("Current scenes count: {}", data.scenes.len());

    let scene = Scene {
        id: Uuid::new_v4().to_string(),
        name,
        description,
        icon,
        skill_ids: skillIds,
        mcp_ids: mcpIds,
        created_at: chrono::Utc::now().to_rfc3339(),
        last_used: None,
    };

    data.scenes.push(scene.clone());
    write_app_data(data)?;

    Ok(scene)
}

/// Update a scene
#[tauri::command]
pub fn update_scene(
    id: String,
    name: Option<String>,
    description: Option<String>,
    icon: Option<String>,
    skill_ids: Option<Vec<String>>,
    mcp_ids: Option<Vec<String>>,
) -> Result<(), String> {
    let mut data = read_app_data()?;

    if let Some(scene) = data.scenes.iter_mut().find(|s| s.id == id) {
        if let Some(n) = name {
            scene.name = n;
        }
        if let Some(d) = description {
            scene.description = d;
        }
        if let Some(i) = icon {
            scene.icon = i;
        }
        if let Some(s) = skill_ids {
            scene.skill_ids = s;
        }
        if let Some(m) = mcp_ids {
            scene.mcp_ids = m;
        }
        write_app_data(data)?;
        Ok(())
    } else {
        Err("Scene not found".to_string())
    }
}

/// Delete a scene (soft delete - moves to trashed_scenes)
#[tauri::command]
pub fn delete_scene(id: String) -> Result<(), String> {
    let mut data = read_app_data()?;

    // Find and remove the scene from active scenes
    if let Some(index) = data.scenes.iter().position(|s| s.id == id) {
        let scene = data.scenes.remove(index);

        // Create TrashedScene with deleted_at timestamp
        let trashed_scene = TrashedScene {
            id: scene.id,
            name: scene.name,
            description: scene.description,
            icon: scene.icon,
            skill_ids: scene.skill_ids,
            mcp_ids: scene.mcp_ids,
            created_at: scene.created_at,
            last_used: scene.last_used,
            deleted_at: chrono::Utc::now().to_rfc3339(),
        };

        data.trashed_scenes.push(trashed_scene);
    }

    write_app_data(data)?;
    Ok(())
}

// ============ Projects ============

/// Get all projects
#[tauri::command]
pub fn get_projects() -> Result<Vec<Project>, String> {
    let data = read_app_data()?;
    Ok(data.projects)
}

/// Add a new project
#[tauri::command]
#[allow(non_snake_case)]
pub fn add_project(name: String, path: String, sceneId: Option<String>) -> Result<Project, String> {
    let mut data = read_app_data()?;

    let project = Project {
        id: Uuid::new_v4().to_string(),
        name,
        path,
        scene_id: sceneId.unwrap_or_default(),
        last_synced: None,
    };

    data.projects.push(project.clone());
    write_app_data(data)?;

    Ok(project)
}

/// Update a project
#[tauri::command]
#[allow(non_snake_case)]
pub fn update_project(
    id: String,
    name: Option<String>,
    path: Option<String>,
    sceneId: Option<String>,
    lastSynced: Option<String>,
) -> Result<(), String> {
    let mut data = read_app_data()?;

    if let Some(project) = data.projects.iter_mut().find(|p| p.id == id) {
        if let Some(n) = name {
            project.name = n;
        }
        if let Some(p) = path {
            project.path = p;
        }
        if let Some(s) = sceneId {
            project.scene_id = s;
        }
        if let Some(l) = lastSynced {
            project.last_synced = Some(l);
        }
        write_app_data(data)?;
        Ok(())
    } else {
        Err("Project not found".to_string())
    }
}

/// Delete a project (soft delete - moves to trashed_projects)
#[tauri::command]
pub fn delete_project(id: String) -> Result<(), String> {
    let mut data = read_app_data()?;

    // Find and remove the project from active projects
    if let Some(index) = data.projects.iter().position(|p| p.id == id) {
        let project = data.projects.remove(index);

        // Create TrashedProject with deleted_at timestamp
        let trashed_project = TrashedProject {
            id: project.id,
            name: project.name,
            path: project.path,
            scene_id: project.scene_id,
            last_synced: project.last_synced,
            deleted_at: chrono::Utc::now().to_rfc3339(),
        };

        data.trashed_projects.push(trashed_project);
    }

    write_app_data(data)?;
    Ok(())
}
