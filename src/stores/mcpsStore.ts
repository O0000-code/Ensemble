import { create } from 'zustand';
import { McpServer } from '@/types';

interface McpsFilter {
  search: string;
  category: string | null;
  tags: string[];
}

interface McpsState {
  mcpServers: McpServer[];
  selectedMcpId: string | null;
  filter: McpsFilter;
  isLoading: boolean;

  // Actions
  setMcpServers: (servers: McpServer[]) => void;
  selectMcp: (id: string | null) => void;
  toggleMcp: (id: string) => void;
  setFilter: (filter: Partial<McpsFilter>) => void;

  // Computed getters (via selectors)
  getFilteredMcps: () => McpServer[];
  getEnabledCount: () => number;
  getSelectedMcp: () => McpServer | undefined;
}

// Mock data for development
const mockMcpServers: McpServer[] = [
  {
    id: '1',
    name: 'postgres-mcp',
    description: 'PostgreSQL database operations and queries',
    category: 'Database',
    tags: ['SQL', 'Database'],
    enabled: true,
    sourcePath: '~/.ensemble/mcps/postgres-mcp.json',
    command: 'node',
    args: ['/path/to/postgres-mcp/index.js'],
    env: { DATABASE_URL: 'postgresql://localhost:5432/db' },
    providedTools: [
      { name: 'query', description: 'Execute SQL queries on the database' },
      { name: 'list_tables', description: 'List all tables in the database' },
      { name: 'describe_table', description: 'Get detailed schema for a specific table' },
    ],
    createdAt: '2024-01-15',
    lastUsed: '2024-01-20',
    usageCount: 1847,
  },
  {
    id: '2',
    name: 'filesystem-mcp',
    description: 'File system operations for reading, writing, and managing files',
    category: 'Development',
    tags: ['Files', 'IO'],
    enabled: true,
    sourcePath: '~/.ensemble/mcps/filesystem-mcp.json',
    command: 'node',
    args: ['/path/to/filesystem-mcp/index.js'],
    providedTools: [
      { name: 'read_file', description: 'Read the contents of a file at the specified path' },
      { name: 'write_file', description: 'Write content to a file at the specified path' },
      { name: 'list_directory', description: 'List files and directories in a path' },
      { name: 'search_files', description: 'Search for files matching a pattern' },
    ],
    createdAt: '2024-01-10',
    lastUsed: '2024-01-21',
    usageCount: 3240,
  },
  {
    id: '3',
    name: 'github-mcp',
    description: 'GitHub API integration for repositories, issues, and PRs',
    category: 'Development',
    tags: ['Git', 'API'],
    enabled: true,
    sourcePath: '~/.ensemble/mcps/github-mcp.json',
    command: 'npx',
    args: ['@modelcontextprotocol/server-github'],
    env: { GITHUB_TOKEN: 'ghp_xxx' },
    providedTools: [
      { name: 'list_repos', description: 'List repositories for authenticated user' },
      { name: 'create_issue', description: 'Create a new issue in a repository' },
      { name: 'get_pull_request', description: 'Get details of a pull request' },
      { name: 'search_code', description: 'Search code across repositories' },
    ],
    createdAt: '2024-01-12',
    lastUsed: '2024-01-19',
    usageCount: 892,
  },
  {
    id: '4',
    name: 'slack-mcp',
    description: 'Slack workspace integration for messaging and channels',
    category: 'Communication',
    tags: ['Messaging', 'API'],
    enabled: false,
    sourcePath: '~/.ensemble/mcps/slack-mcp.json',
    command: 'node',
    args: ['/path/to/slack-mcp/index.js'],
    env: { SLACK_TOKEN: 'xoxb-xxx' },
    providedTools: [
      { name: 'send_message', description: 'Send a message to a channel or user' },
      { name: 'list_channels', description: 'List all channels in the workspace' },
      { name: 'search_messages', description: 'Search messages in the workspace' },
    ],
    createdAt: '2024-01-08',
    lastUsed: '2024-01-15',
    usageCount: 156,
  },
  {
    id: '5',
    name: 'web-search-mcp',
    description: 'Web search capabilities using multiple search engines',
    category: 'Research',
    tags: ['Search', 'Web'],
    enabled: true,
    sourcePath: '~/.ensemble/mcps/web-search-mcp.json',
    command: 'python',
    args: ['-m', 'web_search_mcp'],
    providedTools: [
      { name: 'web_search', description: 'Search the web using Google or Bing' },
      { name: 'fetch_page', description: 'Fetch and parse a web page content' },
    ],
    createdAt: '2024-01-05',
    lastUsed: '2024-01-21',
    usageCount: 2156,
  },
  {
    id: '6',
    name: 'notion-mcp',
    description: 'Notion workspace integration for pages and databases',
    category: 'Productivity',
    tags: ['Notes', 'Database'],
    enabled: true,
    sourcePath: '~/.ensemble/mcps/notion-mcp.json',
    command: 'node',
    args: ['/path/to/notion-mcp/index.js'],
    env: { NOTION_API_KEY: 'secret_xxx' },
    providedTools: [
      { name: 'search_pages', description: 'Search for pages in Notion workspace' },
      { name: 'create_page', description: 'Create a new page in a database' },
      { name: 'update_page', description: 'Update properties of a page' },
      { name: 'query_database', description: 'Query a Notion database with filters' },
      { name: 'append_blocks', description: 'Append content blocks to a page' },
    ],
    createdAt: '2024-01-03',
    lastUsed: '2024-01-20',
    usageCount: 567,
  },
];

export const useMcpsStore = create<McpsState>((set, get) => ({
  mcpServers: mockMcpServers,
  selectedMcpId: null,
  filter: {
    search: '',
    category: null,
    tags: [],
  },
  isLoading: false,

  setMcpServers: (servers) => set({ mcpServers: servers }),

  selectMcp: (id) => set({ selectedMcpId: id }),

  toggleMcp: (id) =>
    set((state) => ({
      mcpServers: state.mcpServers.map((mcp) =>
        mcp.id === id ? { ...mcp, enabled: !mcp.enabled } : mcp
      ),
    })),

  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),

  getFilteredMcps: () => {
    const state = get();
    let filtered = [...state.mcpServers];

    // Filter by search
    if (state.filter.search) {
      const searchLower = state.filter.search.toLowerCase();
      filtered = filtered.filter(
        (mcp) =>
          mcp.name.toLowerCase().includes(searchLower) ||
          mcp.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (state.filter.category) {
      filtered = filtered.filter((mcp) => mcp.category === state.filter.category);
    }

    // Filter by tags
    if (state.filter.tags.length > 0) {
      filtered = filtered.filter((mcp) =>
        state.filter.tags.some((tag) => mcp.tags.includes(tag))
      );
    }

    return filtered;
  },

  getEnabledCount: () => {
    return get().mcpServers.filter((mcp) => mcp.enabled).length;
  },

  getSelectedMcp: () => {
    const state = get();
    return state.mcpServers.find((mcp) => mcp.id === state.selectedMcpId);
  },
}));
