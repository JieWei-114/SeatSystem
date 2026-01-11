<template>
  <div
    class="bg-gray-800 text-white w-[15%] min-h-screen p-4 fixed top-0 left-0 flex flex-col"
  >
    <div class="text-2xl font-bold mb-6 py-2 px-4">Bleak Future</div>
    <nav>
      <ul class="space-y-4">
        <li>
          <NuxtLink
            to="/booking"
            class="block py-2 px-4 hover:bg-gray-700 rounded"
            >Booking</NuxtLink
          >
        </li>
        <li>
          <NuxtLink
            to="/history"
            class="block py-2 px-4 hover:bg-gray-700 rounded"
            >History</NuxtLink
          >
        </li>
        <li v-if="isAdminOrManager" class="relative">
          <button
            @click="toggleManageMenu"
            class="block w-full text-left py-2 px-4 hover:bg-gray-700 rounded flex justify-between"
          >
            Manage
            <span :class="{ 'rotate-180': manageMenuOpen }">▼</span>
          </button>
          <ul v-show="manageMenuOpen" class="mt-2 space-y-2 bg-gray-700">
            <li>
              <NuxtLink
                to="/admin/userManage"
                class="block py-2 px-8 hover:bg-gray-600 rounded"
                >User manage</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/admin/buildingManage"
                class="block py-2 px-8 hover:bg-gray-600 rounded"
                >Building manage</NuxtLink
              >
            </li>
          </ul>
        </li>
        <li>
          <NuxtLink
            to="/profile"
            class="block py-2 px-4 hover:bg-gray-700 rounded"
            >Profile</NuxtLink
          >
        </li>
        <li>
          <button
            @click="handleLogout"
            class="block w-full text-left py-2 px-4 hover:bg-gray-700 rounded hover:text-red-400"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";

const authStore = useAuthStore();
const router = useRouter();

const isAdminOrManager = computed(() =>
  ["super_admin", "facility_manager"].includes(authStore.user?.role || "")
);
const isSuperAdmin = computed(() => authStore.user?.role === "super_admin");

const manageMenuOpen = ref(false);

const handleLogout = () => {
  authStore.clearAuth();
  router.push("/login");
};

const toggleManageMenu = () => {
  manageMenuOpen.value = !manageMenuOpen.value;
};
</script>
