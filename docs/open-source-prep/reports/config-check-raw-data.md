# Ensemble 配置检查原始数据

## 1. 版本号信息

### package.json
- version: 0.0.1

### src-tauri/Cargo.toml
- version: 0.0.1

### src-tauri/tauri.conf.json
- version: 0.0.1

## 2. 应用信息 (tauri.conf.json)
- productName: Ensemble
- identifier: com.ensemble.app
- copyright: 未设置

## 3. 图标配置

### tauri.conf.json 中的 icon 配置
```json
"icon": [
  "icons/32x32.png",
  "icons/128x128.png",
  "icons/128x128@2x.png",
  "icons/icon.icns",
  "icons/icon.ico"
]
```

### icons 目录中的文件列表
- 128x128.png
- 128x128@2x.png
- 32x32.png
- Square107x107Logo.png
- Square142x142Logo.png
- Square150x150Logo.png
- Square284x284Logo.png
- Square30x30Logo.png
- Square310x310Logo.png
- Square44x44Logo.png
- Square71x71Logo.png
- Square89x89Logo.png
- StoreLogo.png
- icon-source.svg
- icon.icns
- icon.ico
- icon.png

## 4. 窗口配置 (windows)
```json
{
  "label": "main",
  "title": "Ensemble",
  "width": 1440,
  "height": 900,
  "minWidth": 1280,
  "minHeight": 720,
  "resizable": true,
  "center": true,
  "titleBarStyle": "Overlay",
  "hiddenTitle": true,
  "trafficLightPosition": {
    "x": 24,
    "y": 25
  }
}
```

## 5. 目录检查
- docs/open-source-prep/reports/ 目录存在: 是

---

## 附加信息

### Cargo.toml 额外信息
- name: ensemble
- description: Claude Code Skills and MCP Manager
- license: MIT
- edition: 2021
- rust-version: 1.77.2

### 版本号一致性检查
| 文件 | 版本号 | 状态 |
|------|--------|------|
| package.json | 0.0.1 | - |
| Cargo.toml | 0.0.1 | 一致 |
| tauri.conf.json | 0.0.1 | 一致 |

**结论**: 所有三个配置文件的版本号一致，均为 `0.0.1`
