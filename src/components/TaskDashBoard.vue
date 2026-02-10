<template>
    <div class="container">
        <!-- Heading -->
        <header class="header">
            <div>
                <h1>Task Dashboard</h1>
            </div>

            <!-- New Task Button -->
            <button class="btn primary" @click="showForm = !showForm">
                {{ showForm ? 'Close' : '+ New Task' }}
            </button>
        </header>

        <!-- Form (hidden initially) -->
        <form v-if="showForm" class="form" @submit.prevent="addTask">
            <input v-model="draft.name" placeholder="Task name" />
            <textarea v-model="draft.description" placeholder="Description"></textarea>

            <div class="row">
                <select v-model="draft.status">
                    <option value="Todo">Todo</option>
                    <option value="Inprogress">Inprogress</option>
                    <option value="Completed">Completed</option>
                </select>

                <input type="date" v-model="draft.dueDate" />
            </div>

            <button class="btn success" type="submit">Add Task</button>
        </form>

        <!-- Board -->
        <div class="board">
            <div class="column todo">
                <h3>Todo</h3>
                <div v-for="t in grouped.Todo" :key="t.id" class="card">
                    <strong>{{ t.name }}</strong>
                    <p>{{ t.description }}</p>
                    <span class="date">Due: {{ t.dueDate }}</span>
                </div>
            </div>

            <div class="column progress">
                <h3>Inprogress</h3>
                <div v-for="t in grouped.Inprogress" :key="t.id" class="card">
                    <strong>{{ t.name }}</strong>
                    <p>{{ t.description }}</p>
                    <span class="date">Due: {{ t.dueDate }}</span>
                </div>
            </div>

            <div class="column done">
                <h3>Completed</h3>
                <div v-for="t in grouped.Completed" :key="t.id" class="card">
                    <strong>{{ t.name }}</strong>
                    <p>{{ t.description }}</p>
                    <span class="date">Due: {{ t.dueDate }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";

const showForm = ref(false);

const tasks = ref([
    {
        id: 1,
        name: "Design UI",
        description: "Create task dashboard layout",
        status: "Todo",
        dueDate: "2026-02-15",
    },
    {
        id: 2,
        name: "Build logic",
        description: "Group tasks by status",
        status: "Inprogress",
        dueDate: "2026-02-12",
    },
    {
        id: 3,
        name: "find defects in wafers",
        description: "Group tasks by status",
        status: "Completed",
        dueDate: "2024-02-12",
    },
]);

const draft = reactive({
    name: "",
    description: "",
    status: "Todo",
    dueDate: "",
});

const grouped = computed(() => ({
    Todo: tasks.value.filter(t => t.status === "Todo"),
    Inprogress: tasks.value.filter(t => t.status === "Inprogress"),
    Completed: tasks.value.filter(t => t.status === "Completed"),
}));

function addTask() {
    if (!draft.name || !draft.description || !draft.dueDate) return;

    tasks.value.push({
        id: Date.now(),
        name: draft.name,
        description: draft.description,
        status: draft.status,
        dueDate: draft.dueDate,
    });

    draft.name = "";
    draft.description = "";
    draft.status = "Todo";
    draft.dueDate = "";
    showForm.value = false;
}
</script>

<style scoped>
.container {
    max-width: 1000px;
    margin: 40px auto;
    font-family: system-ui, Arial, sans-serif;
    color: #222;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.subtitle {
    color: #666;
    margin-top: 4px;
}


.btn {
    padding: 8px 14px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 600;
}

.primary {
    background: #2563eb;
    color: white;
}

.success {
    background: #16a34a;
    color: white;
}


.form {
    margin-top: 20px;
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

input,
textarea,
select {
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
}

textarea {
    resize: vertical;
}

.row {
    display: flex;
    gap: 10px;
}


.board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 30px;
}

.column {
    padding: 12px;
    border-radius: 8px;
    min-height: 200px;

}

.column h3 {
    margin-bottom: 10px;
}


.todo {
    background: #54298f;
}

.progress {
    background: #f44444;
}

.done {
    background: #09ee59;
}


.card {
    background: rgb(27, 26, 26);
    color:white;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow-wrap: break-word;
    word-break: break-word;
}

.card p {
    font-size: 14px;
    color: #555;
}

.date {
    font-size: 12px;
    color: #888;
}
</style>