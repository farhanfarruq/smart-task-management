<template>
  <nav class="bg-white shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <div class="flex space-x-8">
          <router-link to="/" class="text-gray-700 hover:text-blue-600">Dashboard</router-link>
          <router-link to="/projects" class="text-gray-700 hover:text-blue-600">Projects</router-link>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">{{ authStore.user?.email }}</span>
          <button @click="handleLogout" class="btn-secondary text-sm">Logout</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>