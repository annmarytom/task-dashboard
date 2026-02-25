<template>
  <div class="taskForm">
    <div class="taskForm-header">
      <h3 class="taskForm-title">
        {{ isEdit ? "Edit Task" : "Add New Task" }}
      </h3>

      <button class="taskForm-close" type="button" @click="cancel">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <form class="form" @submit.prevent="submit">
      <div class="input-fields">
        <label class="label">Task Name * </label>
        <input
          v-model.trim="name"
          type="text"
          class="input"
          placeholder="Ex:Build Logic"
        />
      </div>

      <div class="input-fields">
        <label class="label">Description</label>
        <textarea
          v-model.trim="description"
          class="input"
          placeholder="Details"
        ></textarea>
      </div>

      <div class="input-fields-meta">
        <div class="input-fields">
          <label class="label">Status</label>
          <select v-model="status" class="input">
            <option v-for="opt in statusOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>

        <div class="input-fields">
          <label class="label">Due Date</label>
          <input v-model="dueDate" type="date" class="input" />
        </div>
      </div>

      <div class="actions">
        <button class="cancel-button" type="button" @click="cancel">
          Cancel
        </button>
        <button class="add-button" type="submit">
          {{ isEdit ? "Save" : "Add" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  statusOptions: { type: Array, default: () => [] },
  defaultStatus: { type: String, default: "" },
  //  if provided => edit mode
  initialTask: { type: Object, default: null },
});

const emit = defineEmits(["cancel", "save"]);

const isEdit = computed(() => !!props.initialTask);

// form fields
const name = ref("");
const description = ref("");
const status = ref(props.defaultStatus || props.statusOptions[0] || "Todo");
const dueDate = ref("");
//  whenever we open modal for edit, fill values
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
      // add mode reset
      name.value = "";
      description.value = "";
      status.value = props.defaultStatus || props.statusOptions[0] || "Todo";
      dueDate.value = "";
    }
  },
  { immediate: true }
);

// if dashboard changes default status while in add mode
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
  //  if edit, keep same id
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
.taskForm {
  width: 100%;
  margin-top: 10px;
  background-color: #fff7ed;
  border: 3px solid black;
  border-radius: 15px;
  padding: 14px;
}

.taskForm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

}

.taskForm-title {
  color: black;
  font-size: 16px;
  font-weight: 700;
}

.taskForm-close {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.form {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.input-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.label {
  color: rgb(13, 3, 3);
  font-family: Arial, Helvetica, sans-serif;
  font-size: small;
}

.input {
  width: auto;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background-color: transparent;
  padding: 12px;
  color: #030407;
}

textarea.input {
  height: 80px;
  resize: vertical;
}

.input-fields-meta {
  display: flex;
  gap: 10px;
}

.actions {
  display: flex;
  justify-content: end;
  gap: 12px;
  margin-top: 14px;
}

.add-button {
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #444;
  background: #6194d7;
  color: white;
}
.cancel-button{
  padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid #444;
    background: #6194d7;
    color: white;
}
</style>