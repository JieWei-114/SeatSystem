<template>
  <div class="w-[30%] mx-auto pt-[10%]">
    <div>
      <h1 class="text-2xl font-bold mb-4 flex justify-center">Login</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="text-base">Username</label>
          <input
            v-model="username"
            type="text"
            class="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label class="text-base">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full p-2 bg-gray-800 text-white rounded hover:bg-gray-500"
        >
          Login
        </button>
      </form>
      <p
        class="mt-2"
        :class="{ 'text-red-500': error, 'text-green-500': !error }"
      >
        {{ message }}
      </p>
      <p class="mt-2">
        Don’t have an account?
        <NuxtLink to="/register" class="text-gray-500">Register</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { loginUser } from "../services/api";

const username = ref("");
const password = ref("");
const message = ref("");
const error = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  try {
    const data = await loginUser(username.value, password.value);
    authStore.setAuth(data.data.token, data.data.user);
    message.value = `Welcome, ${data.data.user.username}!`;
    error.value = false;
    setTimeout(() => router.push("/booking"), 1000);
  } catch (err: any) {
    message.value = err.response?.data?.message || "Login failed";
    error.value = true;
  }
};
</script>
