<template>
  <el-card shadow="never" @click="closeAllMenus">
    <!-- Header -->
    <div style="margin-bottom: 16px">
      <el-button type="primary" @click.stop="openCreateInTab">
        + Create task
      </el-button>
    </div>

    <!-- Tabs -->
    <div
      @click.stop
      style="margin-bottom: 16px; display: flex; flex-direction: row; gap: 30px;"
    >
      <el-tabs v-model="activeSectionId" type="card">
        <el-tab-pane v-for="sec in sections" :key="sec.id" :name="sec.id">
          <template #label>
            <template v-if="editingSectionId !== sec.id">
              <el-space>
                <span>{{ sec.title }} ({{ (sec.tasks || []).length }})</span>

                <span @click.stop>
                  <el-button size="small" circle @click.stop="startEditSection(sec)">
                    <el-icon>
                      <Edit />
                    </el-icon>
                  </el-button>

                  <el-button
                    size="small"
                    type="danger"
                    circle
                    @click.stop="requestDeleteSection(sec)"
                  >
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </span>
              </el-space>
            </template>

            <template v-else>
              <el-space @click.stop>
                <el-form
                  :ref="setSectionEditFormRef"
                  :model="sectionEditForm"
                  :rules="sectionRules"
                  @submit.prevent
                >
                  <el-form-item prop="title" style="margin-bottom: 0">
                    <el-input
                      v-model.trim="sectionEditForm.title"
                      size="small"
                      style="width: 140px"
                      @keydown.enter.prevent="saveSectionEdit(sec.id)"
                      @keydown.esc.prevent="cancelSectionEdit"
                    />
                  </el-form-item>
                </el-form>

                <el-button
                  size="small"
                  type="success"
                  circle
                  @click.stop="saveSectionEdit(sec.id)"
                >
                  <el-icon>
                    <Check />
                  </el-icon>
                </el-button>

                <el-button size="small" circle @click.stop="cancelSectionEdit">
                  <el-icon>
                    <Close />
                  </el-icon>
                </el-button>
              </el-space>
            </template>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div>
        <template v-if="!addingSection">
          <el-button
            plain
            @click="openAddSection"
            style="
              width: 200px;
              height: 38px;
              border: 2px dashed #cbd5e1;
              font-weight: 800;
            "
          >
            + Add Section
          </el-button>
        </template>

        <template v-else>
          <el-space @click.stop>
            <el-form
              ref="sectionAddFormRef"
              :model="sectionAddForm"
              :rules="sectionRules"
              @submit.prevent
            >
              <el-form-item prop="title" style="margin-bottom: 0">
                <el-input
                  v-model.trim="sectionAddForm.title"
                  size="small"
                  style="width: 160px"
                  placeholder="Section name"
                  @keydown.enter.prevent="saveAddSection"
                  @keydown.esc.prevent="cancelAddSection"
                />
              </el-form-item>
            </el-form>

            <el-button size="small" type="success" circle @click.stop="saveAddSection">
              <el-icon>
                <Check />
              </el-icon>
            </el-button>

            <el-button size="small" circle @click.stop="cancelAddSection">
              <el-icon>
                <Close />
              </el-icon>
            </el-button>
          </el-space>
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
                placeholder="Due date" style="width: 100%" />
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

    <el-form
      ref="editTaskFormRef"
      :model="editDraft"
      :rules="taskRules"
      label-position="top"
      style="display: none"
    >
      <el-form-item prop="name" />
      <el-form-item prop="dueDate" />
    </el-form>

    <!-- Table -->
    <div @click.stop>
      <el-table :data="paginatedRows" style="width: 100%" height="520" empty-text="No tasks yet.">
        <el-table-column label="Task name" min-width="180">
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-input v-model.trim="editDraft.name" placeholder="Task name" @keydown.enter.prevent="saveEdit(row)"
              @keydown.esc.prevent="cancelEdit" />
              <div v-if="editTaskErrors.name" style="margin-top: 4px; color: #f56c6c; font-size: 12px">
                {{ editTaskErrors.name }}
              </div>
            </template>
            <template v-else>
              <strong>{{ row.task.name }}</strong>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="Description" min-width="220">
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-input v-model.trim="editDraft.description" placeholder="-" />
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
                <el-option v-for="opt in statusOptions" :key="opt" :label="opt" :value="opt" />
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
              <el-date-picker v-model="editDraft.dueDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" 
              placeholder="Due date" style="width: 100%" />
              <div v-if="editTaskErrors.dueDate" style="margin-top: 4px; color: #f56c6c; font-size: 12px">
                {{ editTaskErrors.dueDate }}
              </div>
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
                  <el-icon>
                    <MoreFilled />
                  </el-icon>
                </el-button>

                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">Edit</el-dropdown-item>
                    <el-dropdown-item command="interchange">
                      Interchange 
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      Delete
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <el-card v-if="moveOpenFor === row.task.id" shadow="never" style="margin-top: 8px" @click.stop>
                <el-space direction="vertical" fill>
                  <div><strong>Move position to:</strong></div>

                  <el-space>
                    <el-input-number v-model="moveTo" :min="1" :max="activeRows.length"
                      @keydown.enter.prevent="applyMove(row.sectionId, row.task.id)" />
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

    <!-- Pagination -->
    <div
      v-if="activeRows.length > 0"
      style="
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
      "
      @click.stop
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        background
        layout="total, sizes, prev, pager, next"
        :total="activeRows.length"
        :page-sizes="[5, 10, 20, 50]"
      />
    </div>
  </el-card>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import {
  Edit,
  Delete,
  Check,
  Close,
  MoreFilled,
} from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

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
    if (!activeSectionId.value && secs?.length) { activeSectionId.value = secs[0].id; }

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
  return (sec.tasks || []).map((task) => ({
    sectionId: sec.id,
    task,
  }));
});

