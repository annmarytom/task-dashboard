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
          :disabled="loading"
          @keydown.enter.prevent="onSave"
          @keydown.esc.prevent="onCancel"
        />
      </el-form-item>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px;">
        <el-button type="primary" :loading="loading" @click="onSave">Save</el-button>
        <el-button :disabled="loading" @click="onCancel">Cancel</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Section name" },
  existingTitles: { type: Array, default: () => [] },
  currentSectionId: { type: [String, Number], default: null },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "save", "cancel"]);

const formRef = ref();

const form = ref({
  value: props.modelValue,
});

const rules = {
  value: [
    { required: true, message: "Section name is required", trigger: "blur" },
    {
      min: 2,
      message: "Section name must be at least 2 characters",
      trigger: "blur",
    },
    {
      validator: (_, value, callback) => {
        const current = (value || "").trim().toLowerCase();
        const exists = props.existingTitles.some(
          (title) => (title || "").trim().toLowerCase() === current
        );

        if (exists) {
          callback(new Error("Section name already exists"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
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