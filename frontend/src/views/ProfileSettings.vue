<template>
  <div class="max-w-4xl mx-auto p-8 font-outfit">
    <header class="mb-10 text-center md:text-left">
      <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
      <p class="text-slate-500 mt-2">Manage your professional identity and workspace preferences.</p>
    </header>

    <div class="grid gap-10 md:grid-cols-[1fr_2.2fr]">
      <!-- Avatar Section -->
      <aside class="space-y-6">
        <div class="panel p-8 flex flex-col items-center text-center">
          <div class="relative group cursor-pointer" @click="triggerFileInput">
            <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
              <img v-if="authStore.user?.avatarUrl" :src="getFullUrl(authStore.user.avatarUrl)" alt="Profile" class="w-full h-full object-cover">
              <span v-else class="text-4xl font-bold text-slate-300">{{ authStore.user?.name?.[0] || '?' }}</span>
              
              <!-- Upload Overlay -->
              <div class="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <CameraIcon class="w-8 h-8 text-white"/>
              </div>
            </div>
            
            <!-- Loading Indicator -->
            <div v-if="uploading" class="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
               <Loader2Icon class="w-8 h-8 text-blue-600 animate-spin"/>
            </div>
          </div>

          <h3 class="mt-6 font-bold text-slate-900 text-lg">{{ authStore.user?.name }}</h3>
          <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{{ authStore.user?.role }}</p>
          
          <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
          
          <button @click="triggerFileInput" class="mt-8 text-xs font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-2">
            <UploadIcon class="w-3.5 h-3.5"/>
            Change Photo
          </button>
        </div>
        
        <div class="panel p-6 bg-slate-50 border-none">
           <h4 class="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-4">Workspace Info</h4>
           <div class="space-y-4">
              <div class="flex justify-between items-center text-xs">
                 <span class="text-slate-500 font-medium">Verified Account</span>
                 <CheckCircleIcon class="w-4 h-4 text-emerald-500"/>
              </div>
              <div class="flex justify-between items-center text-xs">
                 <span class="text-slate-500 font-medium">Member Since</span>
                 <span class="font-bold text-slate-900">{{ formatDate(authStore.user?.createdAt) }}</span>
              </div>
           </div>
        </div>
      </aside>

      <!-- Form Section -->
      <main class="space-y-6">
        <div class="panel p-8 md:p-10">
           <div class="flex items-center gap-3 mb-8">
              <div class="w-2 h-8 bg-blue-600 rounded-full"></div>
              <h2 class="text-xl font-bold text-slate-900">Personal Identity</h2>
           </div>

           <div class="grid gap-8">
              <div class="grid md:grid-cols-2 gap-6">
                 <div class="space-y-2.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input v-model="form.name" class="field" placeholder="Full name" />
                 </div>
                 <div class="space-y-2.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input :value="authStore.user?.email" class="field bg-slate-50 text-slate-400 cursor-not-allowed border-dashed" readonly />
                 </div>
              </div>

              <div class="grid md:grid-cols-2 gap-6">
                 <div class="space-y-2.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Title</label>
                    <input v-model="form.jobTitle" class="field" placeholder="e.g. Lead Developer" />
                 </div>
                 <div class="space-y-2.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <input v-model="form.department" class="field" placeholder="e.g. Technology" />
                 </div>
              </div>

              <div class="space-y-2.5">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                 <textarea v-model="form.bio" class="field min-h-[140px] resize-none leading-relaxed" placeholder="Tell the team about your role and expertise..."></textarea>
              </div>
           </div>

           <div class="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-end gap-4">
              <button @click="resetForm" class="btn-secondary">Discard Changes</button>
              <button @click="handleSave" :disabled="loading || uploading" class="btn-primary flex items-center justify-center gap-3">
                <Loader2Icon v-if="loading" class="w-4 h-4 animate-spin"/>
                <span v-if="!loading">Update Profile</span>
                <span v-else>Saving...</span>
              </button>
           </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'vue-toastification';
import { 
  CameraIcon, 
  Loader2Icon, 
  UploadIcon, 
  CheckCircleIcon 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const toast = useToast();
const loading = ref(false);
const uploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const form = ref({
  name: '',
  jobTitle: '',
  department: '',
  bio: '',
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const getFullUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:3000${url}`;
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

const resetForm = () => {
  if (!authStore.user) return;
  form.value = {
    name: authStore.user.name || '',
    jobTitle: authStore.user.jobTitle || '',
    department: authStore.user.department || '',
    bio: authStore.user.bio || '',
  };
};

onMounted(resetForm);

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploading.value = true;
  try {
    await authStore.uploadAvatar(file);
    toast.success('Photo uploaded successfully!');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to upload photo');
  } finally {
    uploading.value = false;
    // Reset input
    target.value = '';
  }
};

const handleSave = async () => {
  loading.value = true;
  try {
    await authStore.updateProfile(form.value);
    toast.success('Settings updated');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to update profile');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.panel {
  @apply bg-white border border-slate-200 rounded-[40px] shadow-sm;
}
.field {
  @apply w-full px-5 py-4 rounded-[22px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 text-sm placeholder:text-slate-300;
}
.btn-primary {
  @apply bg-slate-900 text-white px-10 py-4 rounded-[22px] font-bold hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 min-w-[180px] shadow-lg shadow-slate-200;
}
.btn-secondary {
  @apply bg-white text-slate-500 border border-slate-200 px-10 py-4 rounded-[22px] font-bold hover:bg-slate-50 hover:text-slate-900 transition active:scale-[0.98];
}
</style>
