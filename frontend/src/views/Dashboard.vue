<template>
  <div class="flex flex-col font-outfit min-h-full">
    <header class="flex items-center justify-between py-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Good morning, {{ authStore.user?.name || 'User' }}</h1>
        <p class="text-slate-500">Here's your smart agenda for today.</p>
      </div>
      <div class="flex items-center gap-4">
         <button @click="handlePlanMyDay" :disabled="plannerStore.loading" class="btn-primary flex items-center gap-2 group">
           <SparklesIcon class="w-4 h-4 group-hover:rotate-12 transition-transform"/>
           {{ plannerStore.loading ? 'Planning...' : 'Plan My Day' }}
         </button>
      </div>
    </header>

    <section class="flex-1 mt-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column: Tasks & Urgency -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Next Best Task -->
          <section v-if="nextTask" class="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <div class="relative z-10">
              <span class="text-[10px] uppercase font-bold tracking-widest opacity-80">Up Next</span>
              <h2 class="text-3xl font-bold mt-2">{{ nextTask.title }}</h2>
              <div class="flex items-center gap-6 mt-6">
                <div class="flex items-center gap-2">
                  <ClockIcon class="w-5 h-5 opacity-70"/>
                  <span class="font-medium text-lg">{{ nextTaskTime }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <TagIcon class="w-5 h-5 opacity-70"/>
                  <span class="font-medium text-lg">{{ (nextTask as any).task?.project?.name || (nextTask as any).project?.name }}</span>
                </div>
              </div>
              <button @click="startTask(nextTask.id)" class="mt-8 px-8 py-3 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition active:scale-95">
                Start Session
              </button>
            </div>
            <!-- Decorative circle -->
            <div class="absolute -right-20 -top-20 w-80 h-80 bg-blue-500 rounded-full opacity-20"></div>
          </section>

          <!-- Urgent Items & Focus Block -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="panel p-6">
              <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircleIcon class="w-5 h-5 text-rose-500"/>
                Attention Needed
              </h3>
              <div class="space-y-4">
                <div v-if="urgentTasks.length === 0" class="text-slate-400 text-sm py-4">No urgent alerts. Looking good!</div>
                <div v-for="task in urgentTasks.slice(0, 3)" :key="task.id" class="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between">
                  <div>
                     <p class="text-sm font-bold text-rose-900 line-clamp-1">{{ task.title }}</p>
                     <p class="text-[10px] text-rose-600">{{ task.project?.name }}</p>
                  </div>
                  <ChevronRightIcon class="w-4 h-4 text-rose-300"/>
                </div>
              </div>
            </div>

            <div class="panel p-6">
              <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TargetIcon class="w-5 h-5 text-emerald-500"/>
                Daily Goal
              </h3>
              <div class="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                 <p class="text-sm text-emerald-900 font-medium italic">"Complete all scheduled blocks for today to maintain a 100% reliability score."</p>
                 <div class="mt-4 flex items-center gap-4">
                    <div class="flex-1 h-2 bg-emerald-200 rounded-full">
                       <div class="h-2 bg-emerald-600 rounded-full" :style="{ width: '65%' }"></div>
                    </div>
                    <span class="text-xs font-bold text-emerald-700">65%</span>
                 </div>
              </div>
            </div>
          </div>

          <!-- Schedule Timeline (Summary) -->
          <section class="panel p-6">
            <h3 class="font-bold text-slate-900 mb-6 flex items-center justify-between">
              Timeline Summary
              <router-link to="/calendar" class="text-xs text-blue-600 hover:underline">View full calendar</router-link>
            </h3>
            <div class="space-y-4">
               <div v-for="item in todayTimeline" :key="item.id" class="flex gap-4 items-start relative pb-4 last:pb-0">
                  <div class="w-12 text-xs font-medium text-slate-400 pt-1 shrink-0">{{ formatTime(item.startAt) }}</div>
                  <div class="w-px bg-slate-200 absolute left-[3.75rem] top-6 bottom-0" v-if="!item._last"></div>
                  <div class="w-3 h-3 rounded-full mt-2 shrink-0 border-2 bg-white" :class="item.type === 'meeting' ? 'border-slate-900' : 'border-blue-500'"></div>
                  <div class="flex-1 p-3 rounded-2xl border border-slate-100" :class="item.type === 'meeting' ? 'bg-white shadow-sm' : 'bg-blue-50 border-blue-100'">
                    <p class="text-sm font-bold" :class="item.type === 'meeting' ? 'text-slate-900' : 'text-blue-900'">{{ item.title }}</p>
                    <p class="text-xs opacity-60">{{ item.duration }}m</p>
                  </div>
               </div>
               <div v-if="todayTimeline.length === 0" class="text-center py-8 text-slate-400 italic">No items scheduled for today.</div>
            </div>
          </section>
        </div>

        <!-- Right Column: Stats & Recent -->
        <div class="space-y-8">
           <div class="panel p-6">
              <h3 class="font-bold text-slate-900 mb-4">Daily Performance</h3>
              <div class="grid grid-cols-2 gap-4">
                 <div class="text-center p-4 bg-slate-50 rounded-2xl">
                    <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reliability</p>
                    <p class="text-2xl font-bold text-slate-900">92%</p>
                 </div>
                 <div class="text-center p-4 bg-slate-50 rounded-2xl">
                    <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Focus Time</p>
                    <p class="text-2xl font-bold text-slate-900">4.2h</p>
                 </div>
              </div>
           </div>

           <div class="panel p-6">
             <h3 class="font-bold text-slate-900 mb-4">Feed</h3>
             <div class="space-y-4">
               <div v-for="activity in activities.slice(0, 5)" :key="activity.id" class="flex gap-3 items-start">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">
                    {{ activity.user?.name?.[0] || 'U' }}
                  </div>
                  <div>
                    <p class="text-xs text-slate-900"><span class="font-bold">{{ activity.user?.name }}</span> {{ activity.action.toLowerCase().replace('_', ' ') }}</p>
                    <p class="text-[10px] text-slate-400 mt-0.5">{{ formatRelative(activity.createdAt) }}</p>
                  </div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { usePlannerStore } from '../stores/planner';
import { useProjectStore } from '../stores/project';
import apiClient from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { 
  SparklesIcon, 
  ClockIcon, 
  TagIcon, 
  AlertCircleIcon, 
  ChevronRightIcon, 
  TargetIcon
} from 'lucide-vue-next';

dayjs.extend(relativeTime);

const authStore = useAuthStore();
const plannerStore = usePlannerStore();
const projectStore = useProjectStore();
const activities = ref<any[]>([]);

const todayTimeline = computed(() => {
   const now = dayjs();
   const combined = [
     ...plannerStore.events.map(e => ({ ...e, type: 'meeting', start: dayjs(e.startAt) })),
     ...plannerStore.blocks.map(b => ({ ...b, type: 'block', title: b.task?.title, start: dayjs(b.startAt) }))
   ]
   .filter(i => i.start.isSame(now, 'day'))
   .sort((a, b) => a.start.unix() - b.start.unix());

   return combined.map((item, idx) => ({
      ...item,
      duration: dayjs(item.endAt).diff(dayjs(item.startAt), 'minute'),
      _last: idx === combined.length - 1
   }));
});

const nextTask = computed(() => {
   const now = dayjs();
   return todayTimeline.value.find(i => i.type === 'block' && i.start.isAfter(now)) || null;
});

const nextTaskTime = computed(() => {
   if (!nextTask.value) return '';
   return dayjs(nextTask.value.startAt).format('HH:mm');
});

const urgentTasks = ref<any[]>([]);

const formatTime = (iso: string) => dayjs(iso).format('HH:mm');
const formatRelative = (iso: string) => dayjs(iso).fromNow();

const handlePlanMyDay = async () => {
   await plannerStore.rebalance();
   await loadData();
};

const startTask = (taskId: string) => {
   // Logic for a focus timer session could go here
   console.log('Starting task session:', taskId);
};

const loadData = async () => {
  const start = dayjs().startOf('day').toISOString();
  const end = dayjs().endOf('day').toISOString();
  await Promise.all([
    plannerStore.fetchSchedule(start, end),
    plannerStore.fetchProfile()
  ]);
  
  try {
    const res = await apiClient.get('/activity-logs/me');
    activities.value = res.data;
    
    const taskRes = await projectStore.fetchMyTasks();
    urgentTasks.value = taskRes.overdue;
  } catch (err) {
    console.error('Failed to fetch dashboard data', err);
  }
};

onMounted(loadData);
</script>

<style scoped>
.panel {
  @apply bg-white border border-slate-200 rounded-[32px] shadow-sm;
}
.btn-primary {
  @apply bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-slate-800 transition active:scale-95 disabled:opacity-50;
}
</style>
