<template>
  <div class="table-card" @click="closeAllMenus">
    <!-- Header row -->
    <div class="table-header">
      <button class="create-btn" type="button" @click.stop="openCreateInTab">
        + Create task
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs" @click.stop>
      <button 
      v-for="sec in sections" 
      :key="sec.id" 
      class="tab" 
      :class="{ active: activeSectionId === sec.id }"
      type="button" 
      @click="activeSectionId = sec.id"
      >
        {{ sec.title }} ({{ (sec.tasks || []).length }})
      </button>

     <!-- Add Section tab -->
<div class="addSectionTab">
  <button
    v-if="!addingSection"
    class="tab dashed"
    type="button"
    @click="openAddSection"
  >
    + Add Section
  </button>

  <div v-else class="addSectionEditor">
    <SectionInlineEditor
      v-model="newSectionTitle"
      placeholder="Section name"
      @save="saveAddSection"
      @cancel="cancelAddSection"
    />
  </div>
</div>
    </div>

    <!-- Table -->
    <div class="table-scroll" @click.stop>
      <table class="task-table">
        <thead>
          <tr>
            <th>Task name</th>
            <th>Description</th>
            <th style="width: 180px">Status</th>
            <th style="width: 160px;">Due date</th>
            <th style="width: 170px;">Action</th>
          </tr>
        </thead>

        <tbody>
          <!-- Create row -->
          <tr v-if="addingTask" class="inlinRow">
            <td>
              <input 
              class="cell-input" 
              type="text"
              placeholder="Task name *" 
              v-model.trim="addDraft.name"
              @keydown.enter.prevent="saveCreate" 
              />
            </td>

            <td>
              <input 
              class="cell-input" 
              type="text" 
              placeholder="Description"
              v-model.trim="addDraft.description"
              @keydown.enter.prevent="saveCreate" 
              />
            </td>

            <td>
              <select class="cellSelect" v-model="addDraft.status">
                <option v-for="opt in statusOptions" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </td>

            <td>
              <input class="cellDate" type="date" v-model="addDraft.dueDate" />
            </td>

            <td>
              <div class="row-actions">
                <button class="btnPrimary" type="button" @click="saveCreate">
                  Add
                </button>
                <button class="btnGhost" type="button" @click="closeCreate">
                  Cancel
                </button>
              </div>
            </td>
          </tr>

          <!-- Existing rows -->
          <tr v-for="row in activeRows" :key="row.task.id">
            <!-- name -->
            <td>
              <template v-if="isEditing(row)">
                <input class="cell-input" type="text" v-model.trim="editDraft.name" />
              </template>
              <template v-else>
                <div class="name">{{ row.task.name }}</div>
              </template>
            </td>

            <!-- description -->
            <td>
              <template v-if="isEditing(row)">
                <input class="cell-input" type="text" v-model.trim="editDraft.description" placeholder="-" />
              </template>
              <template v-else>
                <div class="desc">{{ row.task.description || "-" }}</div>
              </template>
            </td>

            <!-- status -->
            <td>
              <template v-if="isEditing(row)">
                <select class="cellSelect" v-model="editDraft.status">
                  <option v-for="opt in statusOptions" :key="opt" :value="opt">
                    {{ opt }}
                  </option>
                </select>
              </template>
              <template v-else>
                <span class="statusDot"></span>
                <span class="statusText">{{ row.task.status }}</span>
              </template>
            </td>

            <!-- due date-->
            <td>
              <template v-if="isEditing(row)">
                <input class="cellDate" type="date" v-model="editDraft.dueDate" />
              </template>
              <template v-else>
                <span>{{ row.task.dueDate || "-" }}</span>
              </template>
            </td>

            <!-- action -->
            <td class="action-cell ">
              <template v-if="isEditing(row)">
                <div class="row-actions">
                  <button class="btnPrimary" type="button" @click="saveEdit(row)">
                    Save
                  </button>
                  <button class="btnGhost" type="button" @click="cancelEdit">
                    Cancel
                  </button>
                </div>
              </template>

              <template v-else>
                <button class="dots-btn" type="button" @click.stop="toggleMenu(row.task.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>

                </button>

                <div v-if="menuOpenFor === row.task.id" class="menu">
                  <button class="menu-item" type="button" @click="startEdit(row)">
                    Edit
                  </button>

                  <button class="menu-item" type="button" @click="toggleInterchange(row.task.id)">
                    Interchange
                  </button>

                  <button class="menu-item danger" type="button" @click="onDelete(row.sectionId, row.task.id)">
                    Delete
                  </button>

                  <div v-if="moveOpenFor === row.task.id" class="moveBox" @click.stop>
                    <div class="move-label">Move position to:</div>
                    <div class="moveRow">
                      <input 
                      class="moveInput" 
                      type="number" 
                      min="1"
                      :max="activeRows.length"
                      v-model.number="moveTo"
                      @keydown.enter.prevent="applyMove(row.sectionId, row.task.id)"
                       />
                      <button class="moveBtn" type="button" @click="applyMove(row.sectionId, row.task.id)">
                        Move
                      </button>
                    </div>
                    <div class="moveHint">1 = top, {{ activeRows.length }} = bottom</div>
                  </div>
                </div>
              </template>
            </td>
          </tr>

          <tr v-if="activeRows.length === 0 && !addingTask">
            <td colspan="5" class="empty">No tasks yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import SectionInlineEditor from "./SectionInlineEditor.vue";

