<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Projects</h1>
      <button @click="showCreateModal = true" class="btn-primary">+ New Project</button>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="project in projects" :key="project.id" class="card hover:shadow-lg transition">
        <router-link :to="`/projects/${project.id}/tasks`">
          <h2 class="text-xl font-semibold mb-2 text-blue-600 hover:underline">{{ project.name }}</h2>
        </router-link>
        <p class="text-gray-600 mb-4">{{ project.description || 'No description' }}</p>
        <div class="flex justify-between items-center text-sm text-gray-500">
          <span>Owner: {{ project.owner?.email || project.ownerId }}</span>
          <span>{{ project.members?.length || 0 }} members</span>
        </div>
        <div class="mt-4 flex space-x-2">
          <button @click="openInviteModal(project)" class="text-blue-600 text-sm hover:underline">Invite</button>
          <button @click="editProject(project)" class="text-green-600 text-sm hover:underline">Edit</button>
          <button @click="confirmDelete(project)" class="text-red-600 text-sm hover:underline">Delete</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || editingProject" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-96">
        <h2 class="text-xl font-bold mb-4">{{ editingProject ? 'Edit Project' : 'Create Project' }}</h2>
        <div class="space-y-4">
          <input v-model="projectForm.name" placeholder="Project Name" class="w-full border rounded p-2" />
          <textarea v-model="projectForm.description" placeholder="Description" class="w-full border rounded p-2"></textarea>
          <div class="flex justify-end space-x-2">
            <button @click="closeModal" class="btn-secondary">Cancel</button>
            <button @click="saveProject" class="btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <div v-if="inviteProject" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-96">
        <h2 class="text-xl font-bold mb-4">Invite User to {{ inviteProject.name }}</h2>
        <input v-model="inviteEmail" placeholder="user@example.com" class="w-full border rounded p-2 mb-4" />
        <div class="flex justify-end space-x-2">
          <button @click="inviteProject = null" class="btn-secondary">Cancel</button>
          <button @click="sendInvite" class="btn-primary">Invite</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProjectStore } from '../stores/project';
import type { Project } from '../types';
import { useToast } from 'vue-toastification';

const projectStore = useProjectStore();
const toast = useToast();
const projects = ref<Project[]>([]);
const showCreateModal = ref(false);
const editingProject = ref<Project | null>(null);
const projectForm = ref({ name: '', description: '' });
const inviteProject = ref<Project | null>(null);
const inviteEmail = ref('');
const loading = ref(true);

onMounted(async () => {
  try {
    await projectStore.fetchProjects();
    projects.value = projectStore.projects;
  } catch (err: any) {
    toast.error('Failed to load projects');
  } finally {
    loading.value = false;
  }
});

const saveProject = async () => {
  try {
    if (editingProject.value) {
      const updated = await projectStore.updateProject(editingProject.value.id, projectForm.value);
      const index = projects.value.findIndex(p => p.id === updated.id);
      if (index !== -1) projects.value[index] = updated;
      toast.success('Project updated successfully');
    } else {
      const created = await projectStore.createProject(projectForm.value);
      projects.value.push(created);
      toast.success('Project created successfully');
    }
    closeModal();
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Failed to save project';
    toast.error(typeof errorMsg === 'string' ? errorMsg : errorMsg[0]);
  }
};

const editProject = (project: Project) => {
  editingProject.value = project;
  projectForm.value = { name: project.name, description: project.description || '' };
  showCreateModal.value = true;
};

const confirmDelete = async (project: Project) => {
  if (confirm(`Delete project "${project.name}"?`)) {
    try {
      await projectStore.deleteProject(project.id);
      projects.value = projects.value.filter(p => p.id !== project.id);
      toast.success('Project deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  }
};

const openInviteModal = (project: Project) => {
  inviteProject.value = project;
  inviteEmail.value = '';
};

const sendInvite = async () => {
  if (inviteProject.value && inviteEmail.value) {
    try {
      await projectStore.inviteUser(inviteProject.value.id, inviteEmail.value);
      toast.success(`Invitation sent to ${inviteEmail.value}`);
      inviteProject.value = null;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    }
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingProject.value = null;
  projectForm.value = { name: '', description: '' };
};
</script>