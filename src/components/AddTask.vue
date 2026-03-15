<template>
  <el-card shadow="never">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
      <h3 style="margin: 0;">
        {{ isEdit ? "Edit Task" : "Add New Task" }}
      </h3>

      <el-button text @click="cancel">
        <el-icon>
          <Close />
        </el-icon>
      </el-button>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent="submit"
    >
      <el-form-item label="Task Name" prop="name">
        <el-input v-model.trim="form.name" placeholder="Enter Your Task" />
      </el-form-item>

      <el-form-item label="Description">
        <el-input
          v-model.trim="form.description"
          type="textarea"
          placeholder="Description"
          :rows="4"
        />
      </el-form-item>

      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="Status">
           <el-select v-model="form.status" placeholder="Select or create section" filterable allow-create
              default-first-option style="width: 100%;">
              <el-option
                v-for="opt in statusOptions"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Due Date" prop="dueDate">
            <el-date-picker
              v-model="form.dueDate"
              type="date"
              placeholder="Pick a date"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              style="width: 100%;"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <el-button @click="cancel">Cancel</el-button>
        <el-button type="primary" @click="submit">
          {{ isEdit ? "Save" : "Add" }}
        </el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup>
import { Close } from "@element-plus/icons-vue";
import { computed, reactive, ref, watch } from "vue";

const props = defineProps({
  statusOptions: { type: Array, default: () => [] },
  defaultStatus: { type: String, default: "" },
  initialTask: { type: Object, default: null },
});

const emit = defineEmits(["cancel", "save"]);

const formRef = ref();

const isEdit = computed(() => !!props.initialTask);

const form = reactive({
  name: "",
  description: "",
  status: props.defaultStatus || props.statusOptions[0] || "Todo",
  dueDate: "",
});

const rules = {
  name: [
    {
      required: true,
      message: "Please enter task name",
      trigger: "blur",
    },
    {
      min: 1,
      message: "Task name cannot be empty",
      trigger: "blur",
    },
  ],
  dueDate: [
    {
      required: true,
      message: "Please select due date",
      trigger: "change",
    },
  ],
};

watch(
  () => props.initialTask,
  (t) => {
    if (t) {
      form.name = t.name ?? "";
      form.description = t.description ?? "";
      form.status =
        t.status ?? (props.defaultStatus || props.statusOptions[0] || "Todo");
      form.dueDate = t.dueDate ?? "";
    } else {
      form.name = "";
      form.description = "";
      form.status = props.defaultStatus || props.statusOptions[0] || "Todo";
      form.dueDate = "";
    }

    formRef.value?.clearValidate();
  },
  { immediate: true }
);

watch(
  () => props.defaultStatus,
  (v) => {
    if (!isEdit.value) {
      form.status = v || props.statusOptions[0] || "Todo";
    }
  }
);

function cancel() {
  emit("cancel");
}

function submit() {
  formRef.value.validate((valid) => {
    if (!valid) return;

    const task = {
      id: props.initialTask?.id ?? Date.now(),
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      dueDate: form.dueDate || null,
    };

    emit("save", task);
  });
}
</script>