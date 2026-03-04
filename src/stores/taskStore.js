import { defineStore } from "pinia";
import { uniqueId } from "lodash";

export const useTaskStore = defineStore("task", {
  state: () => ({
    sections: [
      {
        id: uniqueId("section_"),
        title: "Todo",
        tasks: [],
      },
    ],

    snack: {
      open: false,
      message: "",
      duration: 3000,
    },
  }),

  getters: {
    statusOptions: (state) => state.sections.map((s) => s.title),

    sectionById: (state) => {
      return (sectionId) => state.sections.find((s) => s.id === sectionId);
    },

    sectionByTitle: (state) => {
      return (title) => state.sections.find((s) => s.title === title);
    },
  },

  actions: {
    // -------------------------
    // Snackbar
    // -------------------------
    showSnack(message, duration = 3000) {
      this.snack.open = true;
      this.snack.message = message;
      this.snack.duration = duration;
    },

    closeSnack() {
      this.snack.open = false;
    },

    // -------------------------
    // Section Actions
    // -------------------------
    addSection(title) {
      const v = (title || "").trim();
      if (!v) return;

      this.sections.push({
        id: uniqueId("section_"),
        title: v,
        tasks: [],
      });

      this.showSnack(`Section "${v}" added`, 3000);
    },

    renameSection(sectionId, newTitle) {
      const v = (newTitle || "").trim();
      if (!v) return;

      const sec = this.sections.find((s) => s.id === sectionId);
      if (!sec) return;

      const oldTitle = sec.title;
      sec.title = v;

      sec.tasks.forEach((t) => {
        if (t.status === oldTitle) t.status = v;
      });

      this.showSnack(`Section updated to "${v}"`, 3000);
    },

    deleteSection(sectionId) {
      const secToDelete = this.sections.find((s) => s.id === sectionId);
      const deletedTitle = secToDelete?.title;

      this.sections = this.sections.filter((s) => s.id !== sectionId);

      if (deletedTitle) {
        const fallback = this.sections[0]?.title || "Todo";

        this.sections.forEach((s) => {
          s.tasks.forEach((t) => {
            if (t.status === deletedTitle) t.status = fallback;
          });
        });

        this.showSnack(`Section "${deletedTitle}" deleted`, 3000);
      }
    },

    // -------------------------
    // Task Actions
    // -------------------------
    addTask(task) {
      const sec = this.sections.find((s) => s.title === task.status);
      if (!sec) return;

      sec.tasks.push({
        ...task,
        id: uniqueId("task_"),
      });
    },

    updateTask({ fromSectionId, editingTaskId, task }) {
      const fromSec = this.sections.find((s) => s.id === fromSectionId);
      if (!fromSec) return;

      const idx = fromSec.tasks.findIndex((t) => t.id === editingTaskId);
      if (idx === -1) return;

      const updated = { ...fromSec.tasks[idx], ...task, id: editingTaskId };

      const toSec = this.sections.find((s) => s.title === updated.status);

      if (toSec && toSec.id !== fromSec.id) {
        fromSec.tasks.splice(idx, 1);
        toSec.tasks.push(updated);
      } else {
        fromSec.tasks[idx] = updated;
      }
    },

    upsertTask({ fromSectionId, editingTaskId, task }) {
      if (editingTaskId) {
        this.updateTask({ fromSectionId, editingTaskId, task });
        return;
      }

      this.addTask(task);
    },

    deleteTask({ sectionId, taskId }) {
      const sec = this.sections.find((s) => s.id === sectionId);
      if (!sec) return;

      const idx = sec.tasks.findIndex((t) => t.id === taskId);
      if (idx === -1) return;

      sec.tasks.splice(idx, 1);

      this.showSnack("Task deleted", 2500);
    },

    moveTask({ sectionId, taskId, newIndex }) {
      const sec = this.sections.find((s) => s.id === sectionId);
      if (!sec) return;

      const fromIndex = sec.tasks.findIndex((t) => t.id === taskId);
      if (fromIndex === -1) return;
      if (newIndex === fromIndex) return;

      const [task] = sec.tasks.splice(fromIndex, 1);
      sec.tasks.splice(newIndex, 0, task);
    },
  },
});
