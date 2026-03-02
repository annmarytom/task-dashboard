<template>
  <div class="list">
    <button class="add-bar" type="button" @click="openAdd">
      + Add Task
    </button>

    <!-- Inline ADD form -->
    <div v-if="addingTask" class="inline-form">
      <AddTask :status-options="statusOptions" :default-status="defaultStatus" :initial-task="null" @cancel="closeForms"
        @save="onSaveTask" />
    </div>

    <div class="cards">
      <div v-for="t in tasks" :key="t.id" class="card-wrap">
        <!-- Inline EDIT form -->
        <div v-if="editingTaskId === t.id" class="inline-form">
          <AddTask :status-options="statusOptions" :default-status="defaultStatus" :initial-task="t"
            @cancel="closeForms" @save="onSaveTask" />
        </div>

        <!-- Normal card -->
        <div v-else class="card">
          <div class="card-top">
            <div class="card-title">{{ t.name }}</div>
          </div>

          <div class="card-desc" v-if="t.description">{{ t.description }}</div>

          <div class="card-meta">
            <div class="meta-line">
              <span class="meta-label">{{ t.status }}</span>
            </div>
            <div class="meta-line" v-if="t.dueDate">
              <span class="meta-dim">Due:</span> <span>{{ t.dueDate }}</span>
            </div>
          </div>

          <div class="card-actions">
            <div class="left-actions">
              <button class="mini-btn" type="button" title="Edit" @click="openEdit(t.id)"> <svg
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg></button>

              <div class="move-wrap" @click.stop>
                <button class="mini-btn" type="button" title="Move position" @click="toggleMovePopup(t.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                  </svg>

                </button>

                <div v-if="moveOpenFor === t.id" class="move-popup">
                  <div class="move-label">Move position to:</div>

                  <div class="move-row">
                    <input class="move-input" type="number" min="1" :max="tasks.length" v-model.number="moveTo"
                      @keydown.enter.prevent="applyMove(t.id)" />
                    <button class="move-btn" type="button" @click="applyMove(t.id)">Move</button>
                  </div>

                  <div class="move-hint">1 = top, {{ tasks.length }} = bottom</div>
                </div>
              </div>
            </div>

            <button class="delete-btn" type="button" title="Delete" @click="onDelete(t.id)"><svg
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg></button>
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
  sectionId: { type: [String, Number], required: true },
  sectionTitle: { type: String, required: true },
  tasks: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
  defaultStatus: { type: String, default: "Todo" },
});

const emit = defineEmits(["upsert", "delete", "move"]);

const addingTask = ref(false);
const editingTaskId = ref(null);

function openAdd() {
  addingTask.value = true;
  editingTaskId.value = null;
  closeMove();
}

function openEdit(taskId) {
  editingTaskId.value = taskId;
  addingTask.value = false;
  closeMove();
}

function closeForms() {
  addingTask.value = false;
  editingTaskId.value = null;
}

function onSaveTask(task) {
  emit("upsert", {
    fromSectionId: props.sectionId,
    editingTaskId: editingTaskId.value,
    task,
  });
  closeForms();
}

function onDelete(taskId) {
  emit("delete", { sectionId: props.sectionId, taskId });
  closeMove();
}

/** move popup */
const moveOpenFor = ref(null);
const moveTo = ref(1);

function toggleMovePopup(taskId) {
  if (moveOpenFor.value === taskId) return closeMove();
  moveOpenFor.value = taskId;
  moveTo.value = 1;
}

function closeMove() {
  moveOpenFor.value = null;
  moveTo.value = 1;
}

function applyMove(taskId) {
  const newIndex = (moveTo.value || 1) - 1;
  if (newIndex < 0 || newIndex >= props.tasks.length) return;

  emit("move", { sectionId: props.sectionId, taskId, newIndex });
  closeMove();
}
</script>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-bar {
  width: 100%;
  border: none;
  background: #64748b;
  color: #ffffff;
  font-weight: 900;
  padding: 12px 12px;
  border-radius: 10px;
  cursor: pointer;
}

.inline-form {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 12px;
  background: #ffffff;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
}

.card-title {
  font-size: 15px;
  font-weight: 900;
  color: #111827;
}

.card-desc {
  margin-top: 8px;
  font-size: 13px;
  color: #334155;
}

.card-meta {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #475569;
}

.meta-label {
  font-weight: 900;
}

.meta-dim {
  color: #94a3b8;
  margin-right: 6px;
}

.card-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mini-btn {
  width: 25px;
  height: 25px;
  border-radius: 4px;
  border: 1px solid #dbeafe;
  background: #60a5fa;
  color: #ffffff;
  cursor: pointer;
  font-weight: 900;
}

.delete-btn {
  width: 25px;
  height: 25px;
  border-radius: 4px;
  border: none;
  background: #ef4444;
  color: #ffffff;
  cursor: pointer;
  font-weight: 900;
}

/* move popup */
.move-wrap {
  position: relative;
}

.move-popup {
  position: absolute;
  top: 40px;
  left: 0;
  width: 230px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px;
  z-index: 50;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.move-label {
  font-size: 12px;
  font-weight: 900;
  color: #334155;
  margin-bottom: 8px;
}

.move-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.move-input {
  width: 70px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  outline: none;
}

.move-btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  cursor: pointer;
  font-weight: 900;
}

.move-hint {
  font-size: 11px;
  color: #64748b;
  margin-top: 8px;
}
</style>