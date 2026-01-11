<template>
  <div class="w-[30%] mx-auto pt-[10%]">
    <div>
      <h1 class="text-2xl font-bold mb-4 flex justify-center">Register</h1>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="text-base">Role</label>
          <div class="select">
            <select
              v-model="role"
              class="w-full p-2 bg-gray-500 text-white rounded border-none outline-none cursor-pointer focus:bg-gray-600 hover:bg-gray-600 transition-colors duration-200"
            >
              <option value="normal_user">Normal User</option>
              <option value="facility_manager">Facility Manager</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>
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
          Register
        </button>
      </form>
      <p
        class="mt-2"
        :class="{ 'text-red-500': error, 'text-green-500': !error }"
      >
        {{ message }}
      </p>
      <p class="mt-2">
        Already have an account?
        <NuxtLink to="/login" class="text-gray-500">Login</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { registerUser } from "../services/api";

const username = ref("");
const password = ref("");
const role = ref<"super_admin" | "facility_manager" | "normal_user">(
  "normal_user"
);
const message = ref("");
const error = ref(false);
const router = useRouter();

const handleRegister = async () => {
  try {
    const data = await registerUser(username.value, password.value, role.value);
    message.value = data.message;
    error.value = false;
    setTimeout(() => router.push("/login"), 1000);
  } catch (err: any) {
    message.value = err.response?.data?.message || "Registration failed";
    error.value = true;
  }
};
</script>

<style scoped></style>
