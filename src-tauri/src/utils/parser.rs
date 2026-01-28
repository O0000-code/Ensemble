use std::collections::HashMap;

/// Parsed SKILL.md frontmatter
#[derive(Debug, Default)]
pub struct SkillFrontmatter {
    pub name: Option<String>,
    pub description: Option<String>,
    pub allowed_tools: Option<Vec<String>>,
    pub license: Option<String>,
    pub metadata: HashMap<String, String>,
}

/// Parse SKILL.md file content
pub fn parse_skill_md(content: &str) -> (SkillFrontmatter, String) {
    let mut frontmatter = SkillFrontmatter::default();
    let mut instructions = String::new();

    // Check for frontmatter
    if content.starts_with("---") {
        if let Some(end_index) = content[3..].find("---") {
            let yaml_content = &content[3..end_index + 3];
            frontmatter = parse_yaml_frontmatter(yaml_content);
            instructions = content[end_index + 6..].trim().to_string();
        } else {
            instructions = content.to_string();
        }
    } else {
        instructions = content.to_string();
    }

    (frontmatter, instructions)
}

/// Parse YAML-like frontmatter (simple key: value parsing)
fn parse_yaml_frontmatter(yaml: &str) -> SkillFrontmatter {
    let mut frontmatter = SkillFrontmatter::default();
    let mut in_metadata = false;

    for line in yaml.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        if line == "metadata:" {
            in_metadata = true;
            continue;
        }

        if in_metadata {
            if line.starts_with("  ") || line.starts_with('\t') {
                // Metadata field
                if let Some((key, value)) = parse_key_value(line.trim()) {
                    frontmatter.metadata.insert(key, value);
                }
            } else {
                in_metadata = false;
            }
        }

        if !in_metadata {
            if let Some((key, value)) = parse_key_value(line) {
                match key.as_str() {
                    "name" => frontmatter.name = Some(value),
                    "description" => frontmatter.description = Some(value),
                    "license" => frontmatter.license = Some(value),
                    "allowed-tools" => {
                        frontmatter.allowed_tools = Some(
                            value
                                .split(',')
                                .map(|s| s.trim().to_string())
                                .filter(|s| !s.is_empty())
                                .collect(),
                        );
                    }
                    _ => {}
                }
            }
        }
    }

    frontmatter
}

/// Parse a simple key: value line
fn parse_key_value(line: &str) -> Option<(String, String)> {
    if let Some(colon_pos) = line.find(':') {
        let key = line[..colon_pos].trim().to_string();
        let value = line[colon_pos + 1..].trim();
        // Remove surrounding quotes if present
        let value = value.trim_matches('"').trim_matches('\'').to_string();
        Some((key, value))
    } else {
        None
    }
}

/// Parse MCP JSON configuration
pub fn parse_mcp_json(content: &str) -> Result<serde_json::Value, serde_json::Error> {
    serde_json::from_str(content)
}

/// Parse SKILL.md file YAML frontmatter (returns Option for compatibility)
pub fn parse_skill_frontmatter(content: &str) -> Option<SkillFrontmatter> {
    // Check if starts with ---
    if !content.starts_with("---") {
        return None;
    }

    // Find the second ---
    let rest = &content[3..];
    let end_index = rest.find("\n---")?;
    let yaml_content = &rest[..end_index];

    Some(parse_yaml_frontmatter(yaml_content))
}

/// Extract SKILL.md body content (everything after frontmatter)
pub fn extract_skill_body(content: &str) -> String {
    if !content.starts_with("---") {
        return content.to_string();
    }

    let rest = &content[3..];
    if let Some(end_index) = rest.find("\n---") {
        let body_start = end_index + 4; // "\n---".len()
        if body_start < rest.len() {
            return rest[body_start..].trim().to_string();
        }
    }

    content.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_skill_md() {
        let content = r#"---
name: test-skill
description: A test skill
allowed-tools: Read, Write, Bash(npm:*)
license: MIT
metadata:
  author: test-author
  version: "1.0.0"
---

# Test Skill
This is the instruction content.
"#;

        let (frontmatter, instructions) = parse_skill_md(content);
        assert_eq!(frontmatter.name, Some("test-skill".to_string()));
        assert_eq!(frontmatter.description, Some("A test skill".to_string()));
        assert!(instructions.contains("# Test Skill"));
    }
}
