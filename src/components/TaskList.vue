<template>
  <div>
    <el-space direction="vertical" fill style="width: 100%">
      <el-button
        type="primary"
        :loading="loadingState.creatingTask"
        @click="openAdd"
      >
        + Add Task
      </el-button>

  <!-- Inline ADD form -->
      <el-card v-if="addingTask" shadow="never">
        <AddTask
          :status-options="statusOptions"
          :default-status="defaultStatus"
          :initial-task="null"
          :loading="loadingState.creatingTask"
          @cancel="closeForms"
          @save="onSaveTask"
        />
      </el-card>

      <el-space direction="vertical" fill style="width: 100%">
        <div v-for="t in tasks" :key="t.id">
           <!-- Inline EDIT form -->
          <el-card v-if="editingTaskId === t.id" shadow="never">
            <AddTask
              :status-options="statusOptions"
              :default-status="defaultStatus"
              :initial-task="t"
              :loading="loadingState.updatingTaskId === t.id"
              @cancel="closeForms"
              @save="onSaveTask"
            />
          </el-card>

 <!-- Normal card -->
          <el-card v-else shadow="hover">
            <el-space direction="vertical" fill style="width: 100%">
              <div>
                <strong>{{ t.name }}</strong>
              </div>

              <div v-if="t.description">
                {{ t.description }}
              </div>

              <el-space direction="vertical" size="small">
                <div>
                  <el-tag>{{ t.status }}</el-tag>
                </div>

                <div v-if="t.dueDate">
                  <span>Due:</span>
                  <span style="margin-left: 6px">{{ t.dueDate }}</span>
                </div>
              </el-space>

              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  width: 100%;
                "
              >
                <el-space>
                  <el-button
                    circle
                    :loading="loadingState.updatingTaskId === t.id"
                    @click="openEdit(t.id)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>

                  <el-popover
                    placement="bottom-start"
                    :width="260"
                    trigger="click"
                    :visible="moveOpenFor === t.id"
                  >
                    <template #reference>
                      <el-button circle @click.stop="toggleMovePopup(t.id)">
                        <el-icon><Rank /></el-icon>
                      </el-button>
                    </template>

                    <el-space direction="vertical" fill style="width: 100%">
                      <div><strong>Move position to:</strong></div>

                      <el-space>
                        <el-input-number
                          v-model="moveTo"
                          :min="1"
                          :max="tasks.length"
                          @keydown.enter.prevent="applyMove(t.id)"
                        />
                        <el-button @click="applyMove(t.id)">Move</el-button>
                      </el-space>

                      <div style="font-size: 12px; color: #909399">
                        1 = top, {{ tasks.length }} = bottom
                      </div>
                    </el-space>
                  </el-popover>
                </el-space>

                <el-button
                  type="danger"
                  circle
                  :loading="loadingState.deletingTaskId === t.id"
                  @click="onDelete(t.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </el-space>
          </el-card>
        </div>
      </el-space>
    </el-space>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Delete, Edit, Rank } from "@element-plus/icons-vue";
import AddTask from "./AddTask.vue";
import { ElMessageBox } from "element-plus";

const props = defineProps({
  sectionId: { type: [String, Number], required: true },
  sectionTitle: { type: String, required: true },
  tasks: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
  defaultStatus: { type: String, default: "Todo" },
  loadingState: { type: Object, default: () => ({}) },
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

async function onSaveTask(task) {
  await emit("upsert", {
    fromSectionId: props.sectionId,
    editingTaskId: editingTaskId.value,
    task,
  });
  closeForms();
}

async function onDelete(taskId) {
  const task = props.tasks.find((t) => t.id === taskId);
  if (!task) return;

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete the task "${task.name}"?`,
      "Delete Task",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );
  } catch {
    return;
  }

  await emit("delete", { sectionId: props.sectionId, taskId });
  closeMove();
}

/** move popup */
const moveOpenFor = ref(null);
const moveTo = ref(1);

function toggleMovePopup(taskId) {
  if (moveOpenFor.value === taskId) {
    closeMove();
    return;
  }
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