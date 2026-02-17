<template>
    <section class="dashboard" @click="closeAllMenus">
        <header class="dashboard-header">
            <h1 class="dashboard-title">Task Dashboard</h1>
        </header>

        <div class="board">
            <div class="board-row">
                <!-- Sections -->
                <article v-for="sec in sections" :key="sec.id" class="section">
                    <div class="section-top">
                        <h2 class="section-title">{{ sec.title }}</h2>

                        <MenuPopUp :open="menuOpenFor === sec.id" @toggle="toggleMenu(sec.id)"
                            @edit="editSection(sec.id)" @delete="deleteSection(sec.id)" />
                    </div>

                    <button class="btn btn--add" @click="showAddTaskModal(sec.id)">
                        + Add Task
                    </button>

                    <div class="task-list">
                        <div v-for="t in sec.tasks" :key="t.id" class="task-card">
                            <div class="task-title">{{ t.name }}</div>
                            <div class="task-desc" v-if="t.description">{{ t.description }}</div>

                            <div class="task-meta">
                                <span>{{ t.status }}</span>
                                <span v-if="t.dueDate">{{ t.dueDate }}</span>
                            </div>

                            <div class="task-actions">
                                <button class="action-btn" @click="deleteTask(sec.id, t.id)">
                                    <!-- delete icon -->
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>

                                <button class="action-btn" @click="openEditTaskModal(sec.id, t.id)">
                                    <!-- edit icon -->
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- Add Task Modal -->
                    <AddTask v-if="AddTaskModalOpen && activeSectionId == sec.id" :status-options="statusOptions"
                        :default-status="defaultStatusForActiveSection" :initial-task="editingTask"
                        @close="closeTaskModal" @save="upsertTask" />
                </article>

                <!-- Add Section button -->
                <div class="addSection">
                    <button class="btn btn--primary" @click="openAddSectionModal">
                        Add Section
                    </button>
                </div>

                <!-- Add/Edit Section Modal -->
                <div v-if="modalOpen" class="backdrop" @click="closeModal">
                    <div class="modal" @click.stop>
                        <div class="modal-header">
                            <h3 class="modal-title">{{ editingSectionId ? "Edit Section" : "Add Section" }}</h3>
                            <button class="iconBtn" @click="closeModal">✕</button>
                        </div>

                        <div class="form">
                            <label class="field">
                                <span class="field-label">Section Name</span>
                                <input class="input" type="text" placeholder="Eg: In Progress"
                                    v-model.trim="newSectionTitle" />
                            </label>

                            <div class="actions">
                                <button class="btn" @click="closeModal" type="button">Cancel</button>
                                <button class="btn btn--primary" type="button" @click="saveSection">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, ref } from "vue";
import AddTask from "./AddTask.vue";
import { uniqueId } from "lodash";
import MenuPopUp from "./MenuPopUp.vue";

const sections = ref([{ id: 1, title: "Todo", tasks: [] }]);

const statusOptions = computed(() => sections.value.map(s => s.title));

const activeSectionId = ref(null);
const AddTaskModalOpen = ref(false);

//  edit context
const editingTaskSectionId = ref(null);
const editingTaskId = ref(null);

const editingTask = computed(() => {
    if (!editingTaskSectionId.value || !editingTaskId.value) return null;

    const sec = sections.value.find(s => s.id === editingTaskSectionId.value);
    if (!sec) return null;

    const t = sec.tasks.find(x => x.id === editingTaskId.value);
    return t ? { ...t } : null;
});

const defaultStatusForActiveSection = computed(() => {
    const sec = sections.value.find(s => s.id === activeSectionId.value);
    return sec?.title || statusOptions.value[0] || "Todo";
});

const newSectionTitle = ref("");
const modalOpen = ref(false);


/** SECTION MENU */
const menuOpenFor = ref(null);
const editingSectionId = ref(null);
function toggleMenu(sectionId) {
    menuOpenFor.value = menuOpenFor.value === sectionId ? null : sectionId;
}
function closeAllMenus() {
    menuOpenFor.value = null;
}

/**  TASKS */
function showAddTaskModal(sectionId) {
    // add mode
    activeSectionId.value = sectionId;
    editingTaskSectionId.value = null;
    editingTaskId.value = null;

    AddTaskModalOpen.value = true;
}

function openEditTaskModal(sectionId, taskId) {
    // edit mode
    activeSectionId.value = sectionId; // useful fallback
    editingTaskSectionId.value = sectionId;
    editingTaskId.value = taskId;

    AddTaskModalOpen.value = true;
}

function closeTaskModal() {
    AddTaskModalOpen.value = false;
    activeSectionId.value = null;
    editingTaskSectionId.value = null;
    editingTaskId.value = null;
}

