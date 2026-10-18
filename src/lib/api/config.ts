declare global {
  interface ImportMetaEnv { readonly VITE_API_BASE?: string }
}

export const API_BASE = import.meta.env.VITE_API_BASE ?? "https://urban-excluded-andrews-still.trycloudflare.com";
