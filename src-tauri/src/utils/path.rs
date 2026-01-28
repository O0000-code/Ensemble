#![allow(dead_code)]

use std::path::{Path, PathBuf};

/// Expand ~ to home directory
pub fn expand_path(path: &str) -> PathBuf {
    if path.starts_with('~') {
        if let Some(home) = dirs::home_dir() {
            return home.join(&path[1..].trim_start_matches('/'));
        }
    }
    PathBuf::from(path)
}

/// Get the application data directory
pub fn get_app_data_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".ensemble")
}

/// Get the data.json path
pub fn get_data_file_path() -> PathBuf {
    get_app_data_dir().join("data.json")
}

/// Get the settings.json path
pub fn get_settings_file_path() -> PathBuf {
    get_app_data_dir().join("settings.json")
}

/// Ensure a directory exists
pub fn ensure_dir(path: &Path) -> std::io::Result<()> {
    if !path.exists() {
        std::fs::create_dir_all(path)?;
    }
    Ok(())
}

/// Get relative path from base
pub fn get_relative_path(path: &Path, base: &Path) -> Option<PathBuf> {
    path.strip_prefix(base).ok().map(|p| p.to_path_buf())
}

/// Check if a path is a symlink
pub fn is_symlink(path: &Path) -> bool {
    path.symlink_metadata()
        .map(|m| m.file_type().is_symlink())
        .unwrap_or(false)
}

/// Get symlink target
pub fn get_symlink_target(path: &Path) -> Option<PathBuf> {
    std::fs::read_link(path).ok()
}

/// Expand tilde (~) in path to home directory (alias for expand_path)
pub fn expand_tilde(path: &str) -> PathBuf {
    expand_path(path)
}

/// Collapse absolute path to path with ~ prefix
pub fn collapse_tilde(path: &Path) -> String {
    if let Some(home) = dirs::home_dir() {
        if let Ok(relative) = path.strip_prefix(&home) {
            return format!("~/{}", relative.display());
        }
    }
    path.display().to_string()
}

/// Get the user's home directory
pub fn get_home_dir() -> Option<PathBuf> {
    dirs::home_dir()
}

/// Get the path to the application data file (alias for get_data_file_path)
pub fn get_data_path() -> PathBuf {
    get_data_file_path()
}

/// Get the path to the application config/settings file
pub fn get_config_path() -> PathBuf {
    get_settings_file_path()
}

/// Get the ensemble directory (alias for get_app_data_dir)
pub fn get_ensemble_dir() -> PathBuf {
    get_app_data_dir()
}
