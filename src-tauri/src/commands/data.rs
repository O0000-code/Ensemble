use crate::types::{AppData, AppSettings, Category, Project, Scene, Tag, TrashedProject, TrashedScene};
use crate::utils::{ensure_dir, get_app_data_dir, get_data_file_path, get_settings_file_path};
use std::fs;
use std::sync::Mutex;
use uuid::Uuid;

/// Global mutex protecting all read-modify-write operations on `data.json`.
///
/// Tauri commands run on independent tokio tasks; without this lock,
/// concurrent `reorder_categories` + `add_category` invocations can lose
/// updates (T1 reads stale data, T2 writes its own version, T1 writes
/// overwriting T2). All mutating commands acquire this guard at their
/// outermost scope before calling `read_app_data` / `write_app_data`.
///
/// Pure read commands (`get_categories`, `get_tags`, ...) do not acquire
/// the lock so reads can run concurrently with one another.
pub static DATA_MUTEX: Mutex<()> = Mutex::new(());

/// Trait for items keyed by a string `id` (Category, Tag, ...).
/// Used by [`apply_reorder`] to look items up while reordering.
pub trait HasId {
    fn id(&self) -> &str;
}

impl HasId for Category {
    fn id(&self) -> &str {
        &self.id
    }
}

impl HasId for Tag {
    fn id(&self) -> &str {
        &self.id
    }
}

/// Pure function: reorder a `Vec<T>` so that ids in `ordered_ids` come first
/// in the given order, with any remaining items appended in their original
/// relative order.
///
/// Semantics:
/// - Ids in `ordered_ids` that exist in `items` are placed first in that order.
/// - Items not mentioned in `ordered_ids` are appended in their **original**
///   `Vec` order — preserving "newly-added items remain at end" semantics.
/// - Unknown ids in `ordered_ids` are silently skipped.
/// - Duplicate ids in `ordered_ids` are deduplicated (first occurrence wins).
///
/// Implementation note: we snapshot the original `Vec` order **before** moving
/// items into a `HashMap`, because `HashMap` iteration order is undefined and
/// would otherwise produce non-deterministic ordering for trailing items.
pub fn apply_reorder<T: HasId>(items: Vec<T>, ordered_ids: &[String]) -> Vec<T> {
    use std::collections::{HashMap, HashSet};

    // Snapshot original order BEFORE moving items into the HashMap.
    let original_order: Vec<String> = items.iter().map(|i| i.id().to_string()).collect();

    // Move items into a HashMap for O(1) extraction by id.
    let mut by_id: HashMap<String, T> = items
        .into_iter()
        .map(|i| (i.id().to_string(), i))
        .collect();

    let mut result: Vec<T> = Vec::with_capacity(by_id.len());
    let mut seen: HashSet<String> = HashSet::new();

    // Pass 1: emit items in the requested order, dedup via `seen`, skip unknowns.
    for id in ordered_ids {
        if seen.contains(id) {
            continue;
        }
        if let Some(item) = by_id.remove(id) {
            seen.insert(id.clone());
            result.push(item);
        }
    }

    // Pass 2: append remaining items in *original_order* (deterministic),
    // not via HashMap iteration.
    for id in &original_order {
        if let Some(item) = by_id.remove(id) {
            result.push(item);
        }
    }

    result
}

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
            imported_plugin_skills: vec![],
            imported_plugin_mcps: vec![],
            claude_md_files: vec![],
            global_claude_md_id: None,
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
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
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
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
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
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
    let mut data = read_app_data()?;
    data.categories.retain(|c| c.id != id);
    write_app_data(data)?;
    Ok(())
}

/// Reorder categories. Returns the resulting `Vec<Category>` for client-side
/// calibration: the front-end performs an optimistic update before this IPC
/// returns, then reconciles with the canonical backend order.
#[tauri::command]
#[allow(non_snake_case)]
pub fn reorder_categories(orderedIds: Vec<String>) -> Result<Vec<Category>, String> {
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
    let mut data = read_app_data()?;
    data.categories = apply_reorder(data.categories, &orderedIds);
    let result = data.categories.clone();
    write_app_data(data)?;
    Ok(result)
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
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
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
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
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
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
    let mut data = read_app_data()?;
    data.tags.retain(|t| t.id != id);
    write_app_data(data)?;
    Ok(())
}

