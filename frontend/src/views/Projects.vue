<template>
  <section class="space-y-6">
    <div class="page-header">
      <div>
        <h1 class="page-title">Projects Workspace</h1>
        <p class="page-subtitle">Kelola delivery, anggota, deadline, dan health project dalam satu tampilan.</p>
      </div>
      <button @click="openCreate" class="btn-primary">Create Project</button>
    </div>

    <div class="panel">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <input v-model="search" class="field lg:max-w-sm" placeholder="Search project name or description" />
        <div class="flex flex-wrap gap-3">
          <select v-model="statusFilter" class="field lg:w-48">
            <option value="">All statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select v-model="sortBy" class="field lg:w-48">
            <option value="updated">Latest updated</option>
            <option value="progress">Best progress</option>
            <option value="deadline">Nearest deadline</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="filteredProjects.length === 0" class="empty-state">Belum ada project yang cocok dengan filter ini.</div>
    <div v-else class="grid gap-5 xl:grid-cols-2">
      <article v-for="project in filteredProjects" :key="project.id" class="panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-3">
              <span class="h-4 w-4 rounded-full" :style="{ backgroundColor: project.color }"></span>
              <h2 class="text-xl font-semibold text-slate-950">{{ project.name }}</h2>
            </div>
            <p class="mt-3 text-sm leading-6 text-slate-500">{{ project.description || 'No project brief yet.' }}</p>
          </div>
          <span class="chip" :class="statusClass(project.status)">{{ pretty(project.status) }}</span>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Progress</p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">{{ project.progress ?? 0 }}%</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Members</p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">{{ project.members.length }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Overdue</p>
            <p class="mt-2 text-2xl font-semibold text-rose-600">{{ project.overdueTasks ?? 0 }}</p>
          </div>
        </div>

        <div class="mt-5 h-2 rounded-full bg-slate-100">
          <div class="h-2 rounded-full" :style="{ width: `${project.progress ?? 0}%`, backgroundColor: project.color }"></div>
        </div>

        <div class="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>Owner: {{ project.owner?.name || project.owner?.email || project.ownerId }}</span>
          <span>Due: {{ formatDate(project.dueDate) }}</span>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <router-link :to="`/projects/${project.id}/tasks`" class="btn-primary">Open Board</router-link>
          <button class="btn-secondary" @click="editProject(project)">Edit</button>
          <button class="btn-secondary" @click="openInvite(project)">Invite</button>
          <button class="btn-secondary text-rose-600" @click="confirmDelete(project)">Delete</button>
        </div>
      </article>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div class="panel w-full max-w-2xl">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="panel-title">{{ editingProject ? 'Edit Project' : 'Create Project' }}</h2>
            <p class="panel-subtitle">Lengkapi detail agar tim lebih mudah memantau progres.</p>
          </div>
          <button class="btn-secondary" @click="closeModal">Close</button>
        </div>
        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <input v-model="projectForm.name" class="field md:col-span-2" placeholder="Project name" />
          <textarea v-model="projectForm.description" class="field md:col-span-2 min-h-28" placeholder="Project brief"></textarea>
          <select v-model="projectForm.status" class="field">
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <input v-model.number="projectForm.health" class="field" type="number" min="0" max="100" placeholder="Health 0-100" />
          <input v-model="projectForm.startDate" class="field" type="date" />
          <input v-model="projectForm.dueDate" class="field" type="date" />
          <input v-model="projectForm.color" class="field" type="color" />
          <input v-model="projectForm.icon" class="field" placeholder="Icon label" />
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button class="btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn-primary" @click="saveProject">Save Project</button>
        </div>
      </div>
    </div>

    <div v-if="inviteProject" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div class="panel w-full max-w-lg">
        <h2 class="panel-title">Invite team member</h2>
        <p class="panel-subtitle">Kirim undangan ke project {{ inviteProject.name }}.</p>
        <input v-model="inviteEmail" class="field mt-5" placeholder="teammate@example.com" />
        <div class="mt-6 flex justify-end gap-3">
          <button class="btn-secondary" @click="inviteProject = null">Cancel</button>
          <button class="btn-primary" @click="sendInvite">Send Invitation</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useProjectStore } from '../stores/project';
import type { Project, ProjectStatus } from '../types';

const projectStore = useProjectStore();
const toast = useToast();
const projects = ref<Project[]>([]);
const search = ref('');
const statusFilter = ref<ProjectStatus | ''>('');
const sortBy = ref<'updated' | 'progress' | 'deadline'>('updated');
const showModal = ref(false);
const editingProject = ref<Project | null>(null);
const inviteProject = ref<Project | null>(null);
const inviteEmail = ref('');
const projectForm = ref({
  name: '',
  description: '',
  status: 'PLANNING' as ProjectStatus,
  health: 75,
  startDate: '',
  dueDate: '',
  color: '#2563eb',
  icon: 'layers',
});

const statusClass = (status: ProjectStatus) => ({
  'chip-blue': status === 'ACTIVE',
  'chip-amber': status === 'PLANNING' || status === 'ON_HOLD',
  'chip-emerald': status === 'COMPLETED',
  'chip-slate': status === 'ARCHIVED',
});

const pretty = (value: string) => value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase());
const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : 'No date');

const filteredProjects = computed(() => {
  const query = search.value.toLowerCase();
  return [...projects.value]
    .filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(query) ||
        (project.description || '').toLowerCase().includes(query);
      const matchesStatus = !statusFilter.value || project.status === statusFilter.value;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy.value === 'progress') {
        return (b.progress ?? 0) - (a.progress ?? 0);
      }
      if (sortBy.value === 'deadline') {
        return new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime();
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
});

const resetForm = () => {
  projectForm.value = {
    name: '',
    description: '',
    status: 'PLANNING',
    health: 75,
    startDate: '',
    dueDate: '',
    color: '#2563eb',
    icon: 'layers',
  };
};

const openCreate = () => {
  editingProject.value = null;
  resetForm();
  showModal.value = true;
};

const editProject = (project: Project) => {
  editingProject.value = project;
  projectForm.value = {
    name: project.name,
    description: project.description || '',
    status: project.status,
    health: project.health,
    startDate: project.startDate?.slice(0, 10) || '',
    dueDate: project.dueDate?.slice(0, 10) || '',
    color: project.color,
    icon: project.icon,
  };
  showModal.value = true;
};

const openInvite = (project: Project) => {
  inviteProject.value = project;
  inviteEmail.value = '';
};

const closeModal = () => {
  showModal.value = false;
  editingProject.value = null;
};

const saveProject = async () => {
  try {
    const payload = {
      ...projectForm.value,
      startDate: projectForm.value.startDate || undefined,
      dueDate: projectForm.value.dueDate || undefined,
    };
    if (editingProject.value) {
      await projectStore.updateProject(editingProject.value.id, payload);
      toast.success('Project updated');
    } else {
      await projectStore.createProject(payload);
      toast.success('Project created');
    }
    projects.value = [...projectStore.projects];
    closeModal();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save project');
  }
};

const sendInvite = async () => {
  if (!inviteProject.value) return;
  try {
    await projectStore.inviteUser(inviteProject.value.id, inviteEmail.value);
    toast.success('Invitation sent');
    inviteProject.value = null;
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to send invitation');
  }
};

const confirmDelete = async (project: Project) => {
  if (!confirm(`Delete project "${project.name}"?`)) return;
  try {
    await projectStore.deleteProject(project.id);
    projects.value = [...projectStore.projects];
    toast.success('Project deleted');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to delete project');
  }
};

onMounted(async () => {
  projects.value = await projectStore.fetchProjects();
});
</script>
