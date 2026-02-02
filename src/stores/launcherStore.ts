import { create } from 'zustand';

interface LauncherState {
  isOpen: boolean;
  folderPath: string;
  openLauncher: (path: string) => void;
  closeLauncher: () => void;
}

export const useLauncherStore = create<LauncherState>((set) => ({
  isOpen: false,
  folderPath: '',
  openLauncher: (path) => set({ isOpen: true, folderPath: path }),
  closeLauncher: () => set({ isOpen: false, folderPath: '' }),
}));
