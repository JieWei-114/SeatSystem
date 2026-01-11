<template>
  <div class="p-10">
    <h1 class="text-2xl font-bold mb-4">Manage Users</h1>
    <div class="mb-4 flex space-x-2">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search user by exact name..."
        class="w-[85%] p-2 border rounded"
      />
      <button
        @click="fetchUsers"
        class="p-2 w-[15%] bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Search
      </button>
    </div>
    <div v-if="message" class="mb-4" :class="{ 'text-red-500': error, 'text-green-500': !error }">
      {{ message }}
    </div>
    <table class="w-full ">
      <thead>
        <tr class="bg-gray-200">
          <th class="p-3 w-[10%]">ID</th>
          <th class="p-3 w-[40%]">Username</th>
          <th class="p-3 w-[30%]">Role</th>
          <th class="p-3 w-[20%]">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" class="border-t">
          <td class="p-3">{{ user.id }}</td>
          <td class="p-3">
            <input
              v-if="editingUserId === user.id"
              v-model="editedUsername"
              type="text"
              class="pl-2 border"
            />
            <span v-else>{{ user.username }}</span>
          </td>
          <td class="p-3">{{ user.role }}</td>
          <td class="p-3 flex space-x-2">
            <button
              v-if="editingUserId === user.id"
              @click="saveUser(user.id)"
              class="p-1 pl-4 px-4 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              v-else
              @click="editUser(user)"
              class="p-1 pl-4 px-4 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Edit
            </button>
            <button
              @click="deleteUser(user.id)"
              class="p-1 pl-4 px-4 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { searchUsers, updateUserByAdmin, deleteUserByAdmin } from '../../services/api';

const authStore = useAuthStore();
const searchQuery = ref('');
const users = ref<{ id: number; username: string; role: string }[]>([]);
const editingUserId = ref<number | null>(null);
const editedUsername = ref('');
const message = ref('');
const error = ref(false);
const router = useRouter();

onMounted(() => {
  if (!authStore.isAuthenticated || !['super_admin', 'facility_manager'].includes(authStore.user?.role || '')) {
    router.push('/booking');
  } else {
    fetchUsers(); // Load all users initially
  }
});

const fetchUsers = async () => {
  try {
    const data = await searchUsers(searchQuery.value);
    users.value = data.data;
    message.value = searchQuery.value && !data.data.length ? 'No user found' : '';
    error.value = false;
  } catch (err: any) {
    message.value = err.response?.data?.message || 'Failed to fetch users';
    error.value = true;
  }
};

const editUser = (user: { id: number; username: string; role: string }) => {
  editingUserId.value = user.id;
  editedUsername.value = user.username;
};

const saveUser = async (userId: number) => {
  try {
    const data = await updateUserByAdmin(userId, editedUsername.value);
    message.value = data.message;
    error.value = false;
    editingUserId.value = null;
    fetchUsers();
  } catch (err: any) {
    message.value = err.response?.data?.message || 'Failed to update user';
    error.value = true;
  }
};

const deleteUser = async (userId: number) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      const data = await deleteUserByAdmin(userId);
      message.value = data.message;
      error.value = false;
      fetchUsers();
    } catch (err: any) {
      message.value = err.response?.data?.message || 'Failed to delete user';
      error.value = true;
    }
  }
};
</script>

<style scoped>
table {
  border: 1px solid #ddd;
  border-radius: 20px;
}
th,
td {
  text-align: left;
}
</style>