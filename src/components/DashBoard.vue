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

          <button class="btn btn--add">+ Add Task</button>
        </article>

        <!-- Add Section button -->
        <div class="addSection">
          <button class="btn btn--primary">Add Section</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const sections = ref([{ id: 1, title: "Todo" }]);
</script>

<style scoped>

.dashboard {
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

.dashboard-header{
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
</style>