const props = defineProps({
  sections: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
});

const emit = defineEmits(["upsert", "delete", "move", "add-section-requested"]);

const activeSectionId = ref(null);

watch(
  () => props.sections,
  (secs) => {
    if (!activeSectionId.value && secs?.length) activeSectionId.value = secs[0].id;

    if (activeSectionId.value && !secs.some((s) => s.id === activeSectionId.value)) {
      activeSectionId.value = secs[0]?.id ?? null;
    }
  },
  { immediate: true, deep: true }
);

const activeSection = computed(() => props.sections.find((s) => s.id === activeSectionId.value));
const activeSectionTitle = computed(() => activeSection.value?.title || "Todo");

const activeRows = computed(() => {
  const sec = activeSection.value;
  if (!sec) return [];
  return (sec.tasks || []).map((task) => ({ sectionId: sec.id, task }));
});

watch(activeSectionId, () => {
  addingTask.value = false;
  closeAllMenus();
  cancelEdit();
  cancelAddSection();
});

/** create */
const addingTask = ref(false);
const addDraft = ref({ name: "", description: "", status: "", dueDate: "" });
const addingSection = ref(false);
const newSectionTitle = ref("");

function openAddSection() {
  addingSection.value = true;
  newSectionTitle.value = "";
  closeAllMenus();
  cancelEdit();
  addingTask.value = false; // optional: closes create-task row if you want
}

function cancelAddSection() {
  addingSection.value = false;
  newSectionTitle.value = "";
}

function saveAddSection(title) {
  const v = (title || "").trim();
  if (!v) return;

  emit("add-section-requested", v);

  addingSection.value = false;
  newSectionTitle.value = "";
}
function openCreateInTab() {
  addingTask.value = true;
  addDraft.value = {
    name: "",
    description: "",
    status: activeSectionTitle.value,
    dueDate: "",
  };
  closeAllMenus();
  cancelEdit();
}

function closeCreate() {
  addingTask.value = false;
  addDraft.value = { name: "", description: "", status: "", dueDate: "" };
}

function saveCreate() {
  const name = (addDraft.value.name || "").trim();
  if (!name) return;

  const task = {
    id: Date.now(),
    name,
    description: (addDraft.value.description || "").trim(),
    status: addDraft.value.status || activeSectionTitle.value,
    dueDate: addDraft.value.dueDate || null,
  };

  emit("upsert", {
    fromSectionId: activeSectionId.value,
    editingTaskId: null,
    task,
  });

  closeCreate();
}

/** menu */
const menuOpenFor = ref(null);
function toggleMenu(taskId) {
  menuOpenFor.value = menuOpenFor.value === taskId ? null : taskId;
  if (menuOpenFor.value !== taskId) closeMove();
}
function closeAllMenus() {
  menuOpenFor.value = null;
  closeMove();
}

/** Move (Interchange) */
const moveOpenFor = ref(null);
const moveTo = ref(1);

function toggleInterchange(taskId) {
  if (moveOpenFor.value === taskId) return closeMove();
  moveOpenFor.value = taskId;
  moveTo.value = 1;
}

function closeMove() {
  moveOpenFor.value = null;
  moveTo.value = 1;
}

function applyMove(sectionId, taskId) {
  const newIndex = (moveTo.value || 1) - 1;
  if (newIndex < 0 || newIndex >= activeRows.value.length) return;
  emit("move", { sectionId, taskId, newIndex });
  closeAllMenus();
}

