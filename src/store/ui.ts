import { create } from 'zustand';
import type { Editor } from '../editor/editor';

export type ToolTab = 'templates' | 'text' | 'images' | 'shapes' | 'ai' | 'brand';

interface Toast {
  id: number;
  message: string;
}

interface UiState {
  editor: Editor | null;
  tab: ToolTab;
  settingsOpen: boolean;
  projectName: string;
  toasts: Toast[];
  setEditor: (editor: Editor | null) => void;
  setTab: (tab: ToolTab) => void;
  setSettingsOpen: (open: boolean) => void;
  setProjectName: (name: string) => void;
  toast: (message: string) => void;
}

let nextToast = 1;

export const useUi = create<UiState>((set, get) => ({
  editor: null,
  tab: 'text',
  settingsOpen: false,
  projectName: '',
  toasts: [],
  setEditor: (editor) => set({ editor }),
  setTab: (tab) => set({ tab }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setProjectName: (projectName) => set({ projectName }),
  toast: (message) => {
    const id = nextToast++;
    set({ toasts: [...get().toasts, { id, message }] });
    window.setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 2600);
  }
}));
