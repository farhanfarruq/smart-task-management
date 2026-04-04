<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">{{ project?.name }}</h1>
      <p class="text-gray-600">{{ project?.description }}</p>
    </div>

    <div class="flex justify-between items-center mb-6">
      <div class="flex space-x-2">
        <button @click="showCreateTask = true" class="btn-primary">+ New Task</button>
      </div>
      <div>
        <select v-model="filterUserId" class="border rounded p-2">
          <option value="">All Assignees</option>
          <option v-for="member in project?.members" :key="member.id" :value="member.id">
            {{ member.name || member.email }}
          </option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- TODO Column -->
      <div class="bg-gray-100 rounded-lg p-4">
        <h2 class="font-bold text-lg mb-3 text-yellow-700">To Do</h2>
        <draggable group="tasks" :list="todoTasks" item-key="id" @end="onDragEnd">
          <template #item="{ element }">
            <div class="bg-white rounded shadow p-3 mb-2 cursor-move">
              <h3 class="font-semibold">{{ element.title }}</h3>
              <p class="text-sm text-gray-600">{{ element.description }}</p>
              <div class="flex justify-between mt-2 text-xs">
                <span class="text-blue-600">{{ element.assignee?.name || 'Unassigned' }}</span>
                <span class="text-gray-400">{{ formatDate(element.deadline) }}</span>
              </div>
              <div class="flex justify-end mt-2 space-x-2">
                <button @click="editTask(element)" class="text-green-600">Edit</button>
                <button @click="deleteTask(element.id)" class="text-red-600">Delete</button>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- IN_PROGRESS Column -->
      <div class="bg-gray-100 rounded-lg p-4">
        <h2 class="font-bold text-lg mb-3 text-blue-700">In Progress</h2>
        <draggable group="tasks" :list="inProgressTasks" item-key="id" @end="onDragEnd">
          <template #item="{ element }">
            <div class="bg-white rounded shadow p-3 mb-2 cursor-move">
              <h3 class="font-semibold">{{ element.title }}</h3>
              <p class="text-sm text-gray-600">{{ element.description }}</p>
              <div class="flex justify-between mt-2 text-xs">
                <span class="text-blue-600">{{ element.assignee?.name || 'Unassigned' }}</span>
                <span class="text-gray-400">{{ formatDate(element.deadline) }}</span>
              </div>
              <div class="flex justify-end mt-2 space-x-2">
                <button @click="editTask(element)" class="text-green-600">Edit</button>
                <button @click="deleteTask(element.id)" class="text-red-600">Delete</button>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- DONE Column -->
      <div class="bg-gray-100 rounded-lg p-4">
        <h2 class="font-bold text-lg mb-3 text-green-700">Done</h2>
        <draggable group="tasks" :list="doneTasks" item-key="id" @end="onDragEnd">
          <template #item="{ element }">
            <div class="bg-white rounded shadow p-3 mb-2 cursor-move">
              <h3 class="font-semibold line-through">{{ element.title }}</h3>
              <p class="text-sm text-gray-600">{{ element.description }}</p>
              <div class="flex justify-between mt-2 text-xs">
                <span class="text-blue-600">{{ element.assignee?.name || 'Unassigned' }}</span>
                <span class="text-gray-400">{{ formatDate(element.deadline) }}</span>
              </div>
              <div class="flex justify-end mt-2 space-x-2">
                <button @click="editTask(element)" class="text-green-600">Edit</button>
                <button @click="deleteTask(element.id)" class="text-red-600">Delete</button>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Create/Edit Task Modal -->
    <div v-if="showCreateTask || editingTask" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-96">
        <h2 class="text-xl font-bold mb-4">{{ editingTask ? 'Edit Task' : 'Create Task' }}</h2>
        <div class="space-y-3">
          <input v-model="taskForm.title" placeholder="Task Title" class="w-full border rounded p-2" />
          <textarea v-model="taskForm.description" placeholder="Description" class="w-full border rounded p-2"></textarea>
          <input type="datetime-local" v-model="taskForm.deadline" class="w-full border rounded p-2" />
          <select v-model="taskForm.assigneeId" class="w-full border rounded p-2">
            <option value="">Unassigned</option>
            <option v-for="member in project?.members" :key="member.id" :value="member.id">
              {{ member.name || member.email }}
            </option>
          </select>
          <div class="flex justify-end space-x-2">
            <button @click="closeTaskModal" class="btn-secondary">Cancel</button>
            <button @click="saveTask" class="btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../stores/project';