/** PAGINATION */
const currentPage = ref(1);
const pageSize = ref(5);

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return activeRows.value.slice(start, end);
});

watch(activeSectionId, () => {
  currentPage.value = 1;
  addingTask.value = false;
  closeAllMenus();
  cancelEdit();
  cancelAddSection();
  cancelSectionEdit();
});

watch(pageSize, () => {
  currentPage.value = 1;
});

watch(
  activeRows,
  (rows) => {
    const maxPage = Math.max(1, Math.ceil(rows.length / pageSize.value));
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage;
    }
  },
  { immediate: true }
);

const createFormRef = ref(null);
const editTaskFormRef = ref(null);
const sectionEditFormRef = ref(null);

function setSectionEditFormRef(el) {
  if (el) {
    sectionEditFormRef.value = el;
  }
}
function normalizeTitle(title) {
  return (title || "").trim().toLowerCase();
}
const sectionAddFormRef = ref(null);

const taskRules = {
  name: [
    {
      required: true,
      message: "Please enter task name",
      trigger: "blur",
    },
    {
      min: 1,
      message: "Task name cannot be empty",
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

const sectionRules = {
  title: [
    {
      required: true,
      message: "Please enter section name",
      trigger: "blur",
    },
    {
      min: 2,
      message: "Section name must be at least 2 characters",
      trigger: "blur",
    },
    {
      validator: (_, value, callback) => {
        const normalized = normalizeTitle(value);

        const duplicate = props.sections.some((section) => {
          if (editingSectionId.value === section.id) return false;
          return normalizeTitle(section.title) === normalized;
        });

        if (duplicate) {
          callback(new Error("Section name already exists"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

/** section edit in tab */
const editingSectionId = ref(null);
const sectionEditForm = reactive({
  title: "",
});

function startEditSection(sec) {
  editingSectionId.value = sec.id;
  sectionEditForm.title = sec.title;
  closeAllMenus();
  cancelEdit();
  addingTask.value = false;

  setTimeout(() => {
    sectionEditFormRef.value?.clearValidate?.();
  });
}

function cancelSectionEdit() {
  editingSectionId.value = null;
  sectionEditForm.title = "";
  sectionEditFormRef.value?.clearValidate?.();
}

function saveSectionEdit(sectionId) {
  sectionEditFormRef.value?.validate((valid) => {
    if (!valid) return;

    emit("rename-section-requested", sectionId, sectionEditForm.title.trim());
    cancelSectionEdit();
  });
}

function requestDeleteSection(sec) {
  emit("delete-section-requested", sec.id);
}

/** create */
const addingTask = ref(false);
const addDraft = ref({
  name: "",
  description: "",
  status: "",
  dueDate: "",
});

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
const sectionAddForm = reactive({
  title: "",
});

function openAddSection() {
  addingSection.value = true;
  sectionAddForm.title = "";
  closeAllMenus();
  cancelEdit();
  cancelSectionEdit();
  addingTask.value = false;

  setTimeout(() => {
    sectionAddFormRef.value?.clearValidate?.();
  });
}

function cancelAddSection() {
  addingSection.value = false;
  sectionAddForm.title = "";
  sectionAddFormRef.value?.clearValidate?.();
}

function saveAddSection() {
  sectionAddFormRef.value?.validate((valid) => {
    if (!valid) return;

    emit("add-section-requested", sectionAddForm.title.trim());
    cancelAddSection();
  });
}

/** menu */
const menuOpenFor = ref(null);

function closeAllMenus() {
  menuOpenFor.value = null;
  closeMove();
}

/** Move (Interchange) */
const moveOpenFor = ref(null);
const moveTo = ref(1);

function toggleInterchange(taskId) {
  if (moveOpenFor.value === taskId) {
    return closeMove();
  }
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
const editDraft = reactive({
  name: "",
  description: "",
  status: "",
  dueDate: "",
});

const editTaskErrors = reactive({
  name: "",
  dueDate: "",
});

function keyOf(row) {
  return `${row.sectionId}:${row.task.id}`;
}

function isEditing(row) {
  return editingKey.value === keyOf(row);
}

function clearEditTaskErrors() {
  editTaskErrors.name = "";
  editTaskErrors.dueDate = "";
}

function syncEditTaskErrors() {
  const fields = editTaskFormRef.value?.fields || [];

  const nameField = fields.find((f) => f.prop === "name");
  const dueDateField = fields.find((f) => f.prop === "dueDate");

  editTaskErrors.name = nameField?.validateMessage || "";
  editTaskErrors.dueDate = dueDateField?.validateMessage || "";
}

function startEdit(row) {
  editingKey.value = keyOf(row);
  editDraft.name = row.task.name ?? "";
  editDraft.description = row.task.description ?? "";
  editDraft.status = row.task.status ?? activeSectionTitle.value;
  editDraft.dueDate = row.task.dueDate ?? "";

  addingTask.value = false;
  closeAllMenus();
  cancelSectionEdit();
  clearEditTaskErrors();

  setTimeout(() => {
    editTaskFormRef.value?.clearValidate?.();
  });
}

function cancelEdit() {
  editingKey.value = null;
  editDraft.name = "";
  editDraft.description = "";
  editDraft.status = "";
  editDraft.dueDate = "";
  clearEditTaskErrors();
  editTaskFormRef.value?.clearValidate?.();
}

function saveEdit(row) {
  editTaskFormRef.value?.validate((valid) => {
    syncEditTaskErrors();

    if (!valid) return;

    emit("upsert", {
      fromSectionId: row.sectionId,
      editingTaskId: row.task.id,
      task: {
        ...row.task,
        name: editDraft.name.trim(),
        description: (editDraft.description || "").trim(),
        status: editDraft.status,
        dueDate: editDraft.dueDate || null,
      },
    });

    cancelEdit();
  });
}

/** Delete task */
async function onDelete(sectionId, taskId) {
  const row = activeRows.value.find(
    (r) => r.sectionId === sectionId && r.task.id === taskId
  );
  if (!row) return;

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete the task "${row.task.name}"?`,
      "Delete Task",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );

    emit("delete", { sectionId, taskId });
    closeAllMenus();
    cancelEdit();
  } catch {
    // user cancelled
  }
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