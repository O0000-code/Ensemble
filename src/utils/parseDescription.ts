/**
 * Skill Description 解析工具
 *
 * 用于将 Skill 的 description 分离为第一句话（功能描述）和剩余内容（使用场景等）
 *
 * @module parseDescription
 */

/**
 * 解析后的 Description 结构
 */
export interface ParsedDescription {
  /** 第一句话 - 用于 Header 显示 */
  firstSentence: string;
  /** 剩余内容（when to use 等）- 可选插入 Instructions */
  remaining: string | null;
}

/**
 * 解析 Skill description，提取第一句话和剩余内容
 *
 * 根据分析的 16 个 Skill 样本，description 主要有以下结构模式：
 * - 56% 使用 ". Use when" 分隔
 * - 13% 使用 ". This skill should be used when" 分隔
 * - 19% 使用编号列表 "(1)...(2)..."
 * - 13% 使用 "Triggers:" 关键字
 * - 部分使用中文标记如 "适用场景"
 *
 * 规则优先级：
 * 1. `. Use when` 作为分隔点（最常见模式）
 * 2. `. This skill should be used when` 作为分隔点
 * 3. `Triggers:` 关键字作为分隔点
 * 4. 编号列表 `(1)` 作为分隔点
 * 5. 中文标记 `适用场景`、`触发`、`使用场景` 作为分隔点
 * 6. 第一个句号（英文 `.` 或中文 `。`）作为回退
 *
 * @param description - 原始 description 字符串
 * @returns 解析后的结构，包含 firstSentence 和 remaining
 *
 * @example
 * // 典型的 "Use when" 模式
 * parseDescription("Review UI code for compliance. Use when asked to review my UI.")
 * // => { firstSentence: "Review UI code for compliance.", remaining: "Use when asked to review my UI." }
 *
 * @example
 * // 简短描述（无 when to use）
 * parseDescription("Best practices for Remotion - Video creation in React")
 * // => { firstSentence: "Best practices for Remotion - Video creation in React", remaining: null }
 *
 * @example
 * // 中文描述
 * parseDescription("将Markdown格式转换为Word文档。适用场景：论文转换")
 * // => { firstSentence: "将Markdown格式转换为Word文档。", remaining: "适用场景：论文转换" }
 */
export function parseDescription(description: string): ParsedDescription {
  // 处理空值或空字符串
  if (!description) {
    return { firstSentence: '', remaining: null };
  }

  // 规范化多行内容为单行（处理 YAML 多行格式）
  const normalized = description.replace(/\n\s*/g, ' ').trim();

  // 规则1: 检测 ". Use when" 作为分隔点（最常见模式 56%）
  const useWhenMatch = normalized.match(/^(.+?)\.\s*(Use when\b.*)$/i);
  if (useWhenMatch) {
    return {
      firstSentence: useWhenMatch[1].trim() + '.',
      remaining: useWhenMatch[2].trim() || null,
    };
  }

  // 规则2: 检测 ". This skill should be used when"
  const skillShouldMatch = normalized.match(
    /^(.+?)\.\s*(This skill should be used when\b.*)$/i
  );
  if (skillShouldMatch) {
    return {
      firstSentence: skillShouldMatch[1].trim() + '.',
      remaining: skillShouldMatch[2].trim() || null,
    };
  }

  // 规则3: 检测 "Triggers:" 关键字
  const triggersMatch = normalized.match(/^(.+?)\.\s*(Triggers?:.*)$/i);
  if (triggersMatch) {
    return {
      firstSentence: triggersMatch[1].trim() + '.',
      remaining: triggersMatch[2].trim() || null,
    };
  }

  // 规则4: 检测编号列表开始 (1) 或 （1）或 1) 或 一）
  const numberedMatch = normalized.match(/^(.+?)\.\s*(\(?[1一][\)）].*)$/);
  if (numberedMatch) {
    return {
      firstSentence: numberedMatch[1].trim() + '.',
      remaining: numberedMatch[2].trim() || null,
    };
  }

  // 规则5: 检测中文标记
  const chineseMatch = normalized.match(
    /^(.+?)[。.]\s*((?:适用场景|触发|使用场景).*)$/
  );
  if (chineseMatch) {
    // 保持原有的标点符号（中文或英文句号）
    const punctuation =
      normalized.charAt(chineseMatch[1].length) === '。' ? '。' : '.';
    return {
      firstSentence: chineseMatch[1].trim() + punctuation,
      remaining: chineseMatch[2].trim() || null,
    };
  }

  // 回退: 使用第一个句号（英文 `.` 或中文 `。`）
  const firstSentenceMatch = normalized.match(/^([^.。]+[.。])\s*(.*)$/);
  if (firstSentenceMatch) {
    const remaining = firstSentenceMatch[2].trim();
    return {
      firstSentence: firstSentenceMatch[1].trim(),
      remaining: remaining || null,
    };
  }

  // 最终回退: 返回整个描述（无句号的情况）
  return { firstSentence: normalized, remaining: null };
}
