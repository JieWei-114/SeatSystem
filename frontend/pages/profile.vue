<template>
  <div class="p-10">
    <div class="flex mb-4 justify-between">
      <h1 class="text-2xl font-bold">Profile</h1>
      <div v-if="authStore.user" class="flex text-lg items-center">
        <h1>Current username: &nbsp;</h1>
        <h1 class="font-bold">{{ authStore.user.username }} - {{ authStore.user.role }}</h1>
      </div>
    </div>
    <form @submit.prevent="handleUpdateProfile" class="space-y-4 mt-4">
      <div>
        <label class="block">New Username</label>
        <input
          v-model="username"
          type="text"
          class="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label class="block">New Password (Optional)</label>
        <input
          v-model="password"
          type="password"
          class="w-full p-2 border rounded"
        />
      </div>
      <button
        type="submit"
        class="w-full p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Update Profile
      </button>
    </form>
    <p
      class="mt-2"
      :class="{ 'text-red-500': error, 'text-green-500': !error }"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { updateUserProfile } from "../services/api";

const authStore = useAuthStore();
const router = useRouter();
const username = ref("");
const password = ref("");
const message = ref("");
const error = ref(false);

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push("/login");
  } else {
    username.value = authStore.user?.username || "";
  }
});

const handleUpdateProfile = async () => {
  try {
    const data = await updateUserProfile(
      username.value,
      password.value || undefined
    );
    authStore.setAuth(authStore.token!, {
      id: data.data.id,
      username: data.data.username,
      role: data.data.role,
    });
    message.value = data.message;
    error.value = false;
    password.value = "";
  } catch (err: any) {
    message.value = err.response?.data?.message || "Profile update failed";
    error.value = true;
  }
};
</script>
