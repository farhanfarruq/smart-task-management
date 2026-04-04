import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '../services/api';
import type { Project, Task } from '../types';

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const tasks = ref<Task[]>([]);

  async function fetchProjects() {
    const response = await apiClient.get('/projects');
    const fetchedData = response.data.data ? response.data.data : response.data;
    projects.value = Array.isArray(fetchedData) ? fetchedData : [];
    return projects.value;
  }

  async function fetchProject(id: string) {
    const response = await apiClient.get(`/projects/${id}`);
    currentProject.value = response.data;
    return currentProject.value;
  }

  async function createProject(data: { name: string; description?: string }) {
    const response = await apiClient.post('/projects', data);
    projects.value.push(response.data);
    return response.data;
  }

  async function updateProject(id: string, data: Partial<Project>) {
    const response = await apiClient.patch(`/projects/${id}`, data);
    const index = projects.value.findIndex(p => p.id === id);
    if (index !== -1) projects.value[index] = response.data;
    if (currentProject.value?.id === id) currentProject.value = response.data;
    return response.data;
  }

  async function deleteProject(id: string) {
    await apiClient.delete(`/projects/${id}`);
    projects.value = projects.value.filter(p => p.id !== id);
    if (currentProject.value?.id === id) currentProject.value = null;
  }

  async function inviteUser(projectId: string, email: string) {
    await apiClient.post('/projects/invite', { projectId, email });
  }

  async function fetchTasks(projectId: string) {
    const response = await apiClient.get(`/tasks/project/${projectId}`);
    const fetchedData = response.data.data ? response.data.data : response.data;
    tasks.value = Array.isArray(fetchedData) ? fetchedData : [];
    return tasks.value;
  }

  async function createTask(data: any) {
    const response = await apiClient.post('/tasks', data);
    tasks.value.push(response.data);
    return response.data;
  }

  async function updateTask(id: string, data: Partial<Task>) {
    const response = await apiClient.patch(`/tasks/${id}`, data);
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) tasks.value[index] = response.data;
    return response.data;
  }

  async function deleteTask(id: string) {
    await apiClient.delete(`/tasks/${id}`);
    tasks.value = tasks.value.filter(t => t.id !== id);
  }

  return {
    projects,
    currentProject,
    tasks,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    inviteUser,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
});