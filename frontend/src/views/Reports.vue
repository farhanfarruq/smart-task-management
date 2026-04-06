<template>
  <section class="space-y-6">
    <div class="page-header">
      <div>
        <h1 class="page-title">Reports & Export</h1>
        <p class="page-subtitle">Ringkasan performa project, status task, prioritas, dan kontribusi tim.</p>
      </div>
      <button class="btn-primary" @click="exportCsv" :disabled="!report">Export CSV</button>
    </div>

    <div class="panel">
      <select v-model="selectedProjectId" class="field max-w-sm" @change="loadReport">
        <option value="">Select project</option>
        <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
      </select>
    </div>

    <div v-if="report" class="space-y-5">
      <div class="stat-grid">
        <div class="stat-card">
          <p class="stat-label">Total Tasks</p>
          <p class="stat-value">{{ report.summary.totalTasks }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Completed</p>
          <p class="stat-value">{{ report.summary.completedTasks }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Overdue</p>
          <p class="stat-value">{{ report.summary.overdueTasks }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Tracked Minutes</p>
          <p class="stat-value">{{ report.summary.totalTrackedMinutes }}</p>
        </div>
      </div>

      <div class="grid gap-5 xl:grid-cols-2">
        <div class="panel">
          <h2 class="panel-title">By Status</h2>
          <div class="mt-5 space-y-3">
            <div v-for="(value, key) in report.byStatus" :key="key" class="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>{{ pretty(key) }}</span>
              <span class="font-semibold">{{ value }}</span>
            </div>
          </div>
        </div>
        <div class="panel">
          <h2 class="panel-title">Top Contributors</h2>
          <div class="mt-5 space-y-3">
            <div v-for="person in report.topContributors" :key="person.id" class="rounded-2xl bg-slate-50 px-4 py-3">
              <p class="font-semibold">{{ person.name || person.email }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ person.assignedTasks }} assigned tasks • {{ person.trackedMinutes }} minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">Pilih project untuk melihat report summary.</div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useProjectStore } from '../stores/project';
import type { Project, ProjectReport } from '../types';

const projectStore = useProjectStore();
const projects = ref<Project[]>([]);
const selectedProjectId = ref('');
const report = ref<ProjectReport | null>(null);

const pretty = (value: string) => value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase());

const loadReport = async () => {
  if (!selectedProjectId.value) {
    report.value = null;
    return;
  }
  report.value = await projectStore.fetchProjectReport(selectedProjectId.value);
};

const exportCsv = () => {
  if (!report.value) return;
  const rows = [
    ['metric', 'value'],
    ['totalTasks', String(report.value.summary.totalTasks)],
    ['completedTasks', String(report.value.summary.completedTasks)],
    ['overdueTasks', String(report.value.summary.overdueTasks)],
    ['progress', String(report.value.summary.progress)],
    ['totalTrackedMinutes', String(report.value.summary.totalTrackedMinutes)],
  ];
  const csv = rows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `project-report-${report.value.project.id}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

onMounted(async () => {
  projects.value = await projectStore.fetchProjects();
});
</script>
