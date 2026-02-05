# 自动分类功能修复计划

## 问题总结

### 问题 1: 标签质量问题
- **症状**: 标签太长、使用连字符、数量太多（4-5个）
- **根因**: Prompt 鼓励 2-5 个标签，Schema 无格式限制
- **解决**: 重写 Prompt 强调熵减，Schema 限制 1-2 个纯小写单词标签

### 问题 2: 数据持久化问题
- **症状**: 新分类/标签不出现在侧边栏
- **根因**: `autoClassify` 只更新 Skill/MCP 的字符串字段，不创建 Category/Tag 实体
- **解决**: 在应用分类结果前，先创建不存在的 Category/Tag 实体

## 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `src-tauri/src/commands/classify.rs` | 重写 Prompt、Schema、ClassifyResult 结构体 |
| `src/types/index.ts` | 更新 ClassifyResult 类型 |
| `src/stores/skillsStore.ts` | 添加创建 Category/Tag 逻辑 |
| `src/stores/mcpsStore.ts` | 添加创建 Category/Tag 逻辑 |
| `src/stores/claudeMdStore.ts` | 添加创建 Category/Tag 逻辑 |

## 核心变更

### 1. 新 Prompt 设计原则
- 开篇强调 "ENTROPY REDUCTION"
- 标签格式: **单个小写英文单词**，禁止连字符
- 标签数量: **1-2 个**，最多不超过 2 个
- 复用优先: **STRONGLY prefer existing**

### 2. 新 Schema 限制
```json
{
  "tags": {
    "items": { "pattern": "^[a-z]+$" },
    "minItems": 1,
    "maxItems": 2
  }
}
```

### 3. 数据持久化流程
```
分类结果 → 检查 category 是否存在 → 不存在则 addCategory()
         → 检查 tags 是否存在 → 不存在则 addTag()
         → 更新 Skill/MCP metadata
         → 重新加载 categories, tags, items
```

## 执行顺序

1. 修改后端 `classify.rs`（Prompt + Schema + 类型）
2. 修改前端类型 `types/index.ts`
3. 并行修改三个 Store 的 `autoClassify` 方法
