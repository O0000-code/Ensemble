use crate::utils::expand_path;
use std::fs;

#[cfg(unix)]
use std::os::unix::fs::symlink;

/// Create a symbolic link
#[tauri::command]
pub fn create_symlink(source: String, target: String) -> Result<(), String> {
    let source_path = expand_path(&source);
    let target_path = expand_path(&target);

    // Ensure source exists
    if !source_path.exists() {
        return Err(format!("Source path does not exist: {:?}", source_path));
    }

    // Ensure target parent directory exists
    if let Some(parent) = target_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    // Remove existing symlink or file at target
    if target_path.exists() || target_path.symlink_metadata().is_ok() {
        fs::remove_file(&target_path).map_err(|e| e.to_string())?;
    }

    #[cfg(unix)]
    symlink(&source_path, &target_path).map_err(|e| e.to_string())?;

    #[cfg(windows)]
    {
        if source_path.is_dir() {
            std::os::windows::fs::symlink_dir(&source_path, &target_path)
                .map_err(|e| e.to_string())?;
        } else {
            std::os::windows::fs::symlink_file(&source_path, &target_path)
                .map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

/// Remove a symbolic link
#[tauri::command]
pub fn remove_symlink(path: String) -> Result<(), String> {
    let target_path = expand_path(&path);

    if !target_path.exists() && target_path.symlink_metadata().is_err() {
        // Already doesn't exist
        return Ok(());
    }

    // Check if it's actually a symlink
    if let Ok(metadata) = target_path.symlink_metadata() {
        if metadata.file_type().is_symlink() {
            fs::remove_file(&target_path).map_err(|e| e.to_string())?;
        } else {
            return Err("Path is not a symlink".to_string());
        }
    }

    Ok(())
}

/// Check if a path is a symlink
#[tauri::command]
pub fn is_symlink(path: String) -> Result<bool, String> {
    let target_path = expand_path(&path);
    
    Ok(target_path
        .symlink_metadata()
        .map(|m| m.file_type().is_symlink())
        .unwrap_or(false))
}

/// Get the target of a symlink
#[tauri::command]
pub fn get_symlink_target(path: String) -> Result<Option<String>, String> {
    let target_path = expand_path(&path);
    
    match fs::read_link(&target_path) {
        Ok(target) => Ok(Some(target.to_string_lossy().to_string())),
        Err(_) => Ok(None),
    }
}

/// Create multiple symlinks at once
#[tauri::command]
pub fn create_symlinks(links: Vec<(String, String)>) -> Result<Vec<String>, String> {
    let mut errors = Vec::new();

    for (source, target) in links {
        if let Err(e) = create_symlink(source.clone(), target.clone()) {
            errors.push(format!("{} -> {}: {}", source, target, e));
        }
    }

    if errors.is_empty() {
        Ok(Vec::new())
    } else {
        Ok(errors)
    }
}

/// Remove multiple symlinks at once
#[tauri::command]
pub fn remove_symlinks(paths: Vec<String>) -> Result<Vec<String>, String> {
    let mut errors = Vec::new();

    for path in paths {
        if let Err(e) = remove_symlink(path.clone()) {
            errors.push(format!("{}: {}", path, e));
        }
    }

    if errors.is_empty() {
        Ok(Vec::new())
    } else {
        Ok(errors)
    }
}