/** edit */
const editingKey = ref(null);
const editDraft = ref({ name: "", description: "", status: "", dueDate: "" });

function keyOf(row) {
  return `${row.sectionId}:${row.task.id}`;
}
function isEditing(row) {
  return editingKey.value === keyOf(row);
}

function startEdit(row) {
  editingKey.value = keyOf(row);
  editDraft.value = {
    name: row.task.name ?? "",
    description: row.task.description ?? "",
    status: row.task.status ?? activeSectionTitle.value,
    dueDate: row.task.dueDate ?? "",
  };
  addingTask.value = false;
  closeAllMenus();
}

function cancelEdit() {
  editingKey.value = null;
  editDraft.value = { name: "", description: "", status: "", dueDate: "" };
}

function saveEdit(row) {
  const name = (editDraft.value.name || "").trim();
  if (!name) return;

  emit("upsert", {
    fromSectionId: row.sectionId,
    editingTaskId: row.task.id,
    task: {
      ...row.task,
      name,
      description: (editDraft.value.description || "").trim(),
      status: editDraft.value.status,
      dueDate: editDraft.value.dueDate || null,
    },
  });

  cancelEdit();
}

/** Delete */
function onDelete(sectionId, taskId) {
  emit("delete", { sectionId, taskId });
  closeAllMenus();
  cancelEdit();
}
</script>

<style scoped>
.table-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  color: #0f172a;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 12px;
}

.create-btn {
  border: none;
  background: #f97316;
  color: #ffffff;
  font-weight: 900;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
}

.tabs {
  display: flex;
  gap: 14px;
  padding: 8px 2px 12px;
  border-bottom: 1px solid #eef2f7;
  margin-bottom: 12px;
  overflow-x: auto;
}

.tab {
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 900;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 12px;
  white-space: nowrap;
}

.tab.active {
  background: #fff7ed;
  color: #f97316;
}

.tab.dashed {
  border: 2px dashed #cbd5e1;
  background: #ffffff;
  color: #334155;
}


.table-scroll {
  overflow: auto;
  height: 520px;
  border-radius: 12px;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
}

.task-table th,
.task-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  vertical-align: middle;
}

.task-table th {
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 2;
  font-size: 12px;
  color: #64748b;
  font-weight: 900;
}

.name {
  font-weight: 900;
}

.desc {
  color: #334155;
}

.inlineRow {
  background: #fff7ed;
}

.cell-input,
.cellSelect,
.cellDate {
  width: 100%;
  height: 36px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #0f172a;
  padding: 8px 10px;
  outline: none;
}

.cell-input:focus,
.cellSelect:focus,
.cellDate:focus {
  border-color: #f97316;
}

.row-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
}

.btnPrimary {
  border: none;
  background: #f97316;
  color: #ffffff;
  font-weight: 900;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
}

.btnGhost {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #0f172a;
  font-weight: 900;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
}


.statusDot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #f97316;
  margin-right: 8px;
}

.statusText {
  font-weight: 800;
}


.action-cell {
  position: relative;
}

.dots-btn {
 width:20px;
 height: 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  cursor: pointer;
  font-weight: 900;
}

.menu {
  position: absolute;
  top: 44px;
  right: 0;
  width: 190px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  padding: 8px;
  z-index: 50;
}

.menu-item {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 10px 10px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 900;
  color: #0f172a;
}

.menu-item:hover {
  background: #f8fafc;
}

.menu-item.danger {
  color: #ef4444;
}

.menu-item.danger:hover {
  background: #fef2f2;
}


.moveBox {
  margin-top: 8px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

.move-label {
  font-size: 12px;
  font-weight: 900;
  color: #334155;
  margin-bottom: 8px;
}

.moveRow {
  display: flex;
  gap: 8px;
  align-items: center;
}

.moveInput {
  width: 70px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 8px 10px;
  outline: none;
}

.moveBtn {
  height: 36px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  cursor: pointer;
  font-weight: 900;
}

.moveHint {
  font-size: 11px;
  color: #64748b;
  margin-top: 8px;
}

.empty {
  text-align: center;
  padding: 18px;
  color: #64748b;
  font-weight: 900;
}
.addSectionTab {
  display: flex;
  align-items: center;
}

.addSectionEditor {
  min-width: 260px;
}
</style>