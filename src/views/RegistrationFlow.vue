<script setup lang="ts">
import { ref } from 'vue';
import StepRules from '../components/StepRules.vue';
import StepBiometric from '../components/StepBiometric.vue';
import StepSocial from '../components/StepSocial.vue';
import StepCaptcha from '../components/StepCaptcha.vue';
import StepForm from '../components/StepForm.vue';
import StepPassport from '../components/StepPassport.vue';

/**
 * 1 RULES -> 2 FACE SCAN -> 3 FOLLOW MEDSOS -> 4 CAPTCHA -> 5 FORMULIR -> 6 E-PASSPORT
 */
const TOTAL_STEPS = 6;
const STEP_LABELS = ['Aturan', 'Face Scan', 'Follow', 'Captcha', 'Formulir', 'Passport'];

// Flow-position persistence (sessionStorage only — cleared when the tab closes).
// Without this, an Android tab/in-app-browser that gets discarded and reloaded
// while the user is away following Facebook/Instagram (see StepSocial) would
// otherwise reboot the whole flow back to step 1.
const FLOW_STORAGE_KEY = 'x5-registration-flow';

const currentStep = ref(1);
const formData = ref({});
const registrationResult = ref({});

const restoreFlow = () => {
  try {
    const raw = sessionStorage.getItem(FLOW_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Number.isInteger(saved?.currentStep) && saved.currentStep >= 1 && saved.currentStep <= TOTAL_STEPS) {
      currentStep.value = saved.currentStep;
    }
    if (saved?.formData && typeof saved.formData === 'object') {
      formData.value = saved.formData;
    }
  } catch {
    /* corrupt state — start fresh */
  }
};
restoreFlow();

const persistFlow = () => {
  try {
    sessionStorage.setItem(
      FLOW_STORAGE_KEY,
      JSON.stringify({ currentStep: currentStep.value, formData: formData.value })
    );
  } catch {
    /* private mode / quota — persistence is a nicety, not a requirement */
  }
};

const nextStep = (data = {}) => {
  formData.value = { ...formData.value, ...data };
  currentStep.value++;
  persistFlow();
};

const handleFinalSubmit = async (finalData: any) => {
  formData.value = { ...formData.value, ...finalData };
  registrationResult.value = formData.value;
  currentStep.value = TOTAL_STEPS;
  try {
    sessionStorage.removeItem(FLOW_STORAGE_KEY);
  } catch {
    /* ignore */
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
    <div class="w-full max-w-3xl">
      <!-- Progress Indicator -->
      <div class="mb-8">
        <div class="flex justify-between relative">
          <div class="absolute top-5 left-0 w-full h-1 bg-gray-800 -z-10"></div>
          <div
            v-for="step in TOTAL_STEPS"
            :key="step"
            class="flex flex-col items-center gap-1.5 flex-1"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 bg-cyber-black"
              :class="currentStep >= step
                ? 'border-neon-blue text-neon-blue shadow-[0_0_10px_rgba(0,255,255,0.5)]'
                : 'border-gray-700 text-gray-600'"
            >
              {{ step }}
            </div>
            <span
              class="text-[9px] sm:text-[10px] tracking-wide text-center"
              :class="currentStep >= step ? 'text-neon-blue' : 'text-gray-600'"
            >
              {{ STEP_LABELS[step - 1] }}
            </span>
          </div>
        </div>
      </div>

      <!-- Steps -->
      <div class="cyber-card min-h-[400px]">
        <StepRules v-if="currentStep === 1" @next="nextStep" />
        <StepBiometric v-if="currentStep === 2" @next="nextStep" />
        <StepSocial v-if="currentStep === 3" @next="nextStep" />
        <StepCaptcha v-if="currentStep === 4" @next="nextStep" />
        <StepForm v-if="currentStep === 5" :biometric-data="formData" @submit="handleFinalSubmit" />
        <StepPassport v-if="currentStep === 6" :data="registrationResult" />
      </div>
    </div>
  </div>
</template>
