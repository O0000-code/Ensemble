use tauri_plugin_dialog::DialogExt;

/// Open folder selection dialog
#[tauri::command]
pub fn select_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let result = app.dialog().file().blocking_pick_folder();

    Ok(result.map(|p| p.to_string()))
}

/// Open file selection dialog
#[tauri::command]
pub fn select_file(
    app: tauri::AppHandle,
    filters: Option<Vec<(String, Vec<String>)>>,
) -> Result<Option<String>, String> {
    let mut dialog = app.dialog().file();

    if let Some(filters) = filters {
        for (name, extensions) in filters {
            let ext_refs: Vec<&str> = extensions.iter().map(|s| s.as_str()).collect();
            dialog = dialog.add_filter(&name, &ext_refs);
        }
    }

    let result = dialog.blocking_pick_file();

    Ok(result.map(|p| p.to_string()))
}
