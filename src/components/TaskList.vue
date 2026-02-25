<template>
  <div>
    <button class="btn btn--add" @click="openAdd">
      + Add Task
    </button>

    <!-- Inline ADD form -->
    <AddTask 
    v-if="addingTask" 
    :status-options="statusOptions" 
    :default-status="defaultStatus" 
    :initial-task="null"
    @cancel="closeForms"
    @save="onSaveTask"
     />

    <div class="task-list">
      <div v-for="t in tasks" :key="t.id" class="task-row">
        <!-- Inline EDIT form -->
        <AddTask 
        v-if="editingTaskId === t.id" 
        :status-options="statusOptions" 
        :default-status="defaultStatus"
        :initial-task="t" 
        @cancel="closeForms"
        @save="onSaveTask"
          />

        <!-- Normal task card(when not editing) -->
        <div v-else class="task-card">
          <div class="task-title">{{ t.name }}</div>
          <div class="task-desc" v-if="t.description">{{ t.description }}</div>

          <div class="task-meta">
            <span>{{ t.status }}</span>
            <span v-if="t.dueDate">{{ t.dueDate }}</span>
          </div>

          <div class="task-actions">
            <!-- DELETE -->
            <button 
            class="action-btn" 
            @click="onDelete(t.id)" 
            title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>

            <!-- EDIT -->
            <button class="action-btn" @click="openEdit(t.id)" title="Edit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>

            <!-- INTERCHANGE / MOVE POSITION -->
            <div class="moveWrap" @click.stop>
              <button class="action-btn" @click="toggleMovePopup(t.id)" title="Move position">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>

              </button>

              <!--  Interchange popup -->
              <div v-if="moveOpenFor === t.id" class="movePopup">
                <div class="moveLabel">Move position to:</div>

                <div class="moveRow">
                  <input class="moveInput" type="number" min="1" :max="tasks.length" v-model="moveTo"
                    @keydown.enter.prevent="applyMove(t.id)" />
                  <button class="moveBtn" type="button" @click="applyMove(t.id)">
                    Move
                  </button>
                </div>

                <div class="moveHint">1 = top, {{ tasks.length }} = bottom</div>
              </div>
            </div>
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

//  Move popup state
const moveOpenFor = ref(null); // taskId
const moveTo = ref(""); // user input like "1"
// popup handlers
function toggleMovePopup(taskId) {
  if (moveOpenFor.value === taskId) {
    closeMove();
    return;
  }
  moveOpenFor.value = taskId;
  moveTo.value = ""; // reset input
}

function closeMove() {
  moveOpenFor.value = null;
  moveTo.value = null;
}

function applyMove(taskId) {
  const n = moveTo.value;

  // user enters 1-based position
  const newIndex = n - 1;
  if (newIndex < 0 || newIndex >= props.tasks.length) return;

  emit("move", {
    sectionId: props.sectionId,
    taskId,
    newIndex,
  });

  closeMove();
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
  background:#64748b;
}

.task-row {
  position: relative;
}

.task-card {
  border: 3px solid black;
  border-radius: 10px;
  padding: 8px;
  margin-top: 10px;
  background-color: #fff7ed;
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
  align-items: center;
}

.action-btn {
  width: 30px;
  height: 30px;
  padding: 5px;
  border: 1px solid;
  border-radius: 5px;
  background-color: #6194d7;
  color: white;
}

.action-btn:hover {
  cursor: pointer;
}

/*  Move popup UI */
.moveWrap {
  position: relative;
  display: inline-block;
}

.movePopup {
  position: absolute;
  top: 36px;
  right: 0;
  background: #f3f4f6;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px;
  width: 220px;
  z-index: 200;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
  color: #111827;
}

.moveLabel {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.moveRow {
  display: flex;
  gap: 8px;
  align-items: center;
}

.moveInput {
  width: 70px;
  height: 32px;
  border: 1px solid #94a3b8;
  border-radius: 6px;
  padding: 6px 8px;
  outline: none;
}

.moveBtn {
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #94a3b8;
  background: #e5e7eb;
  cursor: pointer;
}

.moveHint {
  font-size: 11px;
  margin-top: 8px;
  color: #4b5563;
}
</style>
