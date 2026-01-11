import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

interface User {
  id: number;
  username: string;
  role: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: useStorage("token", null as string | null),
    user: null as { id: number; username: string; role: string } | null,
  }),
  actions: {
    setAuth(token: string, user: User) {
      this.token = token;
      this.user = user;
    },
    clearAuth() {
      this.token = null;
      this.user = null;
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
  },
});
