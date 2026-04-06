import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '../services/api';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  isBusy: boolean;
  location?: string;
}

export interface ScheduledTaskBlock {
  id: string;
  taskId: string;
  userId: string;
  startAt: string;
  endAt: string;
  source: 'AUTO' | 'MANUAL';
  isLocked: boolean;
  task?: any;
}

export interface PlannerProfile {
  workHours?: any;
  focusWindows?: any;
  maxMeetingsPerDay?: number;
  chunkingPreference: number;
}

export const usePlannerStore = defineStore('planner', () => {
  const blocks = ref<ScheduledTaskBlock[]>([]);
  const events = ref<CalendarEvent[]>([]);
  const profile = ref<PlannerProfile | null>(null);
  const loading = ref(false);

  async function fetchSchedule(start: string, end: string) {
    loading.value = true;
    try {
      const response = await apiClient.get('/planner/schedule', {
        params: { start, end },
      });
      blocks.value = response.data.blocks;
      events.value = response.data.events;
    } finally {
      loading.value = false;
    }
  }

  async function rebalance() {
    loading.value = true;
    try {
      await apiClient.post('/planner/rebalance');
      // Refresh will be needed after rebalance
    } finally {
      loading.value = false;
    }
  }

  async function createEvent(data: Partial<CalendarEvent>) {
    const response = await apiClient.post('/planner/events', data);
    events.value.push(response.data);
    return response.data;
  }

  async function fetchProfile() {
    const response = await apiClient.get('/planner/profile');
    profile.value = response.data;
    return response.data;
  }

  async function updateProfile(data: Partial<PlannerProfile>) {
    const response = await apiClient.post('/planner/profile', data);
    profile.value = response.data;
    return response.data;
  }

  return {
    blocks,
    events,
    profile,
    loading,
    fetchSchedule,
    rebalance,
    createEvent,
    fetchProfile,
    updateProfile,
  };
});
