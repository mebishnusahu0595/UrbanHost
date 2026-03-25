import { create } from "zustand";

interface UIState {
    isMobileMenuOpen: boolean;
    isAuthModalOpen: boolean;
    authModalView: "login" | "signup";
    isDatePickerOpen: boolean;
    isGuestsPickerOpen: boolean;
    toggleMobileMenu: () => void;
    openAuthModal: (view: "login" | "signup") => void;
    closeAuthModal: () => void;
    setDatePickerOpen: (isOpen: boolean) => void;
    setGuestsPickerOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isMobileMenuOpen: false,
    isAuthModalOpen: false,
    authModalView: "login",
    isDatePickerOpen: false,
    isGuestsPickerOpen: false,
    toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    openAuthModal: (view) => set({ isAuthModalOpen: true, authModalView: view }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),
    setDatePickerOpen: (isOpen) => set({ isDatePickerOpen: isOpen }),
    setGuestsPickerOpen: (isOpen) => set({ isGuestsPickerOpen: isOpen }),
}));
