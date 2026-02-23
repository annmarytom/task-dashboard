<template>
    <div class="inlineEdit" @click.stop>
      <input
        class="inlineInput"
        type="text"
        :placeholder="placeholder"
        v-model.trim="localValue"
        @keydown.enter.prevent="onSave"
        @keydown.esc.prevent="onCancel"
      />
  
      <div class="inlineActions">
        <button class="btnSave" type="button" @click="onSave">Save</button>
        <button class="btnCancel" type="button" @click="onCancel">Cancel</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from "vue";
  
  const props = defineProps({
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: "Section name" },
  });
  
  const emit = defineEmits(["update:modelValue", "save", "cancel"]);
  
  //local copy of value
  const localValue = ref(props.modelValue);
  
  watch(
    () => props.modelValue,
    (v) => (localValue.value = v ?? "")
  );
  
  function onSave() {
    const v = (localValue.value || "").trim();
    if (!v) return;
    emit("update:modelValue", v);
    emit("save", v);
  }
  
  function onCancel() {
    emit("cancel");
  }
  </script>
  
  <style scoped>
  .inlineEdit {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    padding: 15px;
    border: 1px solid gray;
    border-radius: 15px;
    background-color: #263d70;
  }
  
  .inlineInput {
    width: 100%;
    height: 40px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    padding: 10px 12px;
    color: #e5e7eb;
    outline: none;
  }
  
  .inlineActions {
    display: flex;
    gap: 14px;
    align-items: center;
  }
  
  .btnSave {
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: #dc2626; 
    color: white;
    cursor: pointer;
  }
  
  .btnCancel {
    padding: 8px 10px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
  }
  </style>
  