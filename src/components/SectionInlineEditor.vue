<template>
  <el-card shadow="never" @click.stop>
    <el-input
      v-model.trim="localValue"
      :placeholder="placeholder"
      @keydown.enter.prevent="onSave"
      @keydown.esc.prevent="onCancel"
    />

    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px;">
      <el-button type="primary" @click="onSave">Save</el-button>
      <el-button @click="onCancel">Cancel</el-button>
    </div>
  </el-card>
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