<template>
  <aside :class="[
    'h-screen flex flex-col bg-white border-r border-slate-200 shrink-0 font-outfit transition-all duration-300 relative',
    uiStore.isSidebarCollapsed ? 'w-24' : 'w-72'
  ]">
    <!-- Toggle Button -->
    <button 
      @click="uiStore.toggleSidebar"
      class="absolute -right-3 top-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors z-10"
    >
      <ChevronLeftIcon v-if="!uiStore.isSidebarCollapsed" class="w-4 h-4 text-slate-500" />
      <ChevronRightIcon v-else class="w-4 h-4 text-slate-500" />
    </button>

    <!-- Brand -->
    <div class="px-6 py-10 overflow-hidden">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-slate-900 rounded-2xl flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-slate-200">
           <ZapIcon class="w-6 h-6"/>
        </div>
        <div v-if="!uiStore.isSidebarCollapsed" class="whitespace-nowrap transition-opacity duration-300">
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">AI Planner</h1>
          <p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Execution OS</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 space-y-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
      <router-link v-for="item in navItems" :key="item.to" :to="item.to" 
                   class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group relative"
                   :class="isActive(item.to) ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'">
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
        <span v-if="!uiStore.isSidebarCollapsed" class="whitespace-nowrap transition-opacity duration-300">{{ item.label }}</span>
        <span v-if="item.badge" class="ml-auto w-5 h-5 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold flex-shrink-0"
              :class="{ 'absolute -top-1 -right-1': uiStore.isSidebarCollapsed }">
          {{ item.badge }}
        </span>
      </router-link>
    </nav>

    <!-- Footer / User -->
    <div class="p-4 overflow-hidden">
      <div class="bg-slate-50 rounded-[32px] p-4 transition-all duration-300" :class="{ 'p-2': uiStore.isSidebarCollapsed }">
        <div class="flex items-center gap-3 mb-4" :class="{ 'justify-center': uiStore.isSidebarCollapsed }">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold text-slate-900 shadow-sm flex-shrink-0 overflow-hidden border border-slate-100">
            <img v-if="authStore.user?.avatarUrl" :src="getFullUrl(authStore.user.avatarUrl)" alt="Avatar" class="w-full h-full object-cover">
            <template v-else>{{ initials }}</template>
          </div>
          <div v-if="!uiStore.isSidebarCollapsed" class="overflow-hidden whitespace-nowrap transition-opacity duration-300">
            <p class="text-sm font-bold text-slate-900 truncate">{{ authStore.user?.name || 'Member' }}</p>
            <p class="text-xs text-slate-400 truncate">{{ authStore.user?.jobTitle || authStore.user?.email }}</p>
          </div>
        </div>
        
        <router-link to="/profile" 
                    class="w-full flex items-center gap-2 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition mb-1"
                    :class="uiStore.isSidebarCollapsed ? 'justify-center' : 'px-4'">
          <SettingsIcon class="w-4 h-4 flex-shrink-0"/>
          <span v-if="!uiStore.isSidebarCollapsed">Settings</span>
        </router-link>

        <button @click="handleLogout" 
                 class="w-full flex items-center gap-2 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition"
                 :class="uiStore.isSidebarCollapsed ? 'justify-center' : 'px-4'">
          <LogOutIcon class="w-4 h-4 flex-shrink-0"/>
          <span v-if="!uiStore.isSidebarCollapsed">Log Out</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useProjectStore } from '../../stores/project';
import { useUIStore } from '../../stores/ui';
import { 
  ZapIcon,
  LayoutDashboardIcon,
  LayersIcon,
  CalendarIcon,
  UsersIcon,
  BellIcon,
  PieChartIcon,
  LogOutIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon
} from 'lucide-vue-next';

const authStore = useAuthStore();
const projectStore = useProjectStore();
const uiStore = useUIStore();
const router = useRouter();
const route = useRoute();

onMounted(() => {
  projectStore.fetchNotifications();
  projectStore.fetchInvitations();
});

const getFullUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:3000${url}`;
};

const initials = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

const isActive = (path: string) => route.path === path;

const navItems = computed(() => [
  { label: 'My Day', to: '/', icon: LayoutDashboardIcon },
  { label: 'Weekly Planner', to: '/calendar', icon: CalendarIcon },
  { label: 'Projects', to: '/projects', icon: LayersIcon },
  { label: 'Tasks Inbox', to: '/my-tasks', icon: CheckCircleIcon },
  { label: 'Team Workload', to: '/workload', icon: UsersIcon },
  { label: 'Analytics', to: '/reports', icon: PieChartIcon },
  { label: 'Notifications', to: '/notifications', icon: BellIcon, badge: projectStore.unreadNotifications || projectStore.invitations.length || undefined },
]);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.font-outfit {
  font-family: 'Outfit', sans-serif;
}
</style>
