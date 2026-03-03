<template>
  <transition name="snack">
    <div v-if="open" class="snackbar" role="status" aria-live="polite">
      <div class="msg">{{ message }}</div>

      <button class="close" type="button" aria-label="Close" @click="close">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { onBeforeUnmount, watch } from "vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  message: { type: String, default: "" },
  duration: { type: Number, default: 3000 },
});

const emit = defineEmits(["close"]);
//to auto close the snackbar
let timer = null;

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function close() {
  clearTimer();
  emit("close");
}

watch(
  () => props.open,
  (v) => {
    clearTimer();
    if (v && props.duration > 0) {
      timer = setTimeout(() => close(), props.duration);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => clearTimer());
</script>

<style scoped>
.snackbar {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  width: min(760px, calc(100vw - 28px));
  border-radius: 14px;
  padding: 12px 20px;
  background: #11aa0b;
  color: #ffffff;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  z-index: 9999;
}

.msg {
  font-weight: 800;
  font-size: 15px;
  color: #e2e8f0;
}

.close {
  width: 25px;
  height: 25px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  cursor: pointer;
  font-weight: 900;
}

.snack-enter-active,
.snack-leave-active {
  transition: all 0.18s ease;
}
.snack-enter-from,
.snack-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
