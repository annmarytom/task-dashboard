<template>
  <div class="task-form">
    <div class="task-form-header">
      <h3 class="task-form-title">{{ isEdit ? "Edit Task" : "Add New Task" }}</h3>

      <button class="close-btn" type="button" @click="cancel">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form class="form" @submit.prevent="submit">
      <div class="field">
        <label class="label">Task Name *</label>
        <input v-model.trim="name" type="text" class="input" placeholder="Enter Your Task" />
      </div>

      <div class="field">
        <label class="label">Description</label>
        <textarea v-model.trim="description" class="input area" placeholder="Description">
        </textarea>
      </div>

      <div class="row">
        <div class="field">
          <label class="label">Status</label>
          <select v-model="status" class="input">
            <option v-for="opt in statusOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>

        <div class="field">
          <label class="label">Due Date</label>
          <input v-model="dueDate" type="date" class="input" />
        </div>
      </div>

      <div class="actions">
        <button class="ghost" type="button" @click="cancel">Cancel</button>
        <button class="primary" type="submit">{{ isEdit ? "Save" : "Add" }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
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
    if (!isEdit.value)
      status.value = v || props.statusOptions[0] || "Todo";
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

<style scoped>
.task-form {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
}

.task-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-form-title {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  color: #111827;
}

.close-btn {
  width: 25px;
  height: 25px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  cursor: pointer;
  font-weight: 900;
}

.form {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  font-weight: 800;
  color: #475569;
}

.input {
  height: 38px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  outline: none;
  color: #111827;
  background: #ffffff;
}

.input:focus {
  border-color: #f97316;
}

.area {
  min-height: 78px;
  resize: vertical;
  padding-top: 10px;
}

.row {
  display: flex;
  gap: 10px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.primary {
  border: none;
  background: #f97316;
  color: #ffffff;
  font-weight: 900;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
}

.ghost {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #0f172a;
  font-weight: 900;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
}
</style>