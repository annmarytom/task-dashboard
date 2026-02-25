<template>
  <div class="tableCard" @click="closeAllMenus">
    <!-- Header -->
    <div class="tableHeader">
 

      <!-- Compact inline create -->
      <button class="createBtn" type="button" @click.stop="openCreateInTab">
        + Create task
      </button>
    </div>

    <!-- Tabs = Sections -->
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
    </div>

    <!-- Table -->
    <div class="tableScroll" @click.stop>
      <table class="taskTable">
        <thead>
          <tr>
            <th>Task name</th>
            <th>Description</th>
            <th style="width: 180px;">Status</th>
            <th style="width: 160px;">Due date</th>
            <th style="width: 170px;">Action</th>
          </tr>
        </thead>

        <tbody>
          <!-- Compact CREATE row -->
          <tr v-if="addingTask" class="inlineRow">
            <td>
              <input
                class="cellInput"
                type="text"
                placeholder="Task name *"
                v-model.trim="addDraft.name"
                @keydown.enter.prevent="saveCreate"
              />
            </td>

            <td>
              <input
                class="cellInput"
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
              <div class="rowActions">
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
            <!-- NAME -->
            <td>
              <template v-if="isEditing(row)">
                <input class="cellInput" type="text" v-model.trim="editDraft.name" />
              </template>
              <template v-else>
                <div class="name">{{ row.task.name }}</div>
              </template>
            </td>

            <!-- DESCRIPTION -->
            <td>
              <template v-if="isEditing(row)">
                <input
                  class="cellInput"
                  type="text"
                  v-model.trim="editDraft.description"
                  placeholder="-"
                />
              </template>
              <template v-else>
                <div class="desc">{{ row.task.description || "-" }}</div>
              </template>
            </td>

            <!-- STATUS -->
            <td>
              <template v-if="isEditing(row)">
                <select class="cellSelect" v-model="editDraft.status">
                  <option v-for="opt in statusOptions" :key="opt" :value="opt">
                    {{ opt }}
                  </option>
                </select>
              </template>
              <template v-else>
                <span class="statusPill">{{ row.task.status }}</span>
              </template>
            </td>

            <!-- DUE DATE -->
            <td>
              <template v-if="isEditing(row)">
                <input class="cellDate" type="date" v-model="editDraft.dueDate" />
              </template>
              <template v-else>
                <span>{{ row.task.dueDate || "-" }}</span>
              </template>
            </td>

            <!-- ACTION -->
            <td class="actionCell">
              <!-- Editing row -> Save/Cancel -->
              <template v-if="isEditing(row)">
                <div class="rowActions">
                  <button class="btnPrimary" type="button" @click="saveEdit(row)">
                    Save
                  </button>
                  <button class="btnGhost" type="button" @click="cancelEdit">
                    Cancel
                  </button>
                </div>
              </template>

              <!-- Normal row -> action menu -->
              <template v-else>
                <button class="dotsBtn" type="button" @click.stop="toggleMenu(row.task.id)">
                  ⋯
                </button>

                <div v-if="menuOpenFor === row.task.id" class="menu">
                  <button class="menuItem" type="button" @click="startEdit(row)">
                    Edit
                  </button>

                  <button class="menuItem" type="button" @click="toggleInterchange(row.task.id)">
                    Interchange
                  </button>

                  <button class="menuItem danger" type="button" @click="onDelete(row.sectionId, row.task.id)">
                    Delete
                  </button>

                  <!-- Interchange popup -->
                  <div v-if="moveOpenFor === row.task.id" class="moveBox" @click.stop>
                    <div class="moveLabel">Move position to:</div>
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

const props = defineProps({
  sections: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
});

const emit = defineEmits(["upsert", "delete", "move"]);

/** Tabs */
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

/** Close create/edit when switching tab */
watch(activeSectionId, () => {
  addingTask.value = false;
  closeAllMenus();
  cancelEdit();
});

/** Compact CREATE row state */
const addingTask = ref(false);
const addDraft = ref({ name: "", description: "", status: "", dueDate: "" });

function openCreateInTab() {
  addingTask.value = true;
  addDraft.value = {
    name: "",
    description: "",
    status: activeSectionTitle.value, // default to current tab
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

/** Menu */
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

/** Inline Edit row */
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
.tableCard {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
  color: #0f172a;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.tableHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}


.createBtn {
  border: none;
  background: #f97316;
  color: #fff;
  font-weight: 900;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 14px;
  padding: 8px 2px 12px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 10px;
  overflow-x: auto;
}
.tab {
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 800;
  cursor: pointer;
  padding: 8px 4px;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.tab.active {
  color: #f97316;
  border-bottom-color: #f97316;
}

/* Table */
.tableScroll {
  overflow: auto;
  height: 560px;
  border-radius: 12px;
}
.taskTable {
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
}
.taskTable th,
.taskTable td {
  padding: 12px 10px;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  vertical-align: middle;
}
.taskTable th {
  position: sticky;
  top: 0;
  background: #fff;
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

/* Compact row controls */
.inlineRow {
  background: #fff7ed;
}
.cellInput,
.cellSelect,
.cellDate {
  width: 100%;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #0f172a;
  padding: 6px 10px;
  outline: none;
}
.cellInput:focus,
.cellSelect:focus,
.cellDate:focus {
  border-color: #f97316;
}

.statusPill {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  font-weight: 800;
  font-size: 12px;
}

/* Row action buttons */
.rowActions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}
.btnPrimary {
  border: none;
  background: #f97316;
  color: #fff;
  font-weight: 900;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
}
.btnGhost {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #0f172a;
  font-weight: 900;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
}

/* Menu */
.actionCell {
  position: relative;
}
.dotsBtn {
  width: 36px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-weight: 900;
}
.menu {
  position: absolute;
  top: 40px;
  right: 0;
  width: 190px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  padding: 8px;
  z-index: 50;
}
.menuItem {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 10px 10px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 800;
  color: #0f172a;
}
.menuItem:hover {
  background: #f8fafc;
}
.menuItem.danger {
  color: #ef4444;
}
.menuItem.danger:hover {
  background: #fef2f2;
}

/* Move box */
.moveBox {
  margin-top: 8px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}
.moveLabel {
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
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 6px 10px;
  outline: none;
}
.moveBtn {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
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
  font-weight: 800;
}
</style>