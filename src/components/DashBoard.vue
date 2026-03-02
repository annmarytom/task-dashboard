<template>
  <div class="page">
    <section class="shell" @click="closeAllMenus">
      <!-- Header -->
      <header class="topbar">
        <div class="top-bar-left">
          <h1 class="title">Task Management</h1>

        </div>

        <!-- Toggle -->
        <div class="view-toggle" @click.stop>
          <button class="pill" :class="{ active: viewMode === 'table' }" type="button" @click="viewMode = 'table'">
            <span class="pill-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
              </svg>
            </span>
            Table View
          </button>

          <button class="pill" :class="{ active: viewMode === 'board' }" type="button" @click="viewMode = 'board'">
            <span class="pill-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
            </span>
            Board View
          </button>
        </div>
      </header>

      <div class="divider"></div>

      <!-- BOARD VIEW -->
      <div v-if="viewMode === 'board'" class="board-wrap">
        <div class="board-row">
          <article v-for="sec in sections" :key="sec.id" class="col">
            <div class="col-header">
              <!-- Inline edit title -->
              <div class="col-title">
                <template v-if="editingSectionId === sec.id">
                  <SectionInlineEditor v-model="newSectionTitle" placeholder="Section name"
                    @save="saveSectionEdit(sec.id)" @cancel="cancelSectionEdit" />
                </template>

                <template v-else>
                  <h2>{{ sec.title }}</h2>
                </template>
              </div>

              <!-- icons on the right -->
              <div class="col-header-actions" v-if="editingSectionId !== sec.id">
                <button class="icon-btn" type="button" title="Edit" @click.stop="startEditSection(sec.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>

                </button>
                <button class="icon-btn danger" type="button" title="Delete" @click.stop="deleteSection(sec.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>

                </button>
              </div>
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

          <!-- Add Section column -->
          <div class="addCol" @click.stop>
            <template v-if="addingSection">
              <SectionInlineEditor 
              v-model="newSectionTitle" 
              placeholder="Section name" 
              @save="saveNewSection"
              @cancel="cancelNewSection" 
              />
            </template>

            <template v-else>
              <button class="add-section-btn" type="button" @click="startAddSection">
                + Add Section
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- TABLE VIEW -->
      <div v-else class="table-wrap" @click.stop>
        <TaskTable 
        :sections="sections"
        :status-options="statusOptions" 
        @upsert="handleTaskUpsert"
        @delete="handleTaskDelete"
        @move="handleTaskMove" 
        @add-section-requested="saveNewSection"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { uniqueId } from "lodash";
import TaskList from "./TaskList.vue";
import SectionInlineEditor from "./SectionInlineEditor.vue";
import TaskTable from "./TaskTable.vue";

const sections = ref([
  { id: 1, title: "Todo", tasks: [] }
]);

const statusOptions = computed(() => sections.value.map((s) => s.title));

/** VIEW MODE */
const viewMode = ref("board"); // "board" | "table"

/** SECTION MENU */
const menuOpenFor = ref(null);
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

  // update tasks that were pointing to the old title
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
  // edit existing
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

  // add new
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
.page {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 10%, #ffd1e6 0%, #f6a8c7 45%, #f3a3c4 100%);
  padding: 26px;
}

.shell {
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
  padding: 22px;
  width: auto;
  margin: 0 auto;
}


.topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  padding: 6px 6px 12px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: #111827;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.view-toggle {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  cursor: pointer;
  font-weight: 800;
  color: #334155;
}

.pill-icon {
  font-size: 14px;
  opacity: 0.9;
  color: black;
  width: 20px;
  height: 20px;
}

.pill.active {
  background: #f97316;
  border-color: #f97316;
  color: #ffffff;
}

.divider {
  height: 1px;
  background: #eef2f7;
  margin: 10px 0 18px;
}


.board-wrap{
  padding: 6px;
}

.board-row {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 12px;
}

.col {
  flex: 0 0 340px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
}

.col-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.col-title h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: #111827;
}

.col-header-actions {
  display: flex;
  gap: 10px;
}

.icon-btn {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  cursor: pointer;
  font-weight: 900;
  color: #334155;
}

.icon-btn.danger {
  color: #ef4444;
}


.addCol {
  flex: 0 0 220px;

}

.add-section-btn {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font-weight: 900;
}

.table-wrap {
  padding: 6px;
}
</style>