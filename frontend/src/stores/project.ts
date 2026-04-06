import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import apiClient from '../services/api';
import type {
  ActivityLog,
  Comment,
  Label,
  NotificationItem,
  PaginatedResponse,
  Project,
  ProjectInvitation,
  ProjectReport,
  ProjectTemplate,
  RecurringTaskRule,
  SavedView,
  Subtask,
  Task,
  TimeEntry,
} from '../types';

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const tasks = ref<Task[]>([]);
  const notifications = ref<NotificationItem[]>([]);
  const invitations = ref<ProjectInvitation[]>([]);
  const activity = ref<ActivityLog[]>([]);
  const templates = ref<ProjectTemplate[]>([]);
  const labels = ref<Label[]>([]);
  const savedViews = ref<SavedView[]>([]);
  const recurringRules = ref<RecurringTaskRule[]>([]);

  const unreadNotifications = computed(() => notifications.value.filter((item) => !item.isRead).length);

  async function fetchProjects() {
    const response = await apiClient.get<PaginatedResponse<Project>>('/projects');
    projects.value = response.data.data;
    return projects.value;
  }

  async function fetchProject(id: string) {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    currentProject.value = response.data;
    return currentProject.value;
  }

  async function createProject(data: Partial<Project>) {
    const response = await apiClient.post<Project>('/projects', data);
    projects.value = [response.data, ...projects.value];
    return response.data;
  }

  async function updateProject(id: string, data: Partial<Project>) {
    const response = await apiClient.patch<Project>(`/projects/${id}`, data);
    projects.value = projects.value.map((project) => (project.id === id ? response.data : project));
    if (currentProject.value?.id === id) {
      currentProject.value = response.data;
    }
    return response.data;
  }

  async function deleteProject(id: string) {
    await apiClient.delete(`/projects/${id}`);
    projects.value = projects.value.filter((project) => project.id !== id);
    if (currentProject.value?.id === id) {
      currentProject.value = null;
    }
  }

  async function inviteUser(projectId: string, email: string) {
    const response = await apiClient.post('/projects/invite', { projectId, email });
    return response.data;
  }

  async function fetchInvitations() {
    const response = await apiClient.get<ProjectInvitation[]>('/projects/invitations/me');
    invitations.value = response.data;
    return invitations.value;
  }

  async function fetchTemplates() {
    const response = await apiClient.get<ProjectTemplate[]>('/projects/templates');
    templates.value = response.data;
    return templates.value;
  }

  async function respondToInvitation(invitationId: string, accept: boolean) {
    const response = await apiClient.post(`/projects/invitations/${invitationId}/respond`, { accept });
    invitations.value = invitations.value.filter((invitation) => invitation.id !== invitationId);
    return response.data;
  }

  async function fetchTasks(projectId: string) {
    const response = await apiClient.get<PaginatedResponse<Task>>(`/tasks/project/${projectId}`);
    tasks.value = response.data.data;
    return tasks.value;
  }

  async function fetchLabels(projectId: string) {
    const response = await apiClient.get<Label[]>(`/tasks/project/${projectId}/labels`);
    labels.value = response.data;
    return labels.value;
  }

  async function createLabel(projectId: string, data: { name: string; color: string }) {
    const response = await apiClient.post<Label>(`/tasks/project/${projectId}/labels`, data);
    labels.value = [...labels.value, response.data];
    return response.data;
  }

  async function fetchMyTasks() {
    const response = await apiClient.get<{ assigned: Task[]; overdue: Task[]; dueSoon: Task[] }>('/tasks/me');
    return response.data;
  }

  async function createTask(data: Partial<Task>) {
    const response = await apiClient.post<Task>('/tasks', data);
    tasks.value = [response.data, ...tasks.value];
    return response.data;
  }

  async function updateTask(id: string, data: Partial<Task>) {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, data);
    tasks.value = tasks.value.map((task) => (task.id === id ? response.data : task));
    return response.data;
  }

  async function deleteTask(id: string) {
    await apiClient.delete(`/tasks/${id}`);
    tasks.value = tasks.value.filter((task) => task.id !== id);
  }

  async function fetchComments(taskId: string) {
    const response = await apiClient.get<Comment[]>(`/tasks/${taskId}/comments`);
    return response.data;
  }

  async function addComment(taskId: string, content: string) {
    const response = await apiClient.post<Comment>(`/tasks/${taskId}/comments`, { content });
    tasks.value = tasks.value.map((task) =>
      task.id === taskId
        ? { ...task, comments: [...(task.comments ?? []), response.data] }
        : task,
    );
    return response.data;
  }

  async function fetchSubtasks(taskId: string) {
    const response = await apiClient.get<Subtask[]>(`/tasks/${taskId}/subtasks`);
    return response.data;
  }

  async function createSubtask(taskId: string, title: string) {
    const response = await apiClient.post<Subtask>(`/tasks/${taskId}/subtasks`, { title });
    tasks.value = tasks.value.map((task) =>
      task.id === taskId ? { ...task, subtasks: [...(task.subtasks ?? []), response.data] } : task,
    );
    return response.data;
  }

  async function toggleSubtask(taskId: string, subtaskId: string, completed: boolean) {
    const response = await apiClient.patch<Subtask>(`/tasks/${taskId}/subtasks/${subtaskId}`, { completed });
    tasks.value = tasks.value.map((task) =>
      task.id === taskId
        ? {
            ...task,
            subtasks: (task.subtasks ?? []).map((subtask) =>
              subtask.id === subtaskId ? response.data : subtask,
            ),
          }
        : task,
    );
    return response.data;
  }

  async function logTime(taskId: string, minutes: number, note?: string) {
    const response = await apiClient.post<TimeEntry>(`/tasks/${taskId}/time-entries`, { minutes, note });
    return response.data;
  }

  async function attachLabel(taskId: string, labelId: string) {
    await apiClient.post(`/tasks/${taskId}/labels/${labelId}`);
  }

  async function detachLabel(taskId: string, labelId: string) {
    await apiClient.delete(`/tasks/${taskId}/labels/${labelId}`);
  }

  async function fetchNotifications() {
    const response = await apiClient.get<NotificationItem[]>('/notifications');
    notifications.value = response.data;
    return notifications.value;
  }

  async function markNotificationAsRead(id: string) {
    await apiClient.patch(`/notifications/${id}/read`);
    notifications.value = notifications.value.map((notification) =>
      notification.id === id ? { ...notification, isRead: true } : notification,
    );
  }

  async function markAllNotificationsAsRead() {
    await apiClient.patch('/notifications/read-all');
    notifications.value = notifications.value.map((notification) => ({ ...notification, isRead: true }));
  }

  async function fetchActivity(projectId?: string) {
    const response = await apiClient.get<ActivityLog[]>(projectId ? `/activity-logs/project/${projectId}` : '/activity-logs/me');
    activity.value = response.data;
    return activity.value;
  }

  async function fetchWorkload(projectId: string) {
    const response = await apiClient.get(`/projects/${projectId}/workload`);
    return response.data;
  }

  async function fetchSavedViews(projectId: string) {
    const response = await apiClient.get<SavedView[]>(`/projects/${projectId}/saved-views`);
    savedViews.value = response.data;
    return savedViews.value;
  }

  async function createSavedView(projectId: string, name: string, filters: Record<string, unknown>) {
    const response = await apiClient.post<SavedView>(`/projects/${projectId}/saved-views`, { name, filters });
    savedViews.value = [response.data, ...savedViews.value];
    return response.data;
  }

  async function fetchRecurringTasks(projectId: string) {
    const response = await apiClient.get<RecurringTaskRule[]>(`/projects/${projectId}/recurring-tasks`);
    recurringRules.value = response.data;
    return recurringRules.value;
  }

  async function createRecurringTask(projectId: string, payload: Partial<RecurringTaskRule>) {
    const response = await apiClient.post<RecurringTaskRule>(`/projects/${projectId}/recurring-tasks`, payload);
    recurringRules.value = [response.data, ...recurringRules.value];
    return response.data;
  }

  async function runRecurringTasks(projectId: string) {
    const response = await apiClient.post(`/projects/${projectId}/recurring-tasks/run`);
    return response.data;
  }

  async function applyTemplate(projectId: string, templateName: string) {
    const response = await apiClient.post(`/projects/${projectId}/apply-template`, { templateName });
    return response.data;
  }

  async function fetchProjectReport(projectId: string) {
    const response = await apiClient.get<ProjectReport>(`/projects/${projectId}/reports/summary`);
    return response.data;
  }

  return {
    projects,
    currentProject,
    tasks,
    notifications,
    invitations,
    activity,
    templates,
    labels,
    savedViews,
    recurringRules,
    unreadNotifications,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    inviteUser,
    fetchInvitations,
    respondToInvitation,
    fetchTemplates,
    fetchTasks,
    fetchLabels,
    createLabel,
    fetchMyTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchComments,
    addComment,
    fetchSubtasks,
    createSubtask,
    toggleSubtask,
    logTime,
    attachLabel,
    detachLabel,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    fetchActivity,
    fetchWorkload,
    fetchSavedViews,
    createSavedView,
    fetchRecurringTasks,
    createRecurringTask,
    runRecurringTasks,
    applyTemplate,
    fetchProjectReport,
  };
});
