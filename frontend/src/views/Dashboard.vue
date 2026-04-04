<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">My Projects</h2>
        <div v-if="projects.length === 0" class="text-gray-500">No projects yet</div>
        <div v-for="project in projects.slice(0, 5)" :key="project.id" class="mb-3">
          <router-link :to="`/projects/${project.id}/tasks`" class="text-blue-600 hover:underline">
            {{ project.name }}
          </router-link>
          <p class="text-sm text-gray-600">{{ project.description }}</p>
        </div>
        <router-link to="/projects" class="text-blue-600 text-sm hover:underline mt-2 inline-block">
          View all projects →
        </router-link>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
        <div v-if="activities.length === 0" class="text-gray-500">No recent activity</div>
        <div v-for="activity in activities" :key="activity.id" class="mb-2 text-sm">
          <span class="font-medium">{{ activity.user?.name || activity.userId }}</span>
          <span class="text-gray-600"> {{ activity.action }}</span>
          <span class="text-gray-400 text-xs ml-2">{{ formatDate(activity.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProjectStore } from '../stores/project';
import apiClient from '../services/api';
import type { ActivityLog } from '../types';

const projectStore = useProjectStore();
const projects = ref(projectStore.projects);
const activities = ref<ActivityLog[]>([]);

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

onMounted(async () => {
  await projectStore.fetchProjects();
  projects.value = projectStore.projects;
  
  try {
    const response = await apiClient.get('/activity-logs/me');
    activities.value = response.data;
  } catch (err) {
    console.error('Failed to fetch activities', err);
  }
});
</script>