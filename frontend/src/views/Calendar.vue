<template>
  <div class="planner-container h-screen flex flex-col bg-slate-50 overflow-hidden">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-bold text-slate-900">Weekly Planner</h1>
        <div class="flex items-center bg-slate-100 rounded-lg p-1">
          <button @click="prevWeek" class="p-1.5 hover:bg-white rounded-md transition"><ChevronLeftIcon class="w-5 h-5"/></button>
          <span class="px-4 font-medium text-sm">{{ weekLabel }}</span>
          <button @click="nextWeek" class="p-1.5 hover:bg-white rounded-md transition"><ChevronRightIcon class="w-5 h-5"/></button>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <button @click="handleRebalance" :disabled="plannerStore.loading" class="btn-secondary flex items-center gap-2">
          <SparklesIcon class="w-4 h-4 text-blue-600"/>
          {{ plannerStore.loading ? 'Rebalancing...' : 'Auto-Rebalance' }}
        </button>
        <button @click="showAddEvent = true" class="btn-primary">+ Add Event</button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar: Unscheduled Tasks -->
      <aside class="w-80 border-r border-slate-200 bg-white flex flex-col">
        <div class="p-4 border-b border-slate-200">
          <h2 class="font-semibold text-slate-900">Unscheduled Tasks</h2>
          <p class="text-xs text-slate-500 mt-1">Ready for auto-planning</p>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="unscheduledTasks.length === 0" class="text-center py-10">
            <InboxIcon class="w-10 h-10 text-slate-300 mx-auto mb-2"/>
            <p class="text-sm text-slate-400">All caught up!</p>
          </div>
          <div v-for="task in unscheduledTasks" :key="task.id" 
               class="task-item p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition cursor-grab active:cursor-grabbing">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider" :class="getPriorityClass(task.priority)">{{ task.priority }}</span>
              <span class="text-[10px] text-slate-400">{{ task.estimatedMinutes }}m</span>
            </div>
            <h3 class="text-sm font-medium text-slate-800 line-clamp-2">{{ task.title }}</h3>
            <div class="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span>{{ task.project?.name }}</span>
              <button @click="quickSchedule(task.id)" class="text-blue-600 hover:underline">Schedule</button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Grid -->
      <main class="flex-1 overflow-y-auto relative bg-white" ref="gridScrollContainer">
        <div class="grid grid-cols-[60px_repeat(7,1fr)] min-w-[800px]">
          <!-- Time labels -->
          <div class="border-r border-slate-100">
            <div v-for="h in 24" :key="h" class="h-20 border-b border-slate-50 relative">
              <span class="absolute -top-2.5 right-2 text-[10px] font-medium text-slate-400">{{ formatHour(h-1) }}</span>
            </div>
          </div>

          <!-- Days -->
          <div v-for="(day, dIndex) in weekDays" :key="dIndex" class="border-r border-slate-100 relative min-h-full">
            <!-- Day Header (Sticky) -->
            <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 text-center">
              <p class="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{{ day.format('ddd') }}</p>
              <p class="text-lg font-bold" :class="isToday(day) ? 'text-blue-600' : 'text-slate-900'">{{ day.date() }}</p>
            </div>

            <!-- Hour Slots -->
            <div v-for="h in 24" :key="h" class="h-20 border-b border-slate-50 relative pointer-events-none"></div>

            <!-- Items Container -->
            <div class="absolute top-[68px] left-0 right-0 bottom-0 z-0">
               <!-- Events -->
               <div v-for="event in getEventsForDay(day)" :key="event.id"
                    class="absolute left-1 right-1 rounded-lg p-2 bg-slate-800 text-white shadow-sm overflow-hidden text-xs"
                    :style="getItemStyle(event.startAt, event.endAt)">
                 <p class="font-bold truncate">{{ event.title }}</p>
                 <p class="opacity-70 truncate">{{ formatTime(event.startAt) }} - {{ formatTime(event.endAt) }}</p>
               </div>

               <!-- Task Blocks -->
               <div v-for="block in getBlocksForDay(day)" :key="block.id"
                    class="absolute left-1 right-1 rounded-lg p-2 border-l-4 shadow-sm overflow-hidden text-xs cursor-pointer group"
                    :class="getBlockClass(block)"
                    :style="getItemStyle(block.startAt, block.endAt)">
                 <div class="flex justify-between items-start gap-1">
                   <p class="font-bold text-slate-900 truncate">{{ block.task?.title || 'Loading task...' }}</p>
                   <LockIcon v-if="block.isLocked" class="w-3 h-3 text-slate-400"/>
                 </div>
                 <p class="text-slate-500 truncate">{{ block.task?.project?.name }}</p>
                 
                 <!-- Hover actions -->
                 <div class="absolute bottom-1 right-1 hidden group-hover:flex gap-1">
                    <button class="p-1 bg-white border border-slate-200 rounded hover:bg-slate-50"><MoreVerticalIcon class="w-3 h-3 text-slate-600"/></button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { usePlannerStore } from '../stores/planner';
