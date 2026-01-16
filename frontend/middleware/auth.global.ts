import { defineNuxtRouteMiddleware, navigateTo } from '../node_modules/nuxt/dist/app';
import { useAuthStore } from '../stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  if (!process.client) {
    return;
  }

  const authStore = useAuthStore();
  if (!authStore.token) {
    authStore.loadAuth();
  }

  const publicPages = ['/login', '/register'];

  // If not authenticated and not on a public page, redirect to login
  if (!authStore.isAuthenticated && !publicPages.includes(to.path)) {
    return navigateTo('/login');
  }

  // If authenticated and trying to access login/register, redirect to dashboard
  if (authStore.isAuthenticated && publicPages.includes(to.path)) {
    return navigateTo('/booking');
  }
});
