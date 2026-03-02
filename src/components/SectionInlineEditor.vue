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
      <button class="btnPrimary" type="button" @click="onSave">Save</button>
      <button class="btnGhost" type="button" @click="onCancel">Cancel</button>
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
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
}

.inlineInput {
  width: 100%;
  height: 38px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  outline: none;
}

.inlineInput:focus {
  border-color: #f97316;
}

.inlineActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.btnPrimary {
  border: none;
  background: #f97316;
  color: #ffffff;
  font-weight: 900;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
}

.btnGhost {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #0f172a;
  font-weight: 900;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
}
</style>