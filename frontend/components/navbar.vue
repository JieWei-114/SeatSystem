<template>
  <div
    v-if="uiStore.isSidebarOpen"
    @click="uiStore.closeSidebar()"
    class="fixed inset-0 bg-black/50 z-40 md:hidden"
  ></div>
  <div
    class="bg-gray-800 text-white w-[220px] h-dvh p-4 fixed top-0 left-0 z-50 transition-transform duration-300 md:translate-x-0 overflow-y-auto custom-scrollbar"
    :class="uiStore.isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex justify-between items-center mb-6 pt-6 pb-2 pl-2">
      <div class="text-2xl font-bold mb-6 pt-5">Bleak Future</div>
      <button @click="uiStore.closeSidebar()" class="md:hidden p-2 text-gray-400">✕</button>
    </div>
    <nav>
      <ul class="space-y-4">
        <li>
          <NuxtLink to="/booking" class="block py-2 px-2 hover:bg-gray-700 rounded"
            >Booking</NuxtLink
          >
        </li>
        <li>
          <NuxtLink to="/history" class="block py-2 px-2 hover:bg-gray-700 rounded"
            >History</NuxtLink
          >
        </li>
        <li v-if="isAdminOrManager" class="relative">
          <button
            @click="toggleManageMenu"
            class="block w-full text-left py-2 px-2 hover:bg-gray-700 rounded flex justify-between"
          >
            Manage
            <span :class="{ 'rotate-180': manageMenuOpen }">▼</span>
          </button>
          <ul v-show="manageMenuOpen" class="mt-2 space-y-2 bg-gray-700 rounded">
            <li>
              <NuxtLink to="/admin/userManage" class="block py-2 px-4 hover:bg-gray-600 rounded"
                >User manage</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/admin/buildingManage" class="block py-2 px-4 hover:bg-gray-600 rounded"
                >Building manage</NuxtLink
              >
            </li>
          </ul>
        </li>
        <li>
          <NuxtLink to="/profile" class="block py-2 px-2 hover:bg-gray-700 rounded"
            >Profile</NuxtLink
          >
        </li>
        <li>
          <button
            @click="handleLogout"
            class="block w-full text-left py-2 px-2 hover:bg-gray-700 rounded hover:text-red-400"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useUIStore } from '../stores/ui';
import { computed, ref } from 'vue';

const authStore = useAuthStore();
const router = useRouter();
const uiStore = useUIStore();

const isAdminOrManager = computed(() =>
  ['super_admin', 'facility_manager'].includes(authStore.user?.role || '')
);
const isSuperAdmin = computed(() => authStore.user?.role === 'super_admin');

const manageMenuOpen = ref(false);

const handleLogout = () => {
  authStore.clearAuth();
  router.push('/login');
};

const toggleManageMenu = () => {
  manageMenuOpen.value = !manageMenuOpen.value;
};

const isOpen = ref(false);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 10px;
}
</style>
