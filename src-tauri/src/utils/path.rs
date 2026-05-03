#![allow(dead_code)]

use std::path::{Path, PathBuf};

/// Shared mutex used by all tests that mutate the `ENSEMBLE_DATA_DIR`
/// environment variable. Cargo runs tests in parallel by default; without a
/// **single shared** lock spanning every test module that touches this env
/// var, two tests can interleave `set_var`/`remove_var` calls and observe
/// inconsistent state. Tests in `utils::path::tests` and
/// `commands::data::reorder_integration_tests` both acquire this guard
/// before reading or writing `ENSEMBLE_DATA_DIR`.
#[cfg(test)]
pub(crate) static ENV_TEST_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

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
///
/// Honours the `ENSEMBLE_DATA_DIR` environment variable when set (used for
/// test isolation so integration tests do not touch `~/.ensemble/`).
pub fn get_app_data_dir() -> PathBuf {
    if let Ok(dir) = std::env::var("ENSEMBLE_DATA_DIR") {
        return PathBuf::from(dir);
    }
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

#[cfg(test)]
mod tests {
    use super::*;
    // Reuse the crate-wide ENV_TEST_LOCK declared above so this module's tests
    // serialise with `commands::data::reorder_integration_tests` (which also
    // mutates ENSEMBLE_DATA_DIR). A per-module lock would NOT prevent races
    // across modules.

    #[test]
    fn test_expand_path_with_tilde() {
        let result = expand_path("~/Documents");
        let home = dirs::home_dir().unwrap();
        assert_eq!(result, home.join("Documents"));
    }

    #[test]
    fn test_expand_path_with_tilde_slash() {
        let result = expand_path("~/.ensemble/skills");
        let home = dirs::home_dir().unwrap();
        assert_eq!(result, home.join(".ensemble/skills"));
    }

    #[test]
    fn test_expand_path_without_tilde() {
        let result = expand_path("/usr/local/bin");
        assert_eq!(result, PathBuf::from("/usr/local/bin"));
    }

    #[test]
    fn test_expand_path_relative() {
        let result = expand_path("relative/path");
        assert_eq!(result, PathBuf::from("relative/path"));
    }

    #[test]
    fn test_expand_tilde_is_alias() {
        let path = "~/test";
        assert_eq!(expand_tilde(path), expand_path(path));
    }

    #[test]
    fn test_get_app_data_dir() {
        // Clear ENSEMBLE_DATA_DIR for this test; integration tests may set it.
        // ENV_TEST_LOCK serialises env-mutating tests within this module so they
        // do not race with each other or with `test_get_app_data_dir_honours_env_override`.
        let _guard = ENV_TEST_LOCK.lock().unwrap();
        let prior = std::env::var("ENSEMBLE_DATA_DIR").ok();
        std::env::remove_var("ENSEMBLE_DATA_DIR");
        let result = get_app_data_dir();
        let home = dirs::home_dir().unwrap();
        assert_eq!(result, home.join(".ensemble"));
        if let Some(v) = prior {
            std::env::set_var("ENSEMBLE_DATA_DIR", v);
        }
    }

    #[test]
    fn test_get_data_file_path() {
        let _guard = ENV_TEST_LOCK.lock().unwrap();
        let prior = std::env::var("ENSEMBLE_DATA_DIR").ok();
        std::env::remove_var("ENSEMBLE_DATA_DIR");
        let result = get_data_file_path();
        assert!(result.ends_with("data.json"));
        assert!(result.to_string_lossy().contains(".ensemble"));
        if let Some(v) = prior {
            std::env::set_var("ENSEMBLE_DATA_DIR", v);
        }
    }

    #[test]
    fn test_get_settings_file_path() {
        let _guard = ENV_TEST_LOCK.lock().unwrap();
        let prior = std::env::var("ENSEMBLE_DATA_DIR").ok();
        std::env::remove_var("ENSEMBLE_DATA_DIR");
        let result = get_settings_file_path();
        assert!(result.ends_with("settings.json"));
        assert!(result.to_string_lossy().contains(".ensemble"));
        if let Some(v) = prior {
            std::env::set_var("ENSEMBLE_DATA_DIR", v);
        }
    }

    #[test]
    fn test_get_app_data_dir_honours_env_override() {
        let _guard = ENV_TEST_LOCK.lock().unwrap();
        let prior = std::env::var("ENSEMBLE_DATA_DIR").ok();
        std::env::set_var("ENSEMBLE_DATA_DIR", "/tmp/ensemble-override-test");
        let result = get_app_data_dir();
        assert_eq!(result, PathBuf::from("/tmp/ensemble-override-test"));
        match prior {
            Some(v) => std::env::set_var("ENSEMBLE_DATA_DIR", v),
            None => std::env::remove_var("ENSEMBLE_DATA_DIR"),
        }
    }

    #[test]
    fn test_get_relative_path_success() {
        let path = Path::new("/home/user/projects/foo/bar.rs");
        let base = Path::new("/home/user/projects");
        let result = get_relative_path(path, base);
        assert_eq!(result, Some(PathBuf::from("foo/bar.rs")));
    }

    #[test]
    fn test_get_relative_path_not_prefix() {
        let path = Path::new("/other/path");
        let base = Path::new("/home/user");
        let result = get_relative_path(path, base);
        assert_eq!(result, None);
    }

    #[test]
    fn test_collapse_tilde() {
        let home = dirs::home_dir().unwrap();
        let path = home.join("Documents/test.txt");
        let result = collapse_tilde(&path);
        assert_eq!(result, "~/Documents/test.txt");
    }

    #[test]
    fn test_collapse_tilde_not_in_home() {
        let path = Path::new("/usr/local/bin/foo");
        let result = collapse_tilde(path);
        assert_eq!(result, "/usr/local/bin/foo");
    }

    #[test]
    fn test_is_symlink_nonexistent() {
        let result = is_symlink(Path::new("/nonexistent/path/that/does/not/exist"));
        assert!(!result);
    }

    #[test]
    fn test_get_symlink_target_nonexistent() {
        let result = get_symlink_target(Path::new("/nonexistent/path"));
        assert!(result.is_none());
    }

    #[test]
    fn test_aliases_match_originals() {
        assert_eq!(get_data_path(), get_data_file_path());
        assert_eq!(get_config_path(), get_settings_file_path());
        assert_eq!(get_ensemble_dir(), get_app_data_dir());
    }
}
