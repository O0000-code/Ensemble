# Ensemble 生产版本构建与安装 - 执行规划

## 一、执行阶段划分

### 阶段 1: 环境检查与准备
**目标**: 确保构建环境就绪

**任务清单**:
1. 检查 Node.js 和 npm 版本
2. 检查 Rust 和 Cargo 版本
3. 检查项目依赖是否完整
4. 确保工作目录正确

### 阶段 2: 生产构建
**目标**: 构建最新的生产版本

**任务清单**:
1. 安装/更新 npm 依赖
2. 执行 `npm run tauri build`
3. 监控构建过程
4. 验证构建产出

### 阶段 3: 安装部署
**目标**: 将应用安装到 /Applications

**任务清单**:
1. 检查并关闭正在运行的 Ensemble 实例
2. 备份或删除旧版本（如存在）
3. 复制新版本到 /Applications
4. 设置正确的权限

### 阶段 4: 验证测试
**目标**: 确认安装成功且应用可正常运行

**任务清单**:
1. 启动已安装的应用
2. 验证应用能正常打开
3. 进行基本功能测试
4. 确认安装完成

## 二、SubAgent 分配

由于这是一个线性依赖的任务流程（每个阶段依赖前一阶段的完成），采用单 SubAgent 顺序执行的方式最为高效。

### SubAgent 配置

**SubAgent 名称**: Build-and-Install Agent
**SubAgent 类型**: Bash
**SubAgent 模型**: opus

### 执行脚本

SubAgent 需要按顺序执行以下命令：

```bash
# 阶段 1: 环境检查
node --version
npm --version
rustc --version
cargo --version

# 阶段 2: 构建
cd /Users/bo/Documents/Development/Ensemble/Ensemble2
npm install
npm run tauri build

# 阶段 3: 安装
# 关闭运行中的应用
pkill -9 Ensemble 2>/dev/null || true

# 删除旧版本
rm -rf /Applications/Ensemble.app

# 复制新版本
cp -r src-tauri/target/release/bundle/macos/Ensemble.app /Applications/

# 阶段 4: 验证
ls -la /Applications/Ensemble.app
open /Applications/Ensemble.app
```

## 三、错误处理策略

| 错误场景 | 处理方式 |
|----------|----------|
| npm install 失败 | 清理 node_modules 后重试 |
| 构建失败 | 检查错误信息，可能需要清理 target 目录 |
| 权限不足 | 使用适当的权限提升方式 |
| 应用无法关闭 | 使用 `kill -9` 强制关闭 |

## 四、验收检查点

- [ ] 构建命令成功完成（exit code 0）
- [ ] `src-tauri/target/release/bundle/macos/Ensemble.app` 存在
- [ ] `/Applications/Ensemble.app` 存在
- [ ] 应用能从 /Applications 启动
- [ ] 应用界面正常显示

## 五、预计时间

- 环境检查: ~5秒
- npm install: ~10-30秒
- 构建: ~2-5分钟（取决于是否增量构建）
- 安装: ~5秒
- 验证: ~10秒

**总计**: 约 3-6 分钟
