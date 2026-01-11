<template>
  <div class="flex min-h-screen">
    <Navbar v-if="authStore.isAuthenticated" />
    <main
      class="flex-1"
      :class="{
        'ml-[15%]': authStore.isAuthenticated,
        'ml-0': !authStore.isAuthenticated,
      }"
    >
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();
</script>
