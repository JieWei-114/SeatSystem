<template>
  <div class="flex min-h-dvh bg-gray-100">
    <ClientOnly>
      <template v-if="authStore.isAuthenticated">
        <Navbar />
        
        <header class="md:hidden fixed top-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center z-30 shadow-md">
          <span class="font-bold">Bleak Future</span>
          <button @click="uiStore.openSidebar()" class="p-2 hover:bg-gray-700 rounded transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
      </template>

      <main 
        class="flex-1 transition-all duration-300"
        :class="{ 
          'md:ml-48': authStore.isAuthenticated, // 电脑端留出固定 64 的宽度
          'pt-16 md:pt-0': authStore.isAuthenticated // 手机端留出顶部控制栏高度
        }"
      >
        <div class="p-4 md:p-8">
          <NuxtPage />
        </div>
      </main>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import { useUIStore } from './stores/ui'

const authStore = useAuthStore();
const uiStore = useUIStore()

</script>
