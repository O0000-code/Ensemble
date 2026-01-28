use tauri_plugin_dialog::DialogExt;

/// Open folder selection dialog
#[tauri::command]
pub async fn select_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    // Run the blocking dialog in a background thread to avoid freezing the UI
    let result = tauri::async_runtime::spawn_blocking(move || {
        app.dialog().file().blocking_pick_folder()
    })
    .await
    .map_err(|e| e.to_string())?;

    Ok(result.map(|p| p.to_string()))
}

/// Open file selection dialog
#[tauri::command]
pub async fn select_file(
    app: tauri::AppHandle,
    filters: Option<Vec<(String, Vec<String>)>>,
) -> Result<Option<String>, String> {
    // Run the blocking dialog in a background thread to avoid freezing the UI
    let result = tauri::async_runtime::spawn_blocking(move || {
        let mut dialog = app.dialog().file();

        if let Some(filters) = filters {
            for (name, extensions) in filters {
                let ext_refs: Vec<&str> = extensions.iter().map(|s| s.as_str()).collect();
                dialog = dialog.add_filter(&name, &ext_refs);
            }
        }

        dialog.blocking_pick_file()
    })
    .await
    .map_err(|e| e.to_string())?;

    Ok(result.map(|p| p.to_string()))
}
