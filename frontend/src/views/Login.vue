<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-6 text-center">Smart Task Management</h1>
      
      <div v-if="!stepTwo" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <button @click="sendOtp" :disabled="loading" class="btn-primary w-full">
          {{ loading ? 'Sending...' : 'Send OTP' }}
        </button>
      </div>

      <div v-else class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">OTP Code</label>
          <input
            v-model="otp"
            type="text"
            maxlength="6"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="6-digit code"
          />
        </div>
        <button @click="verifyOtp" :disabled="loading" class="btn-primary w-full">
          {{ loading ? 'Verifying...' : 'Verify & Login' }}
        </button>
        <button @click="stepTwo = false" class="btn-secondary w-full">Back</button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const email = ref('');
const otp = ref('');
const stepTwo = ref(false);
const loading = ref(false);

const sendOtp = async () => {
  if (!email.value) {
    toast.error('Email is required');
    return;
  }
  loading.value = true;
  try {
    await authStore.requestOtp(email.value);
    toast.success('OTP sent successfully!');
    stepTwo.value = true;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Failed to send OTP';
    toast.error(typeof errorMsg === 'string' ? errorMsg : errorMsg[0]);
  } finally {
    loading.value = false;
  }
};

const verifyOtp = async () => {
  if (!otp.value || otp.value.length !== 6) {
    toast.error('Please enter a 6-digit OTP');
    return;
  }
  loading.value = true;
  try {
    await authStore.verifyOtp(email.value, otp.value);
    toast.success('Logged in successfully!');
    router.push('/');
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Invalid OTP';
    toast.error(typeof errorMsg === 'string' ? errorMsg : errorMsg[0]);
  } finally {
    loading.value = false;
  }
};
</script>