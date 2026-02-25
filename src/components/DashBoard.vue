<template>
  <section class="dashboard" @click="closeAllMenus">
    <header class="dashboard-header">
      <div class="headerRow">
        <h1 class="dashboard-title">Task Dashboard</h1>

        <!-- Toggle -->
        <div class="viewToggle" @click.stop>
          <button
            class="toggleBtn"
            :class="{ active: viewMode === 'board' }"
            type="button"
            @click="viewMode = 'board'"
          >
            Board
          </button>

          <button
            class="toggleBtn"
            :class="{ active: viewMode === 'table' }"
            type="button"
            @click="viewMode = 'table'"
          >
            Table
          </button>
        </div>
      </div>
    </header>

    <!-- BOARD VIEW -->
    <div v-if="viewMode === 'board'" class="board">
      <div class="board-row">
        <!-- Sections -->
        <article v-for="sec in sections" :key="sec.id" class="section">
          <div class="section-top">
            <!-- INLINE EDIT TITLE  -->
            <div class="sectionTitleWrap">
              <template v-if="editingSectionId === sec.id">
                <SectionInlineEditor
                  v-model="newSectionTitle"
                  placeholder="Section name"
                  @save="saveSectionEdit(sec.id)"
                  @cancel="cancelSectionEdit"
                />
              </template>

              <template v-else>
                <h2 class="section-title">{{ sec.title }}</h2>
              </template>
            </div>

            <!-- Menu only when not editing -->
            <MenuPopUp
              v-if="editingSectionId !== sec.id"
              :open="menuOpenFor === sec.id"
              @toggle="toggleMenu(sec.id)"
              @edit="startEditSection(sec.id)"
              @delete="deleteSection(sec.id)"
            />
          </div>

          <!-- TaskList  -->
          <TaskList
            :section-id="sec.id"
            :section-title="sec.title"
            :tasks="sec.tasks"
            :status-options="statusOptions"
            :default-status="sec.title"
            @upsert="handleTaskUpsert"
            @delete="handleTaskDelete"
            @move="handleTaskMove"
          />
        </article>

        <!-- Add Section area -->
        <div class="addSection" @click.stop>
          <template v-if="addingSection">
            <SectionInlineEditor
              v-model="newSectionTitle"
              placeholder="Section name"
              @save="saveNewSection"
              @cancel="cancelNewSection"
            />
          </template>

          <template v-else>
            <button class="btn btn--primary" @click="startAddSection">
              Add Section
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- TABLE VIEW -->
    <div v-else class="tableView" @click.stop>
      <TaskTable
        :sections="sections"
        :status-options="statusOptions"
        @upsert="handleTaskUpsert"
        @delete="handleTaskDelete"
        @move="handleTaskMove"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { uniqueId } from "lodash";
import MenuPopUp from "./MenuPopUp.vue";
import TaskList from "./TaskList.vue";
import SectionInlineEditor from "./SectionInlineEditor.vue";
import TaskTable from "./TaskTable.vue";

const sections = ref([{ id: 1, title: "Todo", tasks: [] }]);
const statusOptions = computed(() => sections.value.map((s) => s.title));

/** VIEW MODE */
const viewMode = ref("board"); // "board" | "table"

/** SECTION MENU */
const menuOpenFor = ref(null);
function toggleMenu(sectionId) {
  menuOpenFor.value = menuOpenFor.value === sectionId ? null : sectionId;
}
function closeAllMenus() {
  menuOpenFor.value = null;
}

/** ADD/EDIT SECTION INLINE STATE */
const addingSection = ref(false);
const editingSectionId = ref(null);
const newSectionTitle = ref("");

function startAddSection() {
  addingSection.value = true;
  editingSectionId.value = null;
  newSectionTitle.value = "";
  closeAllMenus();
}

function cancelNewSection() {
  addingSection.value = false;
  newSectionTitle.value = "";
}

function saveNewSection(title) {
  sections.value.push({
    id: uniqueId("section_"),
    title,
    tasks: [],
  });
  addingSection.value = false;
  newSectionTitle.value = "";
}

