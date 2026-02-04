export interface TrashedSkill {
  id: string;
  name: string;
  path: string;
  deletedAt: string;
  description: string;
}

export interface TrashedMcp {
  id: string;
  name: string;
  path: string;
  deletedAt: string;
  description: string;
}

export interface TrashedClaudeMd {
  id: string;
  name: string;
  path: string;
  deletedAt: string;
}

export interface TrashedItems {
  skills: TrashedSkill[];
  mcps: TrashedMcp[];
  claudeMdFiles: TrashedClaudeMd[];
}