/// Reorder tags. Returns the resulting `Vec<Tag>` for client-side calibration.
#[tauri::command]
#[allow(non_snake_case)]
pub fn reorder_tags(orderedIds: Vec<String>) -> Result<Vec<Tag>, String> {
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
    let mut data = read_app_data()?;
    data.tags = apply_reorder(data.tags, &orderedIds);
    let result = data.tags.clone();
    write_app_data(data)?;
    Ok(result)
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
    claudeMdIds: Option<Vec<String>>,
) -> Result<Scene, String> {
    println!("add_scene called: name={}, skillIds={:?}, mcpIds={:?}, claudeMdIds={:?}", name, skillIds, mcpIds, claudeMdIds);
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
    let mut data = read_app_data()?;
    println!("Current scenes count: {}", data.scenes.len());

    let scene = Scene {
        id: Uuid::new_v4().to_string(),
        name,
        description,
        icon,
        skill_ids: skillIds,
        mcp_ids: mcpIds,
        claude_md_ids: claudeMdIds.unwrap_or_default(),
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
    claude_md_ids: Option<Vec<String>>,
) -> Result<(), String> {
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
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
        if let Some(c) = claude_md_ids {
            scene.claude_md_ids = c;
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
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
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
            claude_md_ids: scene.claude_md_ids,
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
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
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
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
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
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
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

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod apply_reorder_tests {
    use super::*;

    fn cat(id: &str) -> Category {
        Category {
            id: id.to_string(),
            name: id.to_string(),
            color: "#000000".to_string(),
            count: 0,
        }
    }

    fn ids(cs: &[Category]) -> Vec<&str> {
        cs.iter().map(|c| c.id.as_str()).collect()
    }

    fn s(v: &[&str]) -> Vec<String> {
        v.iter().map(|x| x.to_string()).collect()
    }

    #[test]
    fn basic_reorder() {
        let items = vec![cat("A"), cat("B"), cat("C")];
        let out = apply_reorder(items, &s(&["C", "A", "B"]));
        assert_eq!(ids(&out), vec!["C", "A", "B"]);
    }

    #[test]
    fn empty_ordered_ids_appends_all_in_original_order() {
        let items = vec![cat("A"), cat("B"), cat("C")];
        let out = apply_reorder(items, &s(&[]));
        assert_eq!(ids(&out), vec!["A", "B", "C"]);
    }

    #[test]
    fn partial_ordered_ids_appends_remainder_in_original_order() {
        let items = vec![cat("A"), cat("B"), cat("C")];
        let out = apply_reorder(items, &s(&["B"]));
        // B first (mentioned), then A and C in original Vec order.
        assert_eq!(ids(&out), vec!["B", "A", "C"]);
    }

    #[test]
    fn unknown_ids_silently_skipped() {
        let items = vec![cat("A"), cat("B"), cat("C")];
        let out = apply_reorder(items, &s(&["A", "X", "B", "C"]));
        // X is unknown: silently skipped. Result is A, B, C in given order.
        assert_eq!(ids(&out), vec!["A", "B", "C"]);
    }

    #[test]
    fn duplicate_ids_deduplicated_first_wins() {
        let items = vec![cat("A"), cat("B"), cat("C")];
        let out = apply_reorder(items, &s(&["A", "A", "B", "C"]));
        // Second "A" deduped (first occurrence wins).
        assert_eq!(ids(&out), vec!["A", "B", "C"]);
    }

    #[test]
    fn preserves_original_order_for_unmentioned_items() {
        let items = vec![cat("A"), cat("B"), cat("C"), cat("D")];
        let out = apply_reorder(items, &s(&["D", "B"]));
        // D, B (mentioned), then A, C in their original Vec order.
        assert_eq!(ids(&out), vec!["D", "B", "A", "C"]);
    }

    #[test]
    fn works_for_tags_too() {
        // HasId is implemented for Tag too — sanity-check the generic.
        let items = vec![
            Tag { id: "t1".into(), name: "one".into(), count: 0 },
            Tag { id: "t2".into(), name: "two".into(), count: 0 },
            Tag { id: "t3".into(), name: "three".into(), count: 0 },
        ];
        let out = apply_reorder(items, &s(&["t3", "t1"]));
        let out_ids: Vec<&str> = out.iter().map(|t| t.id.as_str()).collect();
        assert_eq!(out_ids, vec!["t3", "t1", "t2"]);
    }
}

#[cfg(test)]
mod reorder_integration_tests {
    use super::*;
    use crate::utils::path::ENV_TEST_LOCK;
    use tempfile::TempDir;

    /// Test fixture: scope an `ENSEMBLE_DATA_DIR` override to a TempDir for the
    /// duration of the test. Restores the prior value (or removes the var) on
    /// drop. Acquires the crate-wide [`ENV_TEST_LOCK`] (defined in
    /// `utils::path`) so it serialises with every other test that touches the
    /// env var — without that single shared lock, tests across modules race.
    struct ScopedDataDir {
        _tempdir: TempDir,
        prior: Option<String>,
        _guard: std::sync::MutexGuard<'static, ()>,
    }

    impl ScopedDataDir {
        fn new() -> Self {
            // Acquire the lock first to serialise env mutation. If a prior
            // test panicked while holding the lock, recover the inner guard
            // (the env state may be dirty but ScopedDataDir overwrites it).
            let guard = ENV_TEST_LOCK.lock().unwrap_or_else(|e| e.into_inner());
            let prior = std::env::var("ENSEMBLE_DATA_DIR").ok();
            let tempdir = TempDir::new().expect("create tempdir");
            std::env::set_var("ENSEMBLE_DATA_DIR", tempdir.path());
            Self {
                _tempdir: tempdir,
                prior,
                _guard: guard,
            }
        }
    }

    impl Drop for ScopedDataDir {
        fn drop(&mut self) {
            match &self.prior {
                Some(v) => std::env::set_var("ENSEMBLE_DATA_DIR", v),
                None => std::env::remove_var("ENSEMBLE_DATA_DIR"),
            }
            // Lock guard drops here, releasing the mutex.
        }
    }

    fn cat(id: &str) -> Category {
        Category {
            id: id.to_string(),
            name: id.to_string(),
            color: "#000000".to_string(),
            count: 0,
        }
    }

    fn tag(id: &str) -> Tag {
        Tag {
            id: id.to_string(),
            name: id.to_string(),
            count: 0,
        }
    }

    fn seed(categories: Vec<Category>, tags: Vec<Tag>) {
        let data = AppData {
            categories,
            tags,
            ..AppData::default()
        };
        write_app_data(data).expect("seed write_app_data");
    }

    #[test]
    fn reorder_categories_persists_order() {
        let _scope = ScopedDataDir::new();
        seed(vec![cat("A"), cat("B"), cat("C")], vec![]);

        let result = reorder_categories(vec!["C".into(), "A".into(), "B".into()])
            .expect("reorder_categories");
        assert_eq!(
            result.iter().map(|c| c.id.as_str()).collect::<Vec<_>>(),
            vec!["C", "A", "B"]
        );

        // Reload from disk to verify persistence.
        let reloaded = read_app_data().expect("read_app_data");
        assert_eq!(
            reloaded.categories.iter().map(|c| c.id.as_str()).collect::<Vec<_>>(),
            vec!["C", "A", "B"]
        );
    }

    #[test]
    fn reorder_categories_returns_canonical_vec() {
        let _scope = ScopedDataDir::new();
        seed(vec![cat("A"), cat("B"), cat("C")], vec![]);

        // Partial ordered_ids should append unmentioned in original order.
        let result = reorder_categories(vec!["B".into()]).expect("reorder_categories");
        assert_eq!(
            result.iter().map(|c| c.id.as_str()).collect::<Vec<_>>(),
            vec!["B", "A", "C"]
        );
    }

    #[test]
    fn reorder_tags_persists_order() {
        let _scope = ScopedDataDir::new();
        seed(vec![], vec![tag("t1"), tag("t2"), tag("t3")]);

        let result = reorder_tags(vec!["t3".into(), "t1".into(), "t2".into()])
            .expect("reorder_tags");
        assert_eq!(
            result.iter().map(|t| t.id.as_str()).collect::<Vec<_>>(),
            vec!["t3", "t1", "t2"]
        );

        let reloaded = read_app_data().expect("read_app_data");
        assert_eq!(
            reloaded.tags.iter().map(|t| t.id.as_str()).collect::<Vec<_>>(),
            vec!["t3", "t1", "t2"]
        );
    }

    #[test]
    fn reorder_categories_unknown_id_is_skipped() {
        let _scope = ScopedDataDir::new();
        seed(vec![cat("A"), cat("B"), cat("C")], vec![]);

        let result = reorder_categories(vec!["X".into(), "B".into(), "A".into()])
            .expect("reorder_categories");
        // X skipped, B and A first, then C from original order.
        assert_eq!(
            result.iter().map(|c| c.id.as_str()).collect::<Vec<_>>(),
            vec!["B", "A", "C"]
        );
    }

    #[test]
    fn concurrent_reorder_and_add_no_lost_update() {
        // Verifies that DATA_MUTEX serialises concurrent mutators so no writes
        // are lost. We spawn 10 reorder threads + 10 add threads and assert
        // that all 10 added categories survive in the final on-disk state.
        let _scope = ScopedDataDir::new();
        seed(vec![cat("A"), cat("B"), cat("C")], vec![]);

        let mut handles = Vec::new();

        // 10 add_category threads.
        for i in 0..10 {
            handles.push(std::thread::spawn(move || {
                add_category(format!("new-{i}"), "#FFFFFF".to_string())
                    .expect("add_category");
            }));
        }

        // 10 reorder_categories threads (no-op orderings drawn from the seed).
        for _ in 0..10 {
            handles.push(std::thread::spawn(|| {
                let _ = reorder_categories(vec!["C".into(), "A".into(), "B".into()]);
            }));
        }

        for h in handles {
            h.join().expect("thread panicked — DATA_MUTEX lock contention failure?");
        }

        // After all threads join, every added category must be present.
        let final_data = read_app_data().expect("read_app_data");
        // 3 seeded + 10 added = 13.
        assert_eq!(final_data.categories.len(), 13, "lost updates detected");

        // Verify all 10 newly added categories are present (any order).
        let final_ids: std::collections::HashSet<&str> =
            final_data.categories.iter().map(|c| c.name.as_str()).collect();
        for i in 0..10 {
            let expected_name = format!("new-{i}");
            assert!(
                final_ids.contains(expected_name.as_str()),
                "added category {expected_name} was lost — DATA_MUTEX did not serialise mutations",
            );
        }
    }
}
