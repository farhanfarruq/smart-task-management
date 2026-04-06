<template>
  <section class="space-y-6">
    <div class="page-header">
      <div>
        <h1 class="page-title">Notifications Center</h1>
        <p class="page-subtitle">Semua invitation, update task, dan alert penting untuk workspace kamu.</p>
      </div>
      <button class="btn-primary" @click="markAllRead">Mark all as read</button>
    </div>

    <div class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div class="panel">
        <h2 class="panel-title">Alerts</h2>
        <div class="mt-5 space-y-3">
          <div v-if="notifications.length === 0" class="empty-state">Belum ada notifikasi.</div>
          <article v-for="notification in notifications" :key="notification.id" class="rounded-[22px] border p-4" :class="notification.isRead ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50'">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="font-semibold text-slate-900">{{ notification.title }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-600">{{ notification.message }}</p>
              </div>
              <button v-if="!notification.isRead" class="btn-secondary" @click="markRead(notification.id)">Read</button>
            </div>
            <p class="mt-3 text-xs text-slate-400">{{ formatDateTime(notification.createdAt) }}</p>
          </article>
        </div>
      </div>

      <div class="panel">
        <h2 class="panel-title">Pending Invitations</h2>
        <div class="mt-5 space-y-3">
          <div v-if="invitations.length === 0" class="empty-state">Tidak ada undangan project baru.</div>
          <article v-for="invite in invitations" :key="invite.id" class="rounded-[22px] border border-amber-200 bg-amber-50 p-4">
            <p class="font-semibold text-amber-900">{{ invite.project?.name || 'Project invitation' }}</p>
            <p class="mt-2 text-sm text-amber-700">Invited as {{ invite.email }}</p>
            <div class="mt-4 flex gap-3">
              <button class="btn-primary" @click="respond(invite.id, true)">Accept</button>
              <button class="btn-secondary" @click="respond(invite.id, false)">Decline</button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useProjectStore } from '../stores/project';
import type { NotificationItem, ProjectInvitation } from '../types';

const projectStore = useProjectStore();
const toast = useToast();
const notifications = ref<NotificationItem[]>([]);
const invitations = ref<ProjectInvitation[]>([]);

const formatDateTime = (value: string) => new Date(value).toLocaleString();

const reload = async () => {
  notifications.value = await projectStore.fetchNotifications();
  invitations.value = await projectStore.fetchInvitations();
};

const markRead = async (id: string) => {
  await projectStore.markNotificationAsRead(id);
  notifications.value = [...projectStore.notifications];
};

const markAllRead = async () => {
  await projectStore.markAllNotificationsAsRead();
  notifications.value = [...projectStore.notifications];
  toast.success('All notifications marked as read');
};

const respond = async (id: string, accept: boolean) => {
  await projectStore.respondToInvitation(id, accept);
  await reload();
  toast.success(accept ? 'Invitation accepted' : 'Invitation declined');
};

onMounted(() => {
  void reload();
});
</script>
