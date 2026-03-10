<template>
  <el-card shadow="never" @click.stop>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      @submit.prevent
    >
      <el-form-item prop="value">
        <el-input
          v-model.trim="form.value"
          :placeholder="placeholder"
          @keydown.enter.prevent="onSave"
          @keydown.esc.prevent="onCancel"
        />
      </el-form-item>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px;">
        <el-button type="primary" @click="onSave">Save</el-button>
        <el-button @click="onCancel">Cancel</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Section name" },
});

const emit = defineEmits(["update:modelValue", "save", "cancel"]);

const formRef = ref();

const form = ref({
  value: props.modelValue,
});

const rules = {
  value: [
    { required: true, message: "Section name is required", trigger: "blur" },
    { min: 2, message: "Section name must be at least 2 characters", trigger: "blur" },
  ],
};

watch(
  () => props.modelValue,
  (v) => {
    form.value.value = v ?? "";
  }
);

function onSave() {
  formRef.value.validate((valid) => {
    if (!valid) return;

    const v = (form.value.value || "").trim();
    emit("update:modelValue", v);
    emit("save", v);
  });
}

function onCancel() {
  emit("cancel");
}
</script>