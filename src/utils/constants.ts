// src/utils/constants.ts

/**
 * 分类颜色映射
 * 用于在列表项中显示分类指示器的颜色
 */
export const categoryColors: Record<string, string> = {
  development: '#18181B',
  design: '#8B5CF6',
  research: '#3B82F6',
  productivity: '#10B981',
  other: '#71717A',
};

/**
 * 获取分类对应的颜色
 * @param category 分类名称
 * @returns 颜色值，如果分类不存在则返回 other 的颜色
 */
export const getCategoryColor = (category: string): string => {
  return categoryColors[category?.toLowerCase()] || categoryColors.other;
};
