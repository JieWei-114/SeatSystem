<template>
  <div class="flex min-h-screen">
    <ClientOnly>
      <Navbar v-if="authStore.isAuthenticated" />
      <main class="flex-1 ml-0" :class="{ 'ml-[15%]': authStore.isAuthenticated }">
        <NuxtPage />
      </main>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
</script>
