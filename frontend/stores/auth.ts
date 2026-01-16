import { defineStore } from 'pinia';

interface User {
  id: number;
  username: string;
  role: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as { id: number; username: string; role: string } | null,
    expiredAt: null as number | null,
  }),
  actions: {
    setAuth(token: string, user: User) {
      const expiredAt = Date.now() + 60 * 60 * 1000;

      this.token = token;
      this.user = user;
      this.expiredAt = expiredAt;

      if (process.client) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('expiredAt', expiredAt.toString());
      }
    },
    loadAuth() {
      if (!process.client) return;

      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const expiredAt = localStorage.getItem('expiredAt');

      if (!token || !user || !expiredAt) {
        this.clearAuth();
        return;
      }

      if (Date.now() > Number(expiredAt)) {
        this.clearAuth();
        return;
      }

      this.token = token;
      this.user = JSON.parse(user);
      this.expiredAt = Number(expiredAt);
    },
    clearAuth() {
      this.token = null;
      this.user = null;
      this.expiredAt = null;

      if (process.client) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expiredAt');
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user && (!!state.expiredAt && Date.now() < state.expiredAt),
  },
});
