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

    <el-form label-position="top" @submit.prevent="submit">
      <el-form-item label="Task Name *">
        <el-input v-model.trim="name" placeholder="Enter Your Task" />
      </el-form-item>

      <el-form-item label="Description">
        <el-input
          v-model.trim="description"
          type="textarea"
          placeholder="Description"
          :rows="4"
        />
      </el-form-item>

      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="Status">
            <el-select v-model="status" placeholder="Select Status" style="width: 100%;">
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
          <el-form-item label="Due Date">
            <el-date-picker
              v-model="dueDate"
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
import { computed, ref, watch } from "vue";

const props = defineProps({
  statusOptions: { type: Array, default: () => [] },
  defaultStatus: { type: String, default: "" },
  initialTask: { type: Object, default: null },
});

const emit = defineEmits(["cancel", "save"]);

const isEdit = computed(() => !!props.initialTask);

const name = ref("");
const description = ref("");
const status = ref(props.defaultStatus || props.statusOptions[0] || "Todo");
const dueDate = ref("");

watch(
  () => props.initialTask,
  (t) => {
    if (t) {
      name.value = t.name ?? "";
      description.value = t.description ?? "";
      status.value =
        t.status ?? (props.defaultStatus || props.statusOptions[0] || "Todo");
      dueDate.value = t.dueDate ?? "";
    } else {
      name.value = "";
      description.value = "";
      status.value = props.defaultStatus || props.statusOptions[0] || "Todo";
      dueDate.value = "";
    }
  },
  { immediate: true }
);

watch(
  () => props.defaultStatus,
  (v) => {
    if (!isEdit.value) {
      status.value = v || props.statusOptions[0] || "Todo";
    }
  }
);

function cancel() {
  emit("cancel");
}

function submit() {
  if (!name.value.trim()) return;

  const task = {
    id: props.initialTask?.id ?? Date.now(),
    name: name.value.trim(),
    description: description.value.trim(),
    status: status.value,
    dueDate: dueDate.value || null,
  };

  emit("save", task);
}
</script>