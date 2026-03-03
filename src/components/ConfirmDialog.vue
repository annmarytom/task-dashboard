<template>
    <transition name="fade">
      <div v-if="open" class="overlay" @click.self="emit('cancel')">
        <div class="dialog" role="dialog" aria-modal="true">
          <div class="msg">
            <div class="title">{{ title }}</div>
            <div class="sub">{{ message }}</div>
          </div>
  
          <div class="actions">
            <button class="ok" type="button" @click="emit('confirm')">OK</button>
            <button class="cancel" type="button" @click="emit('cancel')">Cancel</button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, default: "Confirm" },
    message: { type: String, default: "" },
  });
  
  const emit = defineEmits(["confirm", "cancel"]);
  </script>
  
  <style scoped>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.35);
    display: grid;
    place-items: center;
    z-index: 9999;
    padding: 18px;
  }
  
  .dialog {
    width: min(560px, calc(100vw - 28px));
    background: #3b3789;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 18px;
    padding: 18px;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
    color: #e5e7eb;
  }
  
  .title {
    font-weight: 900;
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  .sub {
    font-size: 14px;
    color: #cbd5e1;
    line-height: 1.5;
  }
  
  .actions {
    display: flex;
    justify-content: center;
    gap: 14px;
    margin-top: 18px;
  }
  
  .ok {
    border: none;
    background: #f8a4d5;
    color: #0f172a;
    font-weight: 900;
    padding: 10px 22px;
    border-radius: 999px;
    cursor: pointer;
  }
  
  .cancel {
    border: 2px solid #f8a4d5;
    background: transparent;
    color: #f8a4d5;
    font-weight: 900;
    padding: 10px 22px;
    border-radius: 999px;
    cursor: pointer;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.18s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(6px);
  }
  </style>