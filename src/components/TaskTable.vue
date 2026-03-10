<template>
  <el-card shadow="never" @click="closeAllMenus">
    <!-- Header -->
    <div style="margin-bottom: 16px">
      <el-button type="primary" @click.stop="openCreateInTab">
        + Create task
      </el-button>
    </div>

    <!-- Tabs -->
    <div @click.stop style="margin-bottom: 16px">
      <el-tabs v-model="activeSectionId" type="card">
        <el-tab-pane
          v-for="sec in sections"
          :key="sec.id"
          :name="sec.id"
        >
          <template #label>
            <template v-if="editingSectionId !== sec.id">
              <el-space>
                <span>{{ sec.title }} ({{ (sec.tasks || []).length }})</span>

                <span @click.stop>
                  <el-button
                    size="small"
                    circle
                    @click.stop="startEditSection(sec)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>

                  <el-button
                    size="small"
                    type="danger"
                    circle
                    @click.stop="requestDeleteSection(sec)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </span>
              </el-space>
            </template>

            <template v-else>
              <el-space @click.stop>
                <el-input
                  v-model.trim="editSectionTitle"
                  size="small"
                  style="width: 140px"
                  @keydown.enter.prevent="saveSectionEdit(sec.id)"
                  @keydown.esc.prevent="cancelSectionEdit"
                />

                <el-button
                  size="small"
                  type="success"
                  circle
                  @click.stop="saveSectionEdit(sec.id)"
                >
                  <el-icon><Check /></el-icon>
                </el-button>

                <el-button
                  size="small"
                  circle
                  @click.stop="cancelSectionEdit"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </el-space>
            </template>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div style="margin-top: 12px">
        <template v-if="!addingSection">
          <el-button plain @click="openAddSection">
            + Add Section
          </el-button>
        </template>

        <template v-else>
          <div style="max-width: 320px">
            <SectionInlineEditor
              v-model="newSectionTitle"
              placeholder="Section name"
              @save="saveAddSection"
              @cancel="cancelAddSection"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Create row -->
    <el-card v-if="addingTask" shadow="never" style="margin-bottom: 16px">
      <el-form
        ref="createFormRef"
        :model="addDraft"
        :rules="taskRules"
        label-position="top"
        @submit.prevent="saveCreate"
      >
        <el-row :gutter="12">
          <el-col :span="5">
            <el-form-item prop="name" label="Task name">
              <el-input
                v-model.trim="addDraft.name"
                placeholder="Task name *"
                @keydown.enter.prevent="saveCreate"
              />
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item label="Description">
              <el-input
                v-model.trim="addDraft.description"
                placeholder="Description"
                @keydown.enter.prevent="saveCreate"
              />
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item label="Status">
              <el-select v-model="addDraft.status" style="width: 100%">
                <el-option
                  v-for="opt in statusOptions"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item prop="dueDate" label="Due date">
              <el-date-picker
                v-model="addDraft.dueDate"
                type="date"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                placeholder="Due date"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item label=" ">
              <el-space>
                <el-button type="primary" @click="saveCreate">Add</el-button>
                <el-button @click="closeCreate">Cancel</el-button>
              </el-space>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- Table -->
    <div @click.stop>
      <el-table
        :data="activeRows"
        style="width: 100%"
        height="520"
        empty-text="No tasks yet."
      >
        <el-table-column label="Task name" min-width="180">
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-form
                ref="editFormRef"
                :model="editDraft"
                :rules="taskRules"
                label-position="top"
                @submit.prevent="saveEdit(row)"
              >
                <el-form-item prop="name" style="margin-bottom: 0">
                  <el-input v-model.trim="editDraft.name" />
                </el-form-item>
              </el-form>
            </template>
            <template v-else>
              <strong>{{ row.task.name }}</strong>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="Description" min-width="220">
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-input
                v-model.trim="editDraft.description"
                placeholder="-"
              />
            </template>
            <template v-else>
              {{ row.task.description || "-" }}
            </template>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="180">
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-select v-model="editDraft.status" style="width: 100%">
                <el-option
                  v-for="opt in statusOptions"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </el-select>
            </template>
            <template v-else>
              <el-tag>{{ row.task.status }}</el-tag>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="Due date" width="160">
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-form
                :model="editDraft"
                :rules="taskRules"
                label-position="top"
              >
                <el-form-item prop="dueDate" style="margin-bottom: 0">
                  <el-date-picker
                    v-model="editDraft.dueDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    format="YYYY-MM-DD"
                    placeholder="Due date"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-form>
            </template>
            <template v-else>
              {{ row.task.dueDate || "-" }}
            </template>
          </template>
        </el-table-column>

        <el-table-column label="Action" width="220">
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-space>
                <el-button type="primary" @click="saveEdit(row)">Save</el-button>
                <el-button @click="cancelEdit">Cancel</el-button>
              </el-space>
            </template>

            <template v-else>
              <el-dropdown trigger="click" @command="(cmd) => handleRowCommand(cmd, row)">
                <el-button circle @click.stop>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>

                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">Edit</el-dropdown-item>
                    <el-dropdown-item command="interchange">Interchange</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      Delete
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <el-card
                v-if="moveOpenFor === row.task.id"
                shadow="never"
                style="margin-top: 8px"
                @click.stop
              >
                <el-space direction="vertical" fill>
                  <div><strong>Move position to:</strong></div>

                  <el-space>
                    <el-input-number
                      v-model="moveTo"
                      :min="1"
                      :max="activeRows.length"
                      @keydown.enter.prevent="applyMove(row.sectionId, row.task.id)"
                    />
                    <el-button @click="applyMove(row.sectionId, row.task.id)">
                      Move
                    </el-button>
                  </el-space>

                  <div style="font-size: 12px; color: #909399">
                    1 = top, {{ activeRows.length }} = bottom
                  </div>
                </el-space>
              </el-card>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import {
  Edit,
  Delete,
  Check,
  Close,
  MoreFilled,
} from "@element-plus/icons-vue";
import SectionInlineEditor from "./SectionInlineEditor.vue";

