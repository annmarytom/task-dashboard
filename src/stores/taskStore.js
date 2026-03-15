import { defineStore } from "pinia";
import { uniqueId } from "lodash";

const UNKNOWN_SECTION_TITLE = "Unknown Tasks";
const STORAGE_KEY = "task-management-store";

function getDefaultState() {
  return {
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
  };
}

function loadStateFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return getDefaultState();
    }

    const parsed = JSON.parse(saved);

    return {
      sections: Array.isArray(parsed.sections) && parsed.sections.length
        ? parsed.sections
        : getDefaultState().sections,
      snack: {
        open: false,
        message: "",
        duration: 3000,
      },
    };
  } catch (error) {
    console.error("Failed to load task store from localStorage:", error);
    return getDefaultState();
  }
}

export const useTaskStore = defineStore("task", {
  state: () => loadStateFromLocalStorage(),

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
    // localStorage helper
    // -------------------------
    saveToLocalStorage() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            sections: this.sections,
          })
        );
      } catch (error) {
        console.error("Failed to save task store to localStorage:", error);
      }
    },

    // -------------------------
    // Duplicate section helpers
    // -------------------------
    normalizeSectionTitle(title) {
      return (title || "").trim().toLowerCase();
    },

    isDuplicateSectionTitle(title, excludeSectionId = null) {
      const normalized = this.normalizeSectionTitle(title);

      return this.sections.some(
        (section) =>
          section.id !== excludeSectionId &&
          this.normalizeSectionTitle(section.title) === normalized
      );
    },

    getOrCreateUnknownSection(excludeSectionId = null) {
      let unknownSection = this.sections.find(
        (section) =>
          section.id !== excludeSectionId &&
          this.normalizeSectionTitle(section.title) ===
            this.normalizeSectionTitle(UNKNOWN_SECTION_TITLE)
      );

      if (!unknownSection) {
        unknownSection = {
          id: uniqueId("section_"),
          title: UNKNOWN_SECTION_TITLE,
          tasks: [],
        };

        this.sections.push(unknownSection);
      }

      return unknownSection;
    },

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
      const cleanTitle = (title || "").trim();

      if (!cleanTitle) return;

      if (this.isDuplicateSectionTitle(cleanTitle)) {
        throw new Error("Section name already exists");
      }

      this.sections.push({
        id: uniqueId("section_"),
        title: cleanTitle,
        tasks: [],
      });

      this.saveToLocalStorage();
      this.showSnack(`Section "${cleanTitle}" added`);
    },

    renameSection(sectionId, title) {
      const cleanTitle = (title || "").trim();

      if (!cleanTitle) return;

      if (this.isDuplicateSectionTitle(cleanTitle, sectionId)) {
        throw new Error("Section name already exists");
      }

      const section = this.sections.find((s) => s.id === sectionId);
      if (!section) return;

      const oldTitle = section.title;
      section.title = cleanTitle;

      this.sections.forEach((s) => {
        s.tasks.forEach((t) => {
          if (t.status === oldTitle) {
            t.status = cleanTitle;
          }
        });
      });

      this.saveToLocalStorage();
      this.showSnack(`Section renamed to "${cleanTitle}"`);
    },

    deleteSection(sectionId) {
      const secToDelete = this.sections.find((s) => s.id === sectionId);
      if (!secToDelete) return;

      const deletedTitle = secToDelete.title;
      const tasksToMove = secToDelete.tasks || [];

      if (tasksToMove.length > 0) {
        const unknownSection = this.getOrCreateUnknownSection(sectionId);

        const movedTasks = tasksToMove.map((task) => ({
          ...task,
          status: unknownSection.title,
        }));

        unknownSection.tasks.push(...movedTasks);
      }

      this.sections = this.sections.filter((s) => s.id !== sectionId);

      this.saveToLocalStorage();

      if (tasksToMove.length > 0) {
        this.showSnack(
          `Section "${deletedTitle}" deleted and tasks moved to "${UNKNOWN_SECTION_TITLE}"`,
          3000
        );
      } else {
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

      this.saveToLocalStorage();
      this.showSnack("Task added", 2500);
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

      this.saveToLocalStorage();
      this.showSnack("Task updated", 2500);
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

      this.saveToLocalStorage();
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

      this.saveToLocalStorage();
    },

    // optional helper
    resetStore() {
      const fresh = getDefaultState();
      this.sections = fresh.sections;
      this.snack = fresh.snack;
      this.saveToLocalStorage();
    },
  },
});
