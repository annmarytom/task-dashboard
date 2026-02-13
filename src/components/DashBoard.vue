<template>
    <section class="dashboard">
        <header class="dashboard-header">
            <h1 class="dashboard-title">Task Dashboard</h1>
        </header>

        <div class="board">
            <div class="board-row">
                <!-- Sections -->
                <article v-for="sec in sections" :key="sec.id" class="section">
                    <div class="section-top">
                        <h2 class="section-title">{{ sec.title }}</h2>
                        <button class="iconBtn" aria-label="Menu">⋯</button>
                    </div>

                    <button class="btn btn--add" @click="showAddTaskModal(sec.id)">
                        + Add Task
                    </button>
                    <div class="task-list">
                        <div v-for="t in sec.tasks" :key="t.id" class="task-card">
                            <div class="task-title">{{ t.name }}</div>
                            <div class="task-desc" v-if="t.description">{{ t.description }}</div>
                            <div class="task-meta">
                                <span> {{ t.status }}</span>
                                <span v-if="t.dueDate">{{ t.dueDate }}</span>
                            </div>
                            <div class="task-actions">
                                <button class="action-btn" @click="deleteTask(sec.id, t.id)">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>

                                </button>

                                <button  class="action-btn" ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>

                <!-- Add Section button -->
                <div class="addSection">
                    <button class="btn btn--primary" @click="openAddSectionModal">
                        Add Section
                    </button>
                </div>

                <!-- Modal -->
                <div v-if="modalOpen" class="backdrop" @click="closeModal">
                    <div class="modal" @click.stop>
                        <div class="modal-header">
                            <h3 class="modal-title">Add Section</h3>
                            <button class="iconBtn" @click="closeModal">✕</button>
                        </div>

                        <div class="form">
                            <label class="field">
                                <span class="field-label">Section Name</span>
                                <input class="input" type="text" placeholder="Eg: In Progress"
                                    v-model.trim="newSectionTitle" />
                            </label>

                            <div class="actions">
                                <button class="btn" @click="closeModal" type="button">
                                    Cancel
                                </button>
                                <button class="btn btn--primary" type="button" @click="saveSection">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="add-task-modal">
                    <AddTask v-if="AddTaskModalOpen" @close="AddTaskModalOpen = false" @save="addTaskToSection">
                    </AddTask>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref } from "vue";
import AddTask from "./AddTask.vue";

const sections = ref([{ id: 1, title: "Todo", tasks: [] }]);
const newSectionTitle = ref("");
const modalOpen = ref(false);
const AddTaskModalOpen = ref(false);
let nextSectionId = 2;
const activeSectionId = ref(null);

function showAddTaskModal(sectionId) {
    activeSectionId.value = sectionId;
    AddTaskModalOpen.value = true;
}

function addTaskToSection(task) {
    const sec = sections.value.find(s => s.id === activeSectionId.value);
    if (!sec) return;

    sec.tasks.push(task);

    AddTaskModalOpen.value = false;
    activeSectionId.value = null;
}


function openAddSectionModal() {
    modalOpen.value = true;
    newSectionTitle.value = "";
}
function closeModal() {
    modalOpen.value = false;
}

function saveSection() {
    const title = newSectionTitle.value.trim();
    if (!title) return;

    sections.value.push({ id: nextSectionId++, title, tasks: [] });
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

/* Horizontal board */
.board-row {
    display: flex;
    gap: 18px;
    align-items: flex-start;
    overflow-x: auto;
    padding: 10px;
}

/* Section card */
.section {
    width: 300px;
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

.section__title {
    font-size: 18px;
    font-weight: 700;
}

/* Buttons */
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
    border: 2px solidrgba(204, 206, 206, 0.55);
    background: #263d70;
    font-weight: 700;
}

/* 3-dot button */
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
.add-task-modal {
    position: absolute;
    top: 200px;
    left: 500px;
}

.task-card {
    border: 1px solid white;
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
.task-actions{
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
.action-btn:hover{
    cursor: pointer;
}
</style>
