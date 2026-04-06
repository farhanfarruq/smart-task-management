<template>
  <div class="min-h-screen bg-app text-slate-900">
    <div v-if="authStore.isAuthenticated" class="flex h-screen overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto relative custom-scrollbar p-6 lg:p-10">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
      <!-- Command Palette -->
      <div
        v-if="commandOpen"
        class="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/40 px-4 pt-24"
        @click.self="commandOpen = false"
      >
        <div class="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
          <input v-model="commandQuery" class="field" placeholder="Jump to dashboard, projects, calendar, reports..." />
          <div class="mt-4 space-y-2">
            <button
              v-for="item in filteredCommands"
              :key="item.to"
              class="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50"
              @click="goTo(item.to)"
            >
              <span class="font-medium text-slate-800">{{ item.label }}</span>
              <span class="text-xs text-slate-400">{{ item.shortcut }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from './components/common/Navbar.vue';
import { useAuthStore } from './stores/auth';
import { useUIStore } from './stores/ui';

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();
const commandOpen = ref(false);
const commandQuery = ref('');
const commands = [
  { label: 'Dashboard', to: '/', shortcut: 'G D' },
  { label: 'Projects', to: '/projects', shortcut: 'G P' },
  { label: 'My Tasks', to: '/my-tasks', shortcut: 'G T' },
  { label: 'Calendar', to: '/calendar', shortcut: 'G C' },
  { label: 'Reports', to: '/reports', shortcut: 'G R' },
  { label: 'Notifications', to: '/notifications', shortcut: 'G N' },
];

const filteredCommands = computed(() => {
  const query = commandQuery.value.toLowerCase();
  return commands.filter((item) => item.label.toLowerCase().includes(query));
});

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    commandOpen.value = !commandOpen.value;
  }
  if (event.key === 'Escape') {
    commandOpen.value = false;
  }
};

const goTo = (path: string) => {
  commandOpen.value = false;
  commandQuery.value = '';
  void router.push(path);
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
