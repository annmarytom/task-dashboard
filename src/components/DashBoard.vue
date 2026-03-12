<template>
  <div class="page">
    <section class="shell" @click="closeAllMenus">
      <!-- Header -->
      <header class="topbar">
        <div class="top-bar-left">
          <h1 class="title">Task Management</h1>
        </div> 

         <!-- Search -->
      <div class="search-bar" @click.stop>
        <el-input
          v-model.trim="searchTerm"
          placeholder="Search tasks by name, description, status, or due date"
          clearable
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

        <!-- Toggle -->
        <div class="view-toggle" @click.stop>
          <el-button
            class="pill"
            :type="viewMode === 'table' ? 'warning' : 'default'"
            :plain="viewMode !== 'table'"
            @click="viewMode = 'table'"
          >
            <el-icon class="pill-icon">
              <Operation />
            </el-icon>
            Table View
          </el-button>

          <el-button
            class="pill"
            :type="viewMode === 'board' ? 'warning' : 'default'"
            :plain="viewMode !== 'board'"
            @click="viewMode = 'board'"
          >
            <el-icon class="pill-icon">
              <Grid />
            </el-icon>
            Board View
          </el-button>
        </div>
      </header>

      <el-divider class="divider" />

      <!-- BOARD VIEW -->
      <div v-if="viewMode === 'board'" class="board-wrap">
        <div v-if="filteredSections.length" class="board-row">
          <el-card
            v-for="sec in filteredSections"
            :key="sec.id"
            class="col"
            shadow="never"
          >
            <div class="col-header">
              <!-- Inline edit title -->
              <div class="col-title">
                <template v-if="editingSectionId === sec.id">
                  <SectionInlineEditor
  v-model="newSectionTitle"
  placeholder="Section name"
  :existing-titles="sections
    .filter((s) => s.id !== sec.id)
    .map((s) => s.title)"
  @save="onRenameSection(sec.id, $event)"
  @cancel="cancelSectionEdit"
/>
                </template>

                <template v-else>
                  <h2>{{ sec.title }}</h2>
                </template>
              </div>

              <!-- icons on the right -->
              <div
                class="col-header-actions"
                v-if="editingSectionId !== sec.id"
              >
                <el-button
                  circle
                  size="small"
                  class="icon-btn"
                  title="Edit"
                  @click.stop="startEditSection(sec.id)"
                >
                  <el-icon>
                    <Edit />
                  </el-icon>
                </el-button>

                <el-button
                  circle
                  size="small"
                  class="icon-btn danger"
                  title="Delete"
                  @click.stop="requestDeleteSection(sec.id)"
                >
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
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
          </el-card>

          <!-- Add Section column -->
          <div class="addCol" @click.stop>
            <template v-if="addingSection">
              <SectionInlineEditor
  v-model="newSectionTitle"
  placeholder="Section name"
  :existing-titles="sections.map((s) => s.title)"
  @save="onAddSection"
  @cancel="cancelNewSection"
/>
            </template>

            <template v-else>
              <el-button
                class="add-section-btn"
                type="default"
                @click="startAddSection"
              >
                <el-icon>
                  <Plus />
                </el-icon>
                Add Section
              </el-button>
            </template>
          </div>
        </div>

        <el-empty
          v-else
          description="No tasks match your search"
        />
      </div>

      <!-- TABLE VIEW -->
      <div v-else class="table-wrap" @click.stop>
        <TaskTable
          :sections="filteredSections"
          :status-options="statusOptions"
          @upsert="handleTaskUpsert"
          @delete="handleTaskDelete"
          @move="handleTaskMove"
          @add-section-requested="onAddSection"
          @rename-section-requested="onRenameSection"
          @delete-section-requested="requestDeleteSection"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Grid,
  Operation,
  Edit,
  Delete,
  Plus,
  Search,
} from "@element-plus/icons-vue";
import { useTaskStore } from "@/stores/taskStore";

import TaskList from "./TaskList.vue";
import SectionInlineEditor from "./SectionInlineEditor.vue";
import TaskTable from "./TaskTable.vue";

const taskStore = useTaskStore();

// store refs
const { sections, snack } = storeToRefs(taskStore);

// status options
const statusOptions = computed(() => taskStore.statusOptions);

const viewMode = ref("board");
const searchTerm = ref("");

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

function onAddSection(title) {
  try {
    taskStore.addSection(title);
    addingSection.value = false;
    newSectionTitle.value = "";
  } catch (error) {
    ElMessage.error(error.message || "Unable to add section");
  }
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

function onRenameSection(sectionId, title) {
  try {
    taskStore.renameSection(sectionId, title);
    editingSectionId.value = null;
    newSectionTitle.value = "";
  } catch (error) {
    ElMessage.error(error.message || "Unable to rename section");
  }
}

async function requestDeleteSection(sectionId) {
  const sec = sections.value.find((s) => s.id === sectionId);
  if (!sec) return;

  try {
    await ElMessageBox.confirm(
  `All tasks in this section will be moved to "${"Unknown Tasks"}".`,
  `Delete section "${sec.title}"?`,
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );

    taskStore.deleteSection(sectionId);

    if (editingSectionId.value === sectionId) {
      cancelSectionEdit();
    }

    closeAllMenus();
  } catch {
    // user cancelled
  }
}

/** SEARCH FILTER */
const filteredSections = computed(() => {
  const q = (searchTerm.value || "").trim().toLowerCase();

  if (!q) {
    return sections.value;
  }

  return sections.value
    .map((section) => {
      const filteredTasks = (section.tasks || []).filter((task) => {
        const haystack = [
          task.name,
          task.description,
          task.status,
          task.dueDate,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      });

      return {
        ...section,
        tasks: filteredTasks,
      };
    })
    .filter((section) => section.tasks.length > 0);
});

/** TASK HANDLERS -> call store */
function handleTaskUpsert(payload) {
  taskStore.upsertTask(payload);
}

function handleTaskDelete(payload) {
  taskStore.deleteTask(payload);
  closeAllMenus();
}

function handleTaskMove(payload) {
  taskStore.moveTask(payload);
}

/** SNACKBAR -> Element Plus Message */
watch(
  () => snack.value.open,
  (isOpen) => {
    if (!isOpen) return;

    ElMessage({
      type: "success",
      message: snack.value.message,
      duration: snack.value.duration,
      onClose: () => {
        taskStore.closeSnack();
      },
    });
  }
);
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

.view-toggle {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
}

.pill-icon {
  font-size: 16px;
}

.search-bar {
  margin: 6px 6px 14px;
  max-width: 420px;
}

.divider {
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
  border-radius: 14px;
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
  border: 1px solid #e5e7eb;
}

.icon-btn.danger {
  color: #ef4444;
}

.addCol {
  flex: 0 0 220px;
}

.add-section-btn {
  width: 100%;
  border: 2px dashed #cbd5e1;
  font-weight: 800;
}

.table-wrap {
  padding: 6px;
}
</style>