use std::process::Command;
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;

/// Bring the main window to the foreground (macOS)
/// This is more reliable than JavaScript window APIs for background apps
#[tauri::command]
pub async fn bring_window_to_front(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        // On macOS, we need to: unminimize -> show -> set_focus
        // This sequence reliably brings a background app to the foreground
        window.unminimize().map_err(|e| e.to_string())?;
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Main window not found".to_string())
    }
}

/// Reveal a path in Finder (macOS)
#[tauri::command]
pub fn reveal_in_finder(path: String) -> Result<(), String> {
    // Use 'open -R' to reveal the file/folder in Finder
    // -R flag reveals the item in Finder instead of opening it
    Command::new("open")
        .arg("-R")
        .arg(&path)
        .spawn()
        .map_err(|e| format!("Failed to open Finder: {}", e))?;
    Ok(())
}

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