import { useProjectStore } from '../stores/project';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SparklesIcon, 
  InboxIcon,
  ChevronDownIcon,
  PlusIcon,
  LockIcon,
  MoreVerticalIcon
} from 'lucide-vue-next';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const plannerStore = usePlannerStore();
const projectStore = useProjectStore();
const currentWeekStart = ref(dayjs().startOf('isoWeek'));
const showAddEvent = ref(false);

const weekDays = computed(() => {
  return Array.from({ length: 7 }, (_, i) => currentWeekStart.value.add(i, 'day'));
});

const weekLabel = computed(() => {
  const start = currentWeekStart.value;
  const end = currentWeekStart.value.endOf('isoWeek');
  if (start.month() === end.month()) {
    return `${start.format('D')} - ${end.format('D')} ${start.format('MMMM YYYY')}`;
  }
  return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`;
});

const unscheduledTasks = ref<any[]>([]);

const prevWeek = () => { currentWeekStart.value = currentWeekStart.value.subtract(1, 'week'); loadSchedule(); };
const nextWeek = () => { currentWeekStart.value = currentWeekStart.value.add(1, 'week'); loadSchedule(); };

const loadSchedule = async () => {
  const start = currentWeekStart.value.startOf('day').toISOString();
  const end = currentWeekStart.value.add(6, 'day').endOf('day').toISOString();
  await plannerStore.fetchSchedule(start, end);
};

const loadUnscheduled = async () => {
  const response = await projectStore.fetchMyTasks();
  // Filter for tasks that are auto-scheduled but have no block or just any assigned tasks for simplicity now
  unscheduledTasks.value = response.assigned.filter(t => !t.scheduledBlocks || t.scheduledBlocks.length === 0);
};

const getEventsForDay = (day: any) => {
  return plannerStore.events.filter(e => dayjs(e.startAt).isSame(day, 'day'));
};

const getBlocksForDay = (day: any) => {
  return plannerStore.blocks.filter(b => dayjs(b.startAt).isSame(day, 'day'));
};

const isToday = (day: any) => day.isSame(dayjs(), 'day');

const formatHour = (h: number) => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
const formatTime = (iso: string) => dayjs(iso).format('HH:mm');

const getItemStyle = (start: string, end: string) => {
  const s = dayjs(start);
  const e = dayjs(end);
  const top = (s.hour() * 80) + (s.minute() / 60) * 80;
  const height = (e.diff(s, 'minute') / 60) * 80;
  return {
    top: `${top}px`,
    height: `${height}px`
  };
};

const getBlockClass = (block: any) => {
  const priority = block.task?.priority;
  if (priority === 'URGENT') return 'bg-rose-50 border-rose-500';
  if (priority === 'HIGH') return 'bg-amber-50 border-amber-500';
  return 'bg-blue-50 border-blue-500';
};

const getPriorityClass = (p: string) => {
  if (p === 'URGENT') return 'text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded';
  if (p === 'HIGH') return 'text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded';
  return 'text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded';
};

const handleRebalance = async () => {
  await plannerStore.rebalance();
  await loadSchedule();
  await loadUnscheduled();
};

const quickSchedule = async (taskId: string) => {
  // Logic to call rebalance for just one task if needed, or just let rebalance handle it
  await handleRebalance();
};

onMounted(async () => {
  await loadSchedule();
  await loadUnscheduled();
});
</script>

<style scoped>
.planner-container {
  font-family: 'Outfit', sans-serif;
}

.task-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary {
  @apply bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition active:scale-95 disabled:opacity-50;
}

.btn-secondary {
  @apply bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition active:scale-95 disabled:opacity-50;
}

/* Custom scrollbar for a cleaner look */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-slate-200 rounded-full;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-300;
}
</style>
