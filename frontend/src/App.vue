<template>
  <div id="app">
    <Navbar v-if="authStore.isAuthenticated" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import Navbar from './components/common/Navbar.vue';

const authStore = useAuthStore();
</script>