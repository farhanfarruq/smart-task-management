import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const isSidebarCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true');

  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed.value));
  };

  const setSidebarCollapsed = (value: boolean) => {
    isSidebarCollapsed.value = value;
    localStorage.setItem('sidebarCollapsed', String(value));
  };

  return {
    isSidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
  };
});
