import { create } from 'zustand'

interface UIStore {
  isAuthModalOpen: boolean
  authRedirectUrl: string | null
  openAuthModal: (redirectUrl?: string) => void
  closeAuthModal: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isAuthModalOpen: false,
  authRedirectUrl: null,
  openAuthModal: (redirectUrl) => set({ isAuthModalOpen: true, authRedirectUrl: redirectUrl || null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, authRedirectUrl: null }),
}))