const props = defineProps({
  sections: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "upsert",
  "delete",
  "move",
  "add-section-requested",
  "rename-section-requested",
  "delete-section-requested",
]);

const activeSectionId = ref(null);

watch(
  () => props.sections,
  (secs) => {
    if (!activeSectionId.value && secs?.length) activeSectionId.value = secs[0].id;

    if (
      activeSectionId.value &&
      !secs.some((s) => s.id === activeSectionId.value)
    ) {
      activeSectionId.value = secs[0]?.id ?? null;
    }
  },
  { immediate: true, deep: true }
);

const activeSection = computed(() =>
  props.sections.find((s) => s.id === activeSectionId.value)
);
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
  cancelSectionEdit();
});


const createFormRef = ref(null);
const editFormRef = ref(null);

const taskRules = {
  name: [
    {
      required: true,
      message: "Please enter task name",
      trigger: "blur",
    },
  ],
  dueDate: [
    {
      required: true,
      message: "Please select due date",
      trigger: "change",
    },
  ],
};

/** section edit in tab */
const editingSectionId = ref(null);
const editSectionTitle = ref("");

function startEditSection(sec) {
  editingSectionId.value = sec.id;
  editSectionTitle.value = sec.title;
  closeAllMenus();
  cancelEdit();
  addingTask.value = false;
}

function cancelSectionEdit() {
  editingSectionId.value = null;
  editSectionTitle.value = "";
}

function saveSectionEdit(sectionId) {
  const v = (editSectionTitle.value || "").trim();
  if (!v) return;
  emit("rename-section-requested", sectionId, v);
  cancelSectionEdit();
}

function requestDeleteSection(sec) {
  emit("delete-section-requested", sec.id);
}

/** create */
const addingTask = ref(false);
const addDraft = ref({ name: "", description: "", status: "", dueDate: "" });

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
  cancelSectionEdit();

  setTimeout(() => {
    createFormRef.value?.clearValidate?.();
  });
}

function closeCreate() {
  addingTask.value = false;
  addDraft.value = { name: "", description: "", status: "", dueDate: "" };
  createFormRef.value?.clearValidate?.();
}

function saveCreate() {
  createFormRef.value?.validate((valid) => {
    if (!valid) return;

    const task = {
      id: Date.now(),
      name: (addDraft.value.name || "").trim(),
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
  });
}

/** add section */
const addingSection = ref(false);
const newSectionTitle = ref("");

function openAddSection() {
  addingSection.value = true;
  newSectionTitle.value = "";
  closeAllMenus();
  cancelEdit();
  cancelSectionEdit();
  addingTask.value = false;
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

/** edit row */
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
  cancelSectionEdit();

  setTimeout(() => {
    editFormRef.value?.clearValidate?.();
  });
}

function cancelEdit() {
  editingKey.value = null;
  editDraft.value = { name: "", description: "", status: "", dueDate: "" };
  editFormRef.value?.clearValidate?.();
}

function saveEdit(row) {
  editFormRef.value?.validate((valid) => {
    if (!valid) return;

    emit("upsert", {
      fromSectionId: row.sectionId,
      editingTaskId: row.task.id,
      task: {
        ...row.task,
        name: (editDraft.value.name || "").trim(),
        description: (editDraft.value.description || "").trim(),
        status: editDraft.value.status,
        dueDate: editDraft.value.dueDate || null,
      },
    });

    cancelEdit();
  });
}

/** Delete task */
function onDelete(sectionId, taskId) {
  emit("delete", { sectionId, taskId });
  closeAllMenus();
  cancelEdit();
}

function handleRowCommand(command, row) {
  if (command === "edit") {
    startEdit(row);
  } else if (command === "interchange") {
    toggleInterchange(row.task.id);
  } else if (command === "delete") {
    onDelete(row.sectionId, row.task.id);
  }
}
</script>