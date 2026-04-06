<template>
  <div class="h-screen flex flex-col bg-slate-50 overflow-hidden font-outfit">
    <header class="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Team Workload</h1>
        <p class="text-slate-500 text-sm">Monitor member capacity and identify project risks.</p>
      </div>
      <div class="flex items-center gap-4">
        <select v-model="selectedProjectId" @change="loadWorkload" class="field min-w-[200px]">
          <option value="">Select Project</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-8">
      <div v-if="!selectedProjectId" class="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-slate-300">
         <UsersIcon class="w-16 h-16 text-slate-200 mb-4"/>
         <p class="text-slate-500">Pick a project to see member distribution.</p>
      </div>

      <div v-else class="max-w-7xl mx-auto space-y-8">
        <!-- Dashboard Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div class="panel p-6">
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Members</p>
              <p class="text-3xl font-bold text-slate-900 mt-1">{{ workloadData.length }}</p>
           </div>
           <div class="panel p-6">
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">At Risk</p>
              <p class="text-3xl font-bold text-rose-600 mt-1">{{ atRiskCount }}</p>
           </div>
           <div class="panel p-6">
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg. Load</p>
              <p class="text-3xl font-bold text-blue-600 mt-1">{{ avgLoad }}%</p>
           </div>
           <div class="panel p-6">
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overdue</p>
              <p class="text-3xl font-bold text-amber-600 mt-1">{{ totalOverdue }}</p>
           </div>
        </div>

        <!-- Member List -->
        <div class="space-y-4">
           <div v-for="member in workloadData" :key="member.id" class="panel p-6 hover:border-blue-200 transition group">
              <div class="flex flex-wrap items-center gap-6">
                <!-- User Profile -->
                <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">
                  {{ member.name[0] }}
                </div>
                <div class="w-48 shrink-0">
                   <h3 class="font-bold text-slate-900 line-clamp-1">{{ member.name }}</h3>
                   <p class="text-xs text-slate-500 truncate">{{ member.email }}</p>
                </div>

                <!-- Load Bar -->
                <div class="flex-1 min-w-[200px]">
                   <div class="flex items-center justify-between mb-1.5">
                      <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Workload Capacity</span>
                      <span class="text-xs font-bold" :class="getLoadColor(member.totalTasks)">{{ member.totalTasks * 10 }}%</span>
                   </div>
                   <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-1000" 
                           :class="getLoadBg(member.totalTasks)" 
                           :style="{ width: `${Math.min(member.totalTasks * 10, 100)}%` }"></div>
                   </div>
                </div>

                <!-- Stats -->
                <div class="flex gap-8 px-4 border-l border-slate-100 items-center">
                   <div class="text-center">
                      <p class="text-[10px] uppercase font-bold text-slate-400">Tasks</p>
                      <p class="font-bold">{{ member.totalTasks }}</p>
                   </div>
                   <div class="text-center">
                      <p class="text-[10px] uppercase font-bold text-slate-400">Overdue</p>
                      <p class="font-bold" :class="member.overdue > 0 ? 'text-rose-600' : 'text-slate-400'">{{ member.overdue }}</p>
                   </div>
                </div>

                <div class="shrink-0 ml-auto flex gap-2">
                   <span v-if="member.totalTasks > 8" class="chip chip-rose text-[10px] px-2 py-0.5 font-bold">OVERLOADED</span>
                   <span v-else-if="member.urgent > 0" class="chip chip-amber text-[10px] px-2 py-0.5 font-bold">URGENT BLOCKS</span>
                   <span v-else class="chip chip-emerald text-[10px] px-2 py-0.5 font-bold">STABLE</span>
                </div>
              </div>
              
              <!-- Task Preview (Hidden by default, show on hover maybe or expanded) -->
              <div class="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div class="text-xs text-slate-500"><span class="font-bold text-slate-900 block">{{ member.inProgress }}</span> In Progress</div>
                 <div class="text-xs text-slate-500"><span class="font-bold text-slate-900 block">{{ member.review }}</span> In Review</div>
                 <div class="text-xs text-slate-500"><span class="font-bold text-slate-900 block">{{ member.urgent }}</span> Urgent Tasks</div>
                 <div @click="viewTasks(member.id)" class="text-xs text-blue-600 font-bold flex items-center gap-1 cursor-pointer hover:underline self-end">View Tasks <ArrowRightIcon class="w-3 h-3"/></div>
              </div>
           </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../stores/project';
import { 
  UsersIcon, 
  ArrowRightIcon 
} from 'lucide-vue-next';

const projectStore = useProjectStore();
const router = useRouter();
const projects = ref<any[]>([]);
const selectedProjectId = ref('');
const workloadData = ref<any[]>([]);

const viewTasks = (memberId: string) => {
  if (!selectedProjectId.value) return;
  void router.push({
    path: `/projects/${selectedProjectId.value}/tasks`,
    query: { assigneeId: memberId }
  });
};

const atRiskCount = computed(() => workloadData.value.filter(m => m.overdue > 0 || m.totalTasks > 8).length);
const totalOverdue = computed(() => workloadData.value.reduce((sum, m) => sum + m.overdue, 0));
const avgLoad = computed(() => {
  if (workloadData.value.length === 0) return 0;
  const total = workloadData.value.reduce((sum, m) => sum + (m.totalTasks * 10), 0);
  return Math.round(total / workloadData.value.length);
});

const getLoadColor = (tasks: number) => {
  if (tasks > 8) return 'text-rose-600';
  if (tasks > 5) return 'text-amber-600';
  return 'text-emerald-600';
};

const getLoadBg = (tasks: number) => {
  if (tasks > 8) return 'bg-rose-500';
  if (tasks > 5) return 'bg-amber-500';
  return 'bg-emerald-500';
};

const loadWorkload = async () => {
  if (!selectedProjectId.value) return;
  workloadData.value = await projectStore.fetchWorkload(selectedProjectId.value);
};

onMounted(async () => {
  const res = await projectStore.fetchProjects();
  projects.value = res;
});
</script>

<style scoped>
.panel {
  @apply bg-white border border-slate-200 rounded-[32px] shadow-sm;
}
.btn-primary {
  @apply bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-slate-800 transition active:scale-95 disabled:opacity-50;
}
.chip {
  @apply rounded-full flex items-center justify-center;
}
.chip-rose { @apply bg-rose-100 text-rose-700; }
.chip-amber { @apply bg-amber-100 text-amber-700; }
.chip-emerald { @apply bg-emerald-100 text-emerald-700; }
</style>
