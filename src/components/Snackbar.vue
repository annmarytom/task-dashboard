<template>
  <transition name="fade">
    <div
      v-if="open"
      style="position:fixed; left:50%; bottom:18px; transform:translateX(-50%); width:min(760px,calc(100vw - 28px)); z-index:9999;"
    >
      <el-alert
        :title="message"
        type="success"
        show-icon
        closable
        @close="close"
      />
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
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>