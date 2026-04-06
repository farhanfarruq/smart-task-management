<template>
  <section class="space-y-6">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ project?.name || 'Project Board' }}</h1>
        <p class="page-subtitle">{{ project?.description || 'Task board untuk koordinasi eksekusi tim.' }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button class="btn-secondary" @click="saveCurrentView">Save View</button>
        <button class="btn-secondary" @click="applySelectedTemplate">Apply Template</button>
        <button class="btn-secondary" @click="runRecurring">Run Recurring</button>
        <button class="btn-primary" @click="openCreate">New Task</button>
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div class="panel">
        <div class="grid gap-4 lg:grid-cols-4">
          <input v-model="search" class="field lg:col-span-2" placeholder="Search task title or description" />
          <select v-model="assigneeFilter" class="field">
            <option value="">All assignees</option>
            <option v-for="member in project?.members || []" :key="member.id" :value="member.id">
              {{ member.name || member.email }}
            </option>
          </select>
          <select v-model="priorityFilter" class="field">
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <select v-model="statusFilter" class="field">
            <option value="">All statuses</option>
            <option v-for="status in fullStatuses" :key="status" :value="status">{{ pretty(status) }}</option>
          </select>
          <select v-model="selectedLabelId" class="field">
            <option value="">All labels</option>
            <option v-for="label in labels" :key="label.id" :value="label.id">{{ label.name }}</option>
          </select>
          <select v-model="selectedSavedViewId" class="field" @change="applySavedView">
            <option value="">Saved view</option>
            <option v-for="view in savedViews" :key="view.id" :value="view.id">{{ view.name }}</option>
          </select>
          <select v-model="selectedTemplateName" class="field">
            <option value="">Template</option>
            <option v-for="template in templates" :key="template.id" :value="template.name">{{ template.name }}</option>
          </select>
        </div>
      </div>

      <div class="panel">
        <h2 class="panel-title">Recurring Tasks</h2>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <input v-model="recurringForm.title" class="field" placeholder="Recurring title" />
          <select v-model="recurringForm.frequency" class="field">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
          <input v-model.number="recurringForm.interval" class="field" type="number" min="1" placeholder="Interval" />
          <input v-model="recurringForm.nextRunAt" class="field" type="datetime-local" />
        </div>
        <button class="btn-primary mt-4" @click="createRecurring">Create Rule</button>
        <div class="mt-4 space-y-3">
          <div v-for="rule in recurringRules.slice(0, 3)" :key="rule.id" class="rounded-2xl bg-slate-50 p-3 text-sm">
            <p class="font-semibold text-slate-900">{{ rule.title }}</p>
            <p class="text-slate-500">{{ pretty(rule.frequency) }} every {{ rule.interval }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="panel-title">Board View</h2>
          <p class="panel-subtitle">Board kerja dengan priority, labels, comments, checklist, dan approval state.</p>
        </div>
      </div>
      <div class="grid gap-5 xl:grid-cols-4">
        <div v-for="status in boardStatuses" :key="status" class="rounded-[24px] bg-slate-50 p-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-slate-900">{{ pretty(status) }}</h3>
            <span class="chip chip-slate">{{ groupedTasks[status].length }}</span>
          </div>
          <div class="mt-4 space-y-4">
            <div v-if="groupedTasks[status].length === 0" class="empty-state">No tasks</div>
            <article v-for="task in groupedTasks[status]" :key="task.id" class="task-card cursor-pointer" @click="openTask(task)">
              <div class="flex items-start justify-between gap-3">
                <h3 class="font-semibold text-slate-900">{{ task.title }}</h3>
                <span class="chip" :class="priorityClass(task.priority)">{{ pretty(task.priority) }}</span>
              </div>
              <p class="mt-2 text-sm text-slate-500">{{ task.description || 'No task description' }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span v-for="entry in task.labels || []" :key="entry.label.id" class="chip chip-slate">
                  {{ entry.label.name }}
                </span>
              </div>
              <div class="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{{ task.assignee?.name || task.assignee?.email || 'Unassigned' }}</span>
                <span>{{ formatDate(task.deadline) }}</span>
              </div>
              <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{{ completedSubtasks(task) }}/{{ task.subtasks?.length || 0 }} checklist</span>
                <span>{{ task.timeEntries?.reduce((sum, entry) => sum + entry.minutes, 0) || task.actualMinutes || 0 }} min</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showTaskModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div class="panel w-full max-w-3xl">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="panel-title">{{ editingTask ? 'Update Task' : 'Create Task' }}</h2>
            <p class="panel-subtitle">Atur prioritas, assignee, reviewer, dan status approval.</p>
          </div>
          <button class="btn-secondary" @click="closeTaskModal">Close</button>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <input v-model="taskForm.title" class="field md:col-span-2" placeholder="Task title" />
          <textarea v-model="taskForm.description" class="field md:col-span-2 min-h-28" placeholder="Task description"></textarea>
          <select v-model="taskForm.status" class="field">
            <option v-for="status in fullStatuses" :key="status" :value="status">{{ pretty(status) }}</option>
          </select>
          <select v-model="taskForm.priority" class="field">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <input v-model="taskForm.deadline" class="field" type="datetime-local" />
          <input v-model.number="taskForm.estimatedMinutes" class="field" type="number" min="0" placeholder="Estimated minutes" />
          <select v-model="taskForm.assigneeId" class="field">
            <option value="">No assignee</option>
            <option v-for="member in project?.members || []" :key="member.id" :value="member.id">
              {{ member.name || member.email }}
            </option>
          </select>
          <select v-model="taskForm.reviewerId" class="field">
            <option value="">No reviewer</option>
            <option v-for="member in project?.members || []" :key="member.id" :value="member.id">
              {{ member.name || member.email }}
            </option>
          </select>
          <textarea v-model="taskForm.blockedReason" class="field md:col-span-2 min-h-24" placeholder="Blocked reason (optional)"></textarea>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button class="btn-secondary" @click="closeTaskModal">Cancel</button>
          <button class="btn-primary" @click="saveTask">Save Task</button>
        </div>
      </div>
    </div>

    <div v-if="selectedTask" class="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-[0_0_40px_rgba(15,23,42,0.18)]">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="chip" :class="priorityClass(selectedTask.priority)">{{ pretty(selectedTask.priority) }}</p>
          <h2 class="mt-3 text-2xl font-semibold text-slate-950">{{ selectedTask.title }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">{{ selectedTask.description || 'No description' }}</p>
        </div>
        <button class="btn-secondary" @click="selectedTask = null">Close</button>
      </div>

      <div class="mt-6 grid gap-3 rounded-[22px] bg-slate-50 p-4 text-sm text-slate-600">
        <div>Status: {{ pretty(selectedTask.status) }}</div>
        <div>Assignee: {{ selectedTask.assignee?.name || selectedTask.assignee?.email || 'Unassigned' }}</div>
        <div>Reviewer: {{ selectedTask.reviewer?.name || selectedTask.reviewer?.email || 'Not set' }}</div>
        <div>Deadline: {{ formatDate(selectedTask.deadline) }}</div>
        <div>Tracked time: {{ trackedMinutes(selectedTask) }} minutes</div>
        <div v-if="selectedTask.blockedReason">Blocked reason: {{ selectedTask.blockedReason }}</div>
      </div>

      <div class="mt-6 flex gap-3">
        <button class="btn-primary" @click="editSelectedTask">Edit</button>
        <button class="btn-secondary text-rose-600" @click="removeTask(selectedTask.id)">Delete</button>
      </div>

      <div class="mt-8">
        <h3 class="text-lg font-semibold text-slate-950">Labels</h3>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="label in labels"
            :key="label.id"
            class="chip"
            :class="hasLabel(selectedTask, label.id) ? 'chip-blue' : 'chip-slate'"
            @click="toggleLabel(label.id)"
          >
            {{ label.name }}
          </button>
        </div>
        <div class="mt-4 flex gap-3">
          <input v-model="labelForm.name" class="field" placeholder="New label" />
          <input v-model="labelForm.color" class="field w-24" type="color" />
          <button class="btn-secondary" @click="createNewLabel">Add Label</button>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="text-lg font-semibold text-slate-950">Checklist</h3>
        <div class="mt-4 space-y-3">
          <label v-for="subtask in subtasks" :key="subtask.id" class="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
            <input type="checkbox" :checked="subtask.completed" @change="toggleChecklist(subtask.id, ($event.target as HTMLInputElement).checked)" />
            <span :class="subtask.completed ? 'line-through text-slate-400' : 'text-slate-700'">{{ subtask.title }}</span>
          </label>
        </div>
        <div class="mt-4 flex gap-3">
          <input v-model="subtaskInput" class="field" placeholder="New checklist item" />
          <button class="btn-secondary" @click="addChecklist">Add</button>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="text-lg font-semibold text-slate-950">Time Tracking</h3>
        <div class="mt-4 flex gap-3">
          <input v-model.number="timeEntry.minutes" class="field" type="number" min="1" placeholder="Minutes" />
          <input v-model="timeEntry.note" class="field" placeholder="Note" />
          <button class="btn-secondary" @click="addTimeEntry">Log Time</button>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="text-lg font-semibold text-slate-950">Comments</h3>
        <div class="mt-4 space-y-4">
          <div v-if="comments.length === 0" class="empty-state">Belum ada komentar.</div>
          <article v-for="comment in comments" :key="comment.id" class="rounded-[20px] border border-slate-200 p-4">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-semibold text-slate-900">{{ comment.author?.name || comment.author?.email }}</p>
              <p class="text-xs text-slate-400">{{ formatDateTime(comment.createdAt) }}</p>
            </div>
            <p class="mt-3 text-sm leading-6 text-slate-600">{{ comment.content }}</p>
          </article>
        </div>
        <textarea v-model="commentInput" class="field mt-4 min-h-24" placeholder="Write a useful update or context for the team"></textarea>
        <button class="btn-primary mt-3" @click="submitComment">Add Comment</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useProjectStore } from '../stores/project';
import type { Comment, Label, Project, ProjectTemplate, RecurringTaskRule, SavedView, Subtask, Task, TaskPriority, TaskStatus } from '../types';

const route = useRoute();
const toast = useToast();
const projectStore = useProjectStore();
const projectId = route.params.id as string;
const project = ref<Project | null>(null);
const tasks = ref<Task[]>([]);
const labels = ref<Label[]>([]);
const savedViews = ref<SavedView[]>([]);
const templates = ref<ProjectTemplate[]>([]);
const recurringRules = ref<RecurringTaskRule[]>([]);
const selectedTask = ref<Task | null>(null);
const comments = ref<Comment[]>([]);
const subtasks = ref<Subtask[]>([]);
const showTaskModal = ref(false);
const editingTask = ref<Task | null>(null);
const search = ref('');
const assigneeFilter = ref('');
const priorityFilter = ref<TaskPriority | ''>('');
const statusFilter = ref<TaskStatus | ''>('');
const selectedLabelId = ref('');
const selectedSavedViewId = ref('');
const selectedTemplateName = ref('');
const commentInput = ref('');
const subtaskInput = ref('');
const labelForm = ref({ name: '', color: '#2563eb' });
const recurringForm = ref({
  title: '',
  frequency: 'WEEKLY' as 'DAILY' | 'WEEKLY' | 'MONTHLY',
  interval: 1,
  nextRunAt: '',
});
const timeEntry = ref({ minutes: 30, note: '' });

const boardStatuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const fullStatuses: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'];

const taskForm = ref({
  title: '',
  description: '',
  status: 'TODO' as TaskStatus,
  priority: 'MEDIUM' as TaskPriority,
  deadline: '',
  assigneeId: '',
  reviewerId: '',
  blockedReason: '',
  estimatedMinutes: 0,
  projectId,
});

const filteredTasks = computed(() => {
  const query = search.value.toLowerCase();
  return tasks.value.filter((task) => {
    const matchQuery = task.title.toLowerCase().includes(query) || (task.description || '').toLowerCase().includes(query);
    const matchAssignee = !assigneeFilter.value || task.assigneeId === assigneeFilter.value;
    const matchPriority = !priorityFilter.value || task.priority === priorityFilter.value;
    const matchStatus = !statusFilter.value || task.status === statusFilter.value;
    const matchLabel =
      !selectedLabelId.value ||
      (task.labels || []).some((entry) => entry.label.id === selectedLabelId.value);
    return matchQuery && matchAssignee && matchPriority && matchStatus && matchLabel;
  });
});

const groupedTasks = computed(() =>
  boardStatuses.reduce<Record<string, Task[]>>((acc, status) => {
    acc[status] = filteredTasks.value.filter((task) => task.status === status);
    return acc;
  }, {}),
);

const priorityClass = (priority: TaskPriority) => ({
  'chip-slate': priority === 'LOW',
  'chip-blue': priority === 'MEDIUM',
  'chip-amber': priority === 'HIGH',
  'chip-rose': priority === 'URGENT',
});

const pretty = (value: string) => value.replace(/\_/g, ' ').toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase());
const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : 'No date');
const formatDateTime = (value: string) => new Date(value).toLocaleString();
const completedSubtasks = (task: Task) => (task.subtasks || []).filter((item) => item.completed).length;
const trackedMinutes = (task: Task) => (task.timeEntries || []).reduce((sum, entry) => sum + entry.minutes, 0) || task.actualMinutes || 0;

const resetForm = () => {
  taskForm.value = {
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    deadline: '',
    assigneeId: '',
    reviewerId: '',
    blockedReason: '',
    estimatedMinutes: 0,
    projectId,
  };
};

const loadBoard = async () => {
  project.value = await projectStore.fetchProject(projectId);
  tasks.value = await projectStore.fetchTasks(projectId);
  labels.value = await projectStore.fetchLabels(projectId);
  savedViews.value = await projectStore.fetchSavedViews(projectId);
  templates.value = await projectStore.fetchTemplates();
  recurringRules.value = await projectStore.fetchRecurringTasks(projectId);
};

const openCreate = () => {
  editingTask.value = null;
  resetForm();
  showTaskModal.value = true;
};

const openTask = async (task: Task) => {
  selectedTask.value = task;
  comments.value = await projectStore.fetchComments(task.id);
  subtasks.value = await projectStore.fetchSubtasks(task.id);
};

const editSelectedTask = () => {
  if (!selectedTask.value) return;
  editingTask.value = selectedTask.value;
  taskForm.value = {
    title: selectedTask.value.title,
    description: selectedTask.value.description || '',
    status: selectedTask.value.status,
    priority: selectedTask.value.priority,
    deadline: selectedTask.value.deadline ? selectedTask.value.deadline.slice(0, 16) : '',
    assigneeId: selectedTask.value.assigneeId || '',
    reviewerId: selectedTask.value.reviewerId || '',
    blockedReason: selectedTask.value.blockedReason || '',
    estimatedMinutes: selectedTask.value.estimatedMinutes || 0,
    projectId,
  };
  showTaskModal.value = true;
};

const closeTaskModal = () => {
  showTaskModal.value = false;
  editingTask.value = null;
};

const saveTask = async () => {
  try {
    const payload = {
      ...taskForm.value,
      deadline: taskForm.value.deadline || undefined,
      assigneeId: taskForm.value.assigneeId || undefined,
      reviewerId: taskForm.value.reviewerId || undefined,
      blockedReason: taskForm.value.blockedReason || undefined,
      estimatedMinutes: taskForm.value.estimatedMinutes || undefined,
    };
    if (editingTask.value) {
      await projectStore.updateTask(editingTask.value.id, payload);
      toast.success('Task updated');
    } else {
      await projectStore.createTask(payload);
      toast.success('Task created');
    }
    tasks.value = [...projectStore.tasks];
    closeTaskModal();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save task');
  }
};

const submitComment = async () => {
  if (!selectedTask.value || !commentInput.value.trim()) return;
  const comment = await projectStore.addComment(selectedTask.value.id, commentInput.value);
  comments.value = [...comments.value, comment];
  commentInput.value = '';
};

const addChecklist = async () => {
  if (!selectedTask.value || !subtaskInput.value.trim()) return;
  const subtask = await projectStore.createSubtask(selectedTask.value.id, subtaskInput.value);
  subtasks.value = [...subtasks.value, subtask];
  subtaskInput.value = '';
  await loadBoard();
};

const toggleChecklist = async (subtaskId: string, completed: boolean) => {
  if (!selectedTask.value) return;
  await projectStore.toggleSubtask(selectedTask.value.id, subtaskId, completed);
  subtasks.value = subtasks.value.map((item) => (item.id === subtaskId ? { ...item, completed } : item));
  await loadBoard();
};

const addTimeEntry = async () => {
  if (!selectedTask.value) return;
  await projectStore.logTime(selectedTask.value.id, timeEntry.value.minutes, timeEntry.value.note);
  toast.success('Time logged');
  timeEntry.value = { minutes: 30, note: '' };
  await loadBoard();
};

const hasLabel = (task: Task, labelId: string) => (task.labels || []).some((entry) => entry.label.id === labelId);

const toggleLabel = async (labelId: string) => {
  if (!selectedTask.value) return;
  if (hasLabel(selectedTask.value, labelId)) {
    await projectStore.detachLabel(selectedTask.value.id, labelId);
  } else {
    await projectStore.attachLabel(selectedTask.value.id, labelId);
  }
  await loadBoard();
  const updated = tasks.value.find((task) => task.id === selectedTask.value?.id);
  if (updated) selectedTask.value = updated;
};

const createNewLabel = async () => {
  if (!labelForm.value.name.trim()) return;
  await projectStore.createLabel(projectId, labelForm.value);
  labels.value = [...projectStore.labels];
  labelForm.value = { name: '', color: '#2563eb' };
};

const saveCurrentView = async () => {
  await projectStore.createSavedView(projectId, `View ${savedViews.value.length + 1}`, {
    search: search.value,
    assigneeId: assigneeFilter.value,
    priority: priorityFilter.value,
    status: statusFilter.value,
    labelId: selectedLabelId.value,
  });
  savedViews.value = [...projectStore.savedViews];
  toast.success('Saved view created');
};

const applySavedView = () => {
  const view = savedViews.value.find((entry) => entry.id === selectedSavedViewId.value);
  if (!view) return;
  search.value = String(view.filters.search || '');
  assigneeFilter.value = String(view.filters.assigneeId || '');
  priorityFilter.value = (view.filters.priority as TaskPriority | '') || '';
  statusFilter.value = (view.filters.status as TaskStatus | '') || '';
  selectedLabelId.value = String(view.filters.labelId || '');
};

const applySelectedTemplate = async () => {
  if (!selectedTemplateName.value) return;
  await projectStore.applyTemplate(projectId, selectedTemplateName.value);
  toast.success('Template applied');
  await loadBoard();
};

const createRecurring = async () => {
  if (!recurringForm.value.title || !recurringForm.value.nextRunAt) return;
  await projectStore.createRecurringTask(projectId, recurringForm.value);
  recurringRules.value = [...projectStore.recurringRules];
  recurringForm.value = { title: '', frequency: 'WEEKLY', interval: 1, nextRunAt: '' };
  toast.success('Recurring task rule created');
};

const runRecurring = async () => {
  await projectStore.runRecurringTasks(projectId);
  toast.success('Recurring tasks processed');
  await loadBoard();
};

const removeTask = async (taskId: string) => {
  if (!confirm('Delete this task?')) return;
  await projectStore.deleteTask(taskId);
  tasks.value = [...projectStore.tasks];
  if (selectedTask.value?.id === taskId) {
    selectedTask.value = null;
    comments.value = [];
    subtasks.value = [];
  }
};

onMounted(async () => {
  await loadBoard();
  if (route.query.assigneeId) {
    assigneeFilter.value = String(route.query.assigneeId);
  }
});
</script>