import type { Task } from '../types';
import draggable from 'vuedraggable';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const projectId = route.params.id as string;
const project = ref(projectStore.currentProject);
const tasks = ref<Task[]>([]);
const filterUserId = ref('');
const showCreateTask = ref(false);
const editingTask = ref<Task | null>(null);
const loading = ref(true);
const toast = useToast();
const taskForm = ref({
  title: '',
  description: '',
  deadline: '',
  assigneeId: '',
  projectId,
});

const todoTasks = computed(() => 
  tasks.value.filter(t => t.status === 'TODO' && (!filterUserId.value || t.assigneeId === filterUserId.value))
);
const inProgressTasks = computed(() => 
  tasks.value.filter(t => t.status === 'IN_PROGRESS' && (!filterUserId.value || t.assigneeId === filterUserId.value))
);
const doneTasks = computed(() => 
  tasks.value.filter(t => t.status === 'DONE' && (!filterUserId.value || t.assigneeId === filterUserId.value))
);

const formatDate = (date?: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const loadData = async () => {
  loading.value = true;
  try {
    await projectStore.fetchProject(projectId);
    project.value = projectStore.currentProject;
    if (!project.value) {
      toast.error('Project not found');
      router.push('/projects');
      return;
    }
    await projectStore.fetchTasks(projectId);
    tasks.value = projectStore.tasks;
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to load project details');
  } finally {
    loading.value = false;
  }
};

const saveTask = async () => {
  const payload = {
    ...taskForm.value,
    deadline: taskForm.value.deadline || undefined,
  };
  try {
    if (editingTask.value) {
      const updated = await projectStore.updateTask(editingTask.value.id, payload);
      const index = tasks.value.findIndex(t => t.id === updated.id);
      if (index !== -1) tasks.value[index] = updated;
      toast.success('Task updated successfully');
    } else {
      const created = await projectStore.createTask(payload);
      tasks.value.push(created);
      toast.success('Task created successfully');
    }
    closeTaskModal();
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Failed to save task';
    toast.error(typeof errorMsg === 'string' ? errorMsg : errorMsg[0]);
  }
};

const editTask = (task: Task) => {
  editingTask.value = task;
  taskForm.value = {
    title: task.title,
    description: task.description || '',
    deadline: task.deadline ? task.deadline.slice(0, 16) : '',
    assigneeId: task.assigneeId || '',
    projectId: task.projectId,
  };
  showCreateTask.value = true;
};

const deleteTask = async (id: string) => {
  if (confirm('Delete task?')) {
    try {
      await projectStore.deleteTask(id);
      tasks.value = tasks.value.filter(t => t.id !== id);
      toast.success('Task deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  }
};

const onDragEnd = async (evt: any) => {
  const taskId = evt.item.__draggable_context.element.id;
  const newStatus = evt.to.parentElement.querySelector('h2').innerText.trim();
  let status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  if (newStatus === 'To Do') status = 'TODO';
  else if (newStatus === 'In Progress') status = 'IN_PROGRESS';
  else status = 'DONE';
  
  try {
    await projectStore.updateTask(taskId, { status });
    const task = tasks.value.find(t => t.id === taskId);
    if (task) task.status = status;
    toast.success('Task moved successfully');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to move task');
    // Refresh to revert the ui change since backend failed
    loadData();
  }
};

const closeTaskModal = () => {
  showCreateTask.value = false;
  editingTask.value = null;
  taskForm.value = { title: '', description: '', deadline: '', assigneeId: '', projectId };
};

onMounted(() => {
  loadData();
});
</script>