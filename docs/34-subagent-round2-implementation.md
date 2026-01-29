# SubAgent 第二轮执行规划 - Phase 1 & 2 实现

## 本轮目标

实现后端 update_tag 命令和前端 Store 编辑状态管理。

## 前置阅读要求

所有 SubAgent 在执行前必须阅读以下文档：
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-category-tag-inline-edit-understanding.md` - 需求理解
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-implementation-plan.md` - 实现规划
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-current-store-analysis.md` - Store 现状分析

## SubAgent 任务分配

### SubAgent 1: 后端 update_tag 命令

**任务**：在 Rust 后端添加 update_tag 命令

**执行步骤**：

1. 阅读现有后端代码了解结构：
   - `/Users/bo/Documents/Development/Ensemble/Ensemble2/src-tauri/src/commands/data.rs`
   - `/Users/bo/Documents/Development/Ensemble/Ensemble2/src-tauri/src/lib.rs`

2. 在 `data.rs` 中添加 `update_tag` 函数：
   ```rust
   #[tauri::command]
   pub fn update_tag(id: String, name: String) -> Result<(), String> {
       let mut data = read_app_data()?;

       if let Some(tag) = data.tags.iter_mut().find(|t| t.id == id) {
           tag.name = name;
           write_app_data(data)?;
           Ok(())
       } else {
           Err("Tag not found".to_string())
       }
   }
   ```

3. 在 `lib.rs` 中注册命令（在 `invoke_handler` 的命令列表中添加 `commands::data::update_tag`）

4. 验证编译通过：`cd src-tauri && cargo check`

**输出**：修改完成后无需额外文档

---

### SubAgent 2: Store 编辑状态管理

**任务**：扩展 appStore 添加编辑状态管理

**执行步骤**：

1. 阅读现有 Store 代码：
   - `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/appStore.ts`

2. 在 AppState interface 中添加新字段（在现有字段后面添加）：
   ```typescript
   // 编辑状态 - Categories
   editingCategoryId: string | null;
   isAddingCategory: boolean;

   // 编辑状态 - Tags
   editingTagId: string | null;
   isAddingTag: boolean;
   ```

3. 添加初始值（在 create 函数的初始 state 中）：
   ```typescript
   editingCategoryId: null,
   isAddingCategory: false,
   editingTagId: null,
   isAddingTag: false,
   ```

4. 添加 Actions（在现有 actions 后面）：
   ```typescript
   // 清除所有编辑状态（互斥）
   clearAllEditingStates: () => set({
     editingCategoryId: null,
     isAddingCategory: false,
     editingTagId: null,
     isAddingTag: false,
   }),

   // Category 编辑状态
   startEditingCategory: (id: string) => {
     get().clearAllEditingStates();
     set({ editingCategoryId: id });
   },
   stopEditingCategory: () => set({ editingCategoryId: null }),
   startAddingCategory: () => {
     get().clearAllEditingStates();
     set({ isAddingCategory: true });
   },
   stopAddingCategory: () => set({ isAddingCategory: false }),

   // Tag 编辑状态
   startEditingTag: (id: string) => {
     get().clearAllEditingStates();
     set({ editingTagId: id });
   },
   stopEditingTag: () => set({ editingTagId: null }),
   startAddingTag: () => {
     get().clearAllEditingStates();
     set({ isAddingTag: true });
   },
   stopAddingTag: () => set({ isAddingTag: false }),

   // Tag 重命名
   updateTag: async (id: string, name: string) => {
     if (!isTauri()) {
       throw new Error('Not available in browser mode');
     }

     try {
       await safeInvoke('update_tag', { id, name });
       set((state) => ({
         tags: state.tags.map((t) =>
           t.id === id ? { ...t, name } : t
         ),
       }));
     } catch (error) {
       console.error('Failed to update tag:', error);
       throw error;
     }
   },
   ```

5. 确保 TypeScript 类型正确，无编译错误

**输出**：修改完成后无需额外文档

---

## 验证要求

1. Rust 代码编译通过：`cd src-tauri && cargo check`
2. TypeScript 代码无类型错误
3. 不引入任何回归问题
4. 保持代码风格与现有代码一致
