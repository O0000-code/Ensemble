export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;
  scope: 'user' | 'project';
  invocation?: string;
  allowedTools?: string[];
  instructions: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

export interface McpServer {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  providedTools: Tool[];
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

export interface Tool {
  name: string;
  description: string;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillIds: string[];
  mcpIds: string[];
  createdAt: string;
  lastUsed?: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  sceneId: string;
  lastSynced?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}

export interface AppSettings {
  skillSourceDir: string;
  mcpSourceDir: string;
  claudeConfigDir: string;
  anthropicApiKey: string;
  autoClassifyNewItems: boolean;
}

export interface ConfigStatus {
  projectExists: boolean;
  sceneSelected: boolean;
  skillsConfigured: boolean;
  mcpsConfigured: boolean;
}
