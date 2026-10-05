import { create } from "zustand";

export type ToastType = "success" | "error" | "conflict" | "info";

interface ToastState {
  visible: boolean;
  message: string;
  title: string;
  type: ToastType;
}

interface UIState {
  toast: ToastState;
  showToast: (title: string, message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toast: {
    visible: false,
    message: "",
    title: "",
    type: "info",
  },
  showToast: (title, message, type = "info") =>
    set({
      toast: {
        visible: true,
        title,
        message,
        type,
      },
    }),
  hideToast: () =>
    set((state) => ({
      toast: { ...state.toast, visible: false },
    })),
}));
