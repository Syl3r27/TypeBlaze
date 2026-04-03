import { TestResult, TimerMode, User } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;

  // Test settings
  timerMode: TimerMode;
  setTimerMode: (mode: TimerMode) => void;

  // Recent results (guest session)
  recentResults: TestResult[];
  addResult: (result: TestResult) => void;
  clearResults: () => void;

  // UI
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}


export const useStore = create<AppState>()(
    persist(
        (set)=>({
            // Auth
            user:null,
            token: null,
            setUser: (user) => set({user}),
            setToken: (token) => set({ token }),
            logout: () =>set({ user: null, token: null}),

            // Settings
            timerMode: '30',
            setTimerMode: (mode) => set({timerMode: mode}),

            // Results
            recentResults : [],
            addResult: (result) => set((state)=>({
                recentResults: [result, ...state.recentResults].slice(0,20),
            })),
            clearResults: ()=> set({ recentResults: []}),

            // UI
            theme: 'dark',
            toggleTheme: () => 
                set((state)=>({ theme: state.theme === 'dark' ? 'light' : 'dark'})),
        }),
        {
            name: 'typeblaze-storage',
            partialize:(state)=>({
                user: state.user,
                token: state.token,
                timerMode: state.timerMode,
                recentResults: state.recentResults,
                theme: state.theme,
            }),
        }
    )
)