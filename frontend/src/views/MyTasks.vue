<template>
  <section class="space-y-6">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Tasks</h1>
        <p class="page-subtitle">Tampilan fokus untuk menjaga prioritas, deadline, dan ritme kerja pribadi.</p>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <p class="stat-label">Assigned</p>
        <p class="stat-value">{{ assigned.length }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Overdue</p>
        <p class="stat-value">{{ overdue.length }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Due This Week</p>
        <p class="stat-value">{{ dueSoon.length }}</p>
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-3">
      <div class="panel">
        <h2 class="panel-title">Assigned To Me</h2>
        <div class="mt-5 space-y-3">
          <div v-if="assigned.length === 0" class="empty-state">No assigned tasks.</div>
          <article v-for="task in assigned" :key="task.id" class="task-card">
            <p class="font-semibold">{{ task.title }}</p>
            <p class="mt-2 text-sm text-slate-500">{{ task.project?.name || 'Project task' }}</p>
            <div class="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>{{ pretty(task.priority) }}</span>
              <span>{{ formatDate(task.deadline) }}</span>
            </div>
          </article>
        </div>
      </div>

      <div class="panel">
        <h2 class="panel-title">Overdue</h2>
        <div class="mt-5 space-y-3">
          <div v-if="overdue.length === 0" class="empty-state">Semua task masih terkendali.</div>
          <article v-for="task in overdue" :key="task.id" class="task-card border-rose-200">
            <p class="font-semibold">{{ task.title }}</p>
            <p class="mt-2 text-sm text-slate-500">{{ task.project?.name || 'Project task' }}</p>
            <p class="mt-3 text-xs text-rose-500">Due {{ formatDate(task.deadline) }}</p>
          </article>
        </div>
      </div>

      <div class="panel">
        <h2 class="panel-title">Due Soon</h2>
        <div class="mt-5 space-y-3">
          <div v-if="dueSoon.length === 0" class="empty-state">Tidak ada deadline mendekat.</div>
          <article v-for="task in dueSoon" :key="task.id" class="task-card">
            <p class="font-semibold">{{ task.title }}</p>
            <p class="mt-2 text-sm text-slate-500">{{ task.project?.name || 'Project task' }}</p>
            <p class="mt-3 text-xs text-slate-400">Due {{ formatDate(task.deadline) }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useProjectStore } from '../stores/project';
import type { Task } from '../types';

const projectStore = useProjectStore();
const assigned = ref<Task[]>([]);
const overdue = ref<Task[]>([]);
const dueSoon = ref<Task[]>([]);

const pretty = (value: string) => value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase());
const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : 'No date');

onMounted(async () => {
  const response = await projectStore.fetchMyTasks();
  assigned.value = response.assigned;
  overdue.value = response.overdue;
  dueSoon.value = response.dueSoon;
});
</script>
