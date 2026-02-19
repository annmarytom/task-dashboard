<template>
  <div>
    <button class="btn btn--add" @click="openAdd">
      + Add Task
    </button>

    <!-- Inline ADD form (appears above tasks) -->
    <AddTask
      v-if="addingTask"
      :status-options="statusOptions"
      :default-status="defaultStatus"
      :initial-task="null"
      @cancel="closeForms"
      @save="onSaveTask"
    />

    <div class="task-list">
      <div v-for="t in tasks" :key="t.id">
        <!-- Inline EDIT form (replaces the task card at same position) -->
        <AddTask
          v-if="editingTaskId === t.id"
          :status-options="statusOptions"
          :default-status="defaultStatus"
          :initial-task="t"
          @cancel="closeForms"
          @save="onSaveTask"
        />

        <!-- Normal task card -->
        <div v-else class="task-card">
          <div class="task-title">{{ t.name }}</div>
          <div class="task-desc" v-if="t.description">{{ t.description }}</div>

          <div class="task-meta">
            <span>{{ t.status }}</span>
            <span v-if="t.dueDate">{{ t.dueDate }}</span>
          </div>

          <div class="task-actions">
            <button class="action-btn" @click="onDelete(t.id)">
              <!-- delete icon -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>

            <button class="action-btn" @click="openEdit(t.id)">
              <!-- edit icon -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AddTask from "./AddTask.vue";

const props = defineProps({
      // identifies which section we are currently rendering
  sectionId: { type: [String, Number], required: true },
  sectionTitle: { type: String, required: true },
   // tasks for this section
  tasks: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
  defaultStatus: { type: String, default: "Todo" },
});

const emit = defineEmits(["upsert", "delete"]);

const addingTask = ref(false);
const editingTaskId = ref(null);

function openAdd() {
  addingTask.value = true;
  editingTaskId.value = null;
}

function openEdit(taskId) {
  editingTaskId.value = taskId;
  addingTask.value = false;
}

function closeForms() {
  addingTask.value = false;
  editingTaskId.value = null;
}

function onSaveTask(task) {
   // tell dashboard which section this came from + what task
  emit("upsert", {
    fromSectionId: props.sectionId,
    editingTaskId: editingTaskId.value,
    task,
  });
  closeForms();
}

function onDelete(taskId) {
  emit("delete", { sectionId: props.sectionId, taskId });
}
</script>

<style scoped>
.btn {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: #e5e7eb;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
}

.btn--add {
  width: fit-content;
  border: 2px solid rgba(204, 206, 206, 0.55);
  background: transparent;
}

.task-card {
  border: 3px solid white;
  border-radius: 10px;
  padding: 8px;
  margin-top: 10px;
}

.task-title {
  font-size: 16px;
  font-weight: 700;
}

.task-meta {
  display: flex;
  justify-content: space-between;
}

.task-actions {
  display: flex;
  justify-content: space-between;
}

.action-btn {
  width: 30px;
  height: 30px;
  padding: 5px;
  border: none;
  background-color: #263d70;
  color: white;
}

.action-btn:hover {
  cursor: pointer;
}
</style>