function upsertTask(task) {
    // if we are editing an existing task
    if (editingTaskSectionId.value && editingTaskId.value) {
        const fromSec = sections.value.find(s => s.id === editingTaskSectionId.value);
        if (!fromSec) return;

        const idx = fromSec.tasks.findIndex(t => t.id === editingTaskId.value);
        if (idx === -1) return;

        // If status changed, move task to the section matching that status
        const toSec = sections.value.find(s => s.title === task.status);
        console.log(toSec);

        // Update the task in-place (keep same id)
        const updated = { ...fromSec.tasks[idx], ...task, id: editingTaskId.value };

        console.log(updated);

        if (toSec && toSec.id !== fromSec.id) {
            // remove from old section
            fromSec.tasks.splice(idx, 1);
            // add to new section
            toSec.tasks.push(updated);
        } else {
            // same section (or unknown status), just replace
            fromSec.tasks[idx] = updated;
        }

        closeTaskModal();
        return;
    }

    // otherwise, add new
    const sec = sections.value.find(s => s.title === task.status);
    if (!sec) return;

    sec.tasks.push(task);
    closeTaskModal();
}

function deleteTask(sectionId, taskId) {
    const sec = sections.value.find(s => s.id === sectionId);
    if (!sec) return;

    const idx = sec.tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return;

    sec.tasks.splice(idx, 1);

    // if the task being deleted is currently open in edit modal, close it
    if (editingTaskSectionId.value === sectionId && editingTaskId.value === taskId) {
        closeTaskModal();
    }

    closeAllMenus();
}


/** ADD/EDIT SECTION MODAL */
function openAddSectionModal() {
    editingSectionId.value = null;
    modalOpen.value = true;
    newSectionTitle.value = "";
    closeAllMenus();
}

function editSection(sectionId) {
    const sec = sections.value.find(s => s.id === sectionId);
    if (!sec) return;

    editingSectionId.value = sectionId;
    newSectionTitle.value = sec.title;
    modalOpen.value = true;
    closeAllMenus();
}

function deleteSection(sectionId) {
    const secToDelete = sections.value.find(s => s.id === sectionId);
    const deletedTitle = secToDelete?.title;

    sections.value = sections.value.filter(s => s.id !== sectionId);

    if (editingSectionId.value === sectionId) {
        editingSectionId.value = null;
        newSectionTitle.value = "";
        modalOpen.value = false;
    }

    if (deletedTitle) {
        const fallback = sections.value[0]?.title || "Todo";
        sections.value.forEach(s => {
            s.tasks.forEach(t => {
                if (t.status === deletedTitle) t.status = fallback;
            });
        });
    }

    closeAllMenus();
}

function closeModal() {
    modalOpen.value = false;
    editingSectionId.value = null;
    newSectionTitle.value = "";
}

function saveSection() {
    const title = newSectionTitle.value.trim();
    if (!title) return;

    if (editingSectionId.value) {
        const sec = sections.value.find(s => s.id === editingSectionId.value);
        if (!sec) return;

        const oldTitle = sec.title;
        sec.title = title;

        sec.tasks.forEach(t => {
            if (t.status === oldTitle) t.status = title;
        });

        closeModal();
        return;
    }

    sections.value.push({
        id: uniqueId("section_"),
        title,
        tasks: []
    });
    closeModal();
}
</script>


<style scoped>
.dashboard {
    position: relative;
    min-height: 100vh;
    background: #f4f5f7;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    color: #e5e7eb;
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

.dashboard-title {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.2px;
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
    background: #263d70;
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
    color: #e5e7eb;
    padding: 10px 14px;
    border-radius: 12px;
    cursor: pointer;
}

.btn--add {
    width: fit-content;
    border: 2px solid rgba(204, 206, 206, 0.55);
    background: transparent;
}

.btn--primary {
    border: 2px solid rgba(204, 206, 206, 0.55);
    background: #263d70;
    font-weight: 700;
}

.iconBtn {
    border: none;
    background: transparent;
    color: #e5e7eb;
    font-size: 18px;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 10px;
}

.iconBtn:hover {
    background: rgba(255, 255, 255, 0.08);
}

.addSection {
    flex: 0 0 auto;
    padding-top: 6px;
}

.backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 18px;
    background: rgba(0, 0, 0, 0.35);
    z-index: 50;
}

.modal {
    width: 600px;
    max-width: 100%;
    background: #263d70;
    border: 2px solid rgba(204, 206, 206, 0.55);
    border-radius: 16px;
    padding: 16px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}

.modal-title {
    font-size: 18px;
    font-weight: 800;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field-label {
    font-size: 13px;
    color: rgba(229, 231, 235, 0.8);
}

.input {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: #e5e7eb;
    padding: 10px 12px;
    border-radius: 12px;
    outline: none;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

/* tasks */
.task-card {
    border: 3px solid white;
    border-radius: 10px;
    padding: 8px;
    margin-top: 10px;
}

.task-title {
    font-size: 16px;
    font-weight: 700;
}

.task-meta {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.task-actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.action-btn {
    width: 30px;
    height: 30px;
    padding: 5px;
    border: none;
    background-color: #263d70;
    color: white;
}

.action-btn:hover {
    cursor: pointer;
}
</style>