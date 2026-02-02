mod commands;
pub mod types;
mod utils;

use commands::{classify, config, data, dialog, import, mcps, skills, symlink};
use tauri::{Emitter, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            println!("[Single Instance] Received args: {:?}", args);

            // 检查是否有 --launch 参数
            if let Some(launch_index) = args.iter().position(|a| a == "--launch") {
                if let Some(path) = args.get(launch_index + 1) {
                    println!("[Single Instance] Launch path: {}", path);

                    // 尝试获取主窗口
                    if let Some(window) = app.get_webview_window("main") {
                        println!("[Single Instance] Found main window, emitting event");
                        let emit_result = window.emit("second-instance-launch", path.clone());
                        println!("[Single Instance] Emit result: {:?}", emit_result);
                        let _ = window.set_focus();
                    } else {
                        // 如果找不到 "main"，尝试获取所有窗口
                        println!("[Single Instance] Main window not found, trying all windows");
                        let windows = app.webview_windows();
                        println!("[Single Instance] Available windows: {:?}", windows.keys().collect::<Vec<_>>());

                        if let Some((_, window)) = windows.into_iter().next() {
                            println!("[Single Instance] Using first available window");
                            let _ = window.emit("second-instance-launch", path.clone());
                            let _ = window.set_focus();
                        }
                    }
                }
            }
        }))
        .invoke_handler(tauri::generate_handler![
            // Skills commands
            skills::scan_skills,
            skills::get_skill,
            skills::update_skill_metadata,
            // MCPs commands
            mcps::scan_mcps,
            mcps::get_mcp,
            mcps::update_mcp_metadata,
            // Symlink commands
            symlink::create_symlink,
            symlink::remove_symlink,
            symlink::is_symlink,
            symlink::get_symlink_target,
            symlink::create_symlinks,
            symlink::remove_symlinks,
            // Config commands
            config::write_mcp_config,
            config::sync_project_config,
            config::clear_project_config,
            config::get_project_config_status,
            // Data commands
            data::read_app_data,
            data::write_app_data,
            data::read_settings,
            data::write_settings,
            data::init_app_data,
            // Categories
            data::get_categories,
            data::add_category,
            data::update_category,
            data::delete_category,
            // Tags
            data::get_tags,
            data::add_tag,
            data::update_tag,
            data::delete_tag,
            // Scenes
            data::get_scenes,
            data::add_scene,
            data::update_scene,
            data::delete_scene,
            // Projects
            data::get_projects,
            data::add_project,
            data::update_project,
            data::delete_project,
            // Dialog
            dialog::select_folder,
            dialog::select_file,
            // Classify (Anthropic API)
            classify::auto_classify,
            classify::validate_api_key,
            // Import commands
            import::detect_existing_config,
            import::backup_before_import,
            import::import_existing_config,
            import::update_skill_scope,
            import::update_mcp_scope,
            import::install_quick_action,
            import::launch_claude_for_folder,
            import::get_launch_args,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