function startEditSection(sectionId) {
  const sec = sections.value.find((s) => s.id === sectionId);
  if (!sec) return;

  editingSectionId.value = sectionId;
  addingSection.value = false;
  newSectionTitle.value = sec.title;
  closeAllMenus();
}

function cancelSectionEdit() {
  editingSectionId.value = null;
  newSectionTitle.value = "";
}

function saveSectionEdit(sectionId) {
  const title = newSectionTitle.value.trim();
  if (!title) return;

  const sec = sections.value.find((s) => s.id === sectionId);
  if (!sec) return;

  const oldTitle = sec.title;
  sec.title = title;

  sec.tasks.forEach((t) => {
    if (t.status === oldTitle) t.status = title;
  });

  editingSectionId.value = null;
  newSectionTitle.value = "";
}

function deleteSection(sectionId) {
  const secToDelete = sections.value.find((s) => s.id === sectionId);
  const deletedTitle = secToDelete?.title;

  sections.value = sections.value.filter((s) => s.id !== sectionId);

  if (editingSectionId.value === sectionId) cancelSectionEdit();

  if (deletedTitle) {
    const fallback = sections.value[0]?.title || "Todo";
    sections.value.forEach((s) => {
      s.tasks.forEach((t) => {
        if (t.status === deletedTitle) t.status = fallback;
      });
    });
  }

  closeAllMenus();
}

/** TASK HANDLERS */
function handleTaskUpsert({ fromSectionId, editingTaskId, task }) {
  if (editingTaskId) {
    const fromSec = sections.value.find((s) => s.id === fromSectionId);
    if (!fromSec) return;

    const idx = fromSec.tasks.findIndex((t) => t.id === editingTaskId);
    if (idx === -1) return;

    const updated = { ...fromSec.tasks[idx], ...task, id: editingTaskId };
    const toSec = sections.value.find((s) => s.title === updated.status);

    if (toSec && toSec.id !== fromSec.id) {
      fromSec.tasks.splice(idx, 1);
      toSec.tasks.push(updated);
    } else {
      fromSec.tasks[idx] = updated;
    }
    return;
  }

  const sec = sections.value.find((s) => s.title === task.status);
  if (!sec) return;
  sec.tasks.push(task);
}

function handleTaskDelete({ sectionId, taskId }) {
  const sec = sections.value.find((s) => s.id === sectionId);
  if (!sec) return;

  const idx = sec.tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return;

  sec.tasks.splice(idx, 1);
  closeAllMenus();
}

function handleTaskMove({ sectionId, taskId, newIndex }) {
  const sec = sections.value.find((s) => s.id === sectionId);
  if (!sec) return;

  const fromIndex = sec.tasks.findIndex((t) => t.id === taskId);
  if (fromIndex === -1) return;

  if (newIndex === fromIndex) return;

  const [task] = sec.tasks.splice(fromIndex, 1);
  sec.tasks.splice(newIndex, 0, task);
}
</script>

<style scoped>
.dashboard {
  position: relative;
  min-height: 100vh;
  background: #f4f5f7;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: black;
  border: 1px solid gray;
  border-radius: 10px;
  margin: 20px;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  margin-bottom: 18px;
  background-color: #263d70;
  height: 70px;
  padding: 20px;
}

.headerRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dashboard-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: white;
}

.viewToggle {
  display: inline-flex;
  gap: 8px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
}

.toggleBtn {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: transparent;
  color: black;
  cursor: pointer;
  font-weight: 600;
}

.toggleBtn.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.35);
}

.board-row {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  overflow-x: auto;
  padding: 10px;
  height: 540px;
}

.section {
  width: 335px;
  flex: 0 0 auto;
  background: white;
  border: 2px solid rgba(45, 212, 191, 0.55);
  border-radius: 18px;
  padding: 14px;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.btn {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: black;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
}

.btn--primary {
  border: 2px solid rgba(204, 206, 206, 0.55);
  background: #f97316;
  font-weight: 700;
}

.addSection {
  flex: 0 0 auto;
}
.sectionTitleWrap {
  flex: 1;
  margin-right: 10px;
}

/* Table container */
.tableView {
  padding: 10px;
}
</style>