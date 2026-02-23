<template>
  <div class="tableCard">
    <div class="tableHeader">
      <div class="tableTitle">All Tasks</div>
    </div>

    <div class="tableScroll">
      <table class="taskTable">
        <thead>
          <tr>
            <th>Task</th>
            <th>Description</th>
            <th>Status</th>
            <th>Due</th>
            <th style="width: 120px;">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in flatTasks" :key="row.task.id">
            <td class="tdTitle">{{ row.task.name }}</td>
            <td class="tdDesc">{{ row.task.description || "-" }}</td>

            <td>
              <select
                class="select"
                :value="row.task.status"
                @change="onChangeStatus(row.sectionId, row.task, $event)"
              >
                <option v-for="opt in statusOptions" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </td>

            <td>
              <input
                class="date"
                type="date"
                :value="row.task.dueDate || ''"
                @change="onChangeDue(row.sectionId, row.task, $event)"
              />
            </td>

            <td class="actions">
              <button class="dangerBtn" type="button" @click="onDelete(row.sectionId, row.task.id)">
                Delete
              </button>
            </td>
          </tr>

          <tr v-if="flatTasks.length === 0">
            <td colspan="5" class="empty">No tasks yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  sections: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
});

const emit = defineEmits(["upsert", "delete"]);


const flatTasks = computed(() => {
  const out = [];
  for (const sec of props.sections) {
    for (const task of sec.tasks || []) {
      out.push({ sectionId: sec.id, task });
    }
  }
  return out;
});

function onDelete(sectionId, taskId) {
  emit("delete", { sectionId, taskId });
}

function onChangeStatus(sectionId, task, e) {
  const newStatus = e.target.value;
  emit("upsert", {
    fromSectionId: sectionId,
    editingTaskId: task.id,
    task: { ...task, status: newStatus },
  });
}

function onChangeDue(sectionId, task, e) {
  const dueDate = e.target.value || null;

  emit("upsert", {
    fromSectionId: sectionId,
    editingTaskId: task.id,
    task: { ...task, dueDate },
  });
}
</script>

<style scoped>
.tableCard {
  background: #263d70;
  border: 2px solid rgba(204, 206, 206, 0.55);
  border-radius: 18px;
  padding: 12px;
  color: #e5e7eb;
}

.tableHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.tableTitle {
  font-size: 18px;
  font-weight: 800;
}

.tableScroll {
  overflow: auto;
  max-height: 560px;
  border-radius: 12px;
}

.taskTable {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.taskTable th,
.taskTable td {
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  text-align: left;
  vertical-align: top;
}

.taskTable th {
  position: sticky;
  top: 0;
  background: #1f2f58;
  z-index: 2;
}

.tdTitle {
  font-weight: 700;
}

.tdDesc {
  opacity: 0.9;
}

.select,
.date {
  width: 100%;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.06);
  color: #e5e7eb;
  padding: 6px 10px;
  outline: none;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dangerBtn {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(248, 113, 113, 0.6);
  background: rgba(248, 113, 113, 0.12);
  color: #fecaca;
  cursor: pointer;
}

.empty {
  text-align: center;
  padding: 16px;
  opacity: 0.8;
}
</style>