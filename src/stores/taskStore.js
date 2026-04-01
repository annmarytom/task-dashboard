import { defineStore } from "pinia";

const UNKNOWN_SECTION_TITLE = "Unknown Tasks";
const STORAGE_KEY = "task-management-store";

function generateId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function createSection(title = "Todo", tasks = []) {
  return {
    id: generateId("section"),
    title,
    tasks,
  };
}

function createTask(task = {}, fallbackStatus = "Todo") {
  return {
    id: task.id || generateId("task"),
    name: task.name ?? "",
    description: task.description ?? "",
    status: task.status ?? fallbackStatus,
    dueDate: task.dueDate ?? null,
  };
}

function getDefaultState() {
  return {
    sections: [createSection("Todo", [])],
  };
}

function normalizeTitle(title) {
  return (title || "").trim().toLowerCase();
}

function sanitizeSections(rawSections) {
  if (!Array.isArray(rawSections) || rawSections.length === 0) {
    return getDefaultState().sections;
  }

  const seenSectionIds = new Set();
  const seenTaskIds = new Set();

  const sanitized = rawSections
    .filter((section) => section && typeof section === "object")
    .map((section, sectionIndex) => {
      let sectionId =
        section.id && !seenSectionIds.has(section.id)
          ? section.id
          : generateId("section");

      if (seenSectionIds.has(sectionId)) {
        sectionId = generateId("section");
      }
      seenSectionIds.add(sectionId);

      const sectionTitle =
        typeof section.title === "string" && section.title.trim()
          ? section.title.trim()
          : `Section ${sectionIndex + 1}`;

      const tasks = Array.isArray(section.tasks)
        ? section.tasks
            .filter((task) => task && typeof task === "object")
            .map((task) => {
              let taskId =
                task.id && !seenTaskIds.has(task.id)
                  ? task.id
                  : generateId("task");

              if (seenTaskIds.has(taskId)) {
                taskId = generateId("task");
              }
              seenTaskIds.add(taskId);

              return {
                ...createTask(task, sectionTitle),
                id: taskId,
                status: sectionTitle,
              };
            })
        : [];

      return {
        id: sectionId,
        title: sectionTitle,
        tasks,
      };
    });

  if (!sanitized.some((section) => normalizeTitle(section.title) === "todo")) {
    sanitized.unshift(createSection("Todo", []));
  }

  return sanitized;
}

function readSectionsFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return getDefaultState().sections;
    }

    const parsed = JSON.parse(saved);
    return sanitizeSections(parsed.sections);
  } catch (error) {
    console.error("Failed to load task store from localStorage:", error);
    return getDefaultState().sections;
  }
}

export const useTaskStore = defineStore("task", {
  state: () => ({
    sections: [],
    snack: {
      open: false,
      message: "",
      duration: 3000,
    },
    loading: {
      bootstrapping: false,

      addingSection: false,
      renamingSectionId: null,
      deletingSectionId: null,

      creatingTask: false,
      updatingTaskId: null,
      deletingTaskId: null,
    },
  }),

  getters: {
    statusOptions: (state) => state.sections.map((s) => s.title),

    sectionById: (state) => {
      return (sectionId) => state.sections.find((s) => s.id === sectionId);
    },

    sectionByTitle: (state) => {
      return (title) =>
        state.sections.find(
          (s) => normalizeTitle(s.title) === normalizeTitle(title)
        );
    },

    isSectionRenaming: (state) => {
      return (sectionId) => state.loading.renamingSectionId === sectionId;
    },

    isSectionDeleting: (state) => {
      return (sectionId) => state.loading.deletingSectionId === sectionId;
    },

    isTaskUpdating: (state) => {
      return (taskId) => state.loading.updatingTaskId === taskId;
    },

    isTaskDeleting: (state) => {
      return (taskId) => state.loading.deletingTaskId === taskId;
    },
  },

  actions: {
    // -------------------------
    // fake api delay
    // -------------------------
    simulateApi(payload = null, delay = 2000) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(payload), delay);
      });
    },

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

    async initializeStore() {
      this.loading.bootstrapping = true;

      try {
        await this.simulateApi();
        this.sections = readSectionsFromLocalStorage();
        this.saveToLocalStorage();
      } finally {
        this.loading.bootstrapping = false;
      }
    },

     // -------------------------
    // Duplicate section helpers
    // -------------------------
    normalizeSectionTitle(title) {
      return normalizeTitle(title);
    },

    isUnknownSectionTitle(title) {
      return (
        this.normalizeSectionTitle(title) ===
        this.normalizeSectionTitle(UNKNOWN_SECTION_TITLE)
      );
    },

    isDuplicateSectionTitle(title, excludeSectionId = null) {
      const normalized = this.normalizeSectionTitle(title);

      return this.sections.some(
        (section) =>
          section.id !== excludeSectionId &&
          this.normalizeSectionTitle(section.title) === normalized
      );
    },

    ensureSectionExists(title) {
      const cleanTitle = (title || "").trim();

      if (!cleanTitle) return null;

      let section = this.sections.find(
        (s) =>
          this.normalizeSectionTitle(s.title) ===
          this.normalizeSectionTitle(cleanTitle)
      );

      if (!section) {
        section = createSection(cleanTitle, []);
        this.sections.push(section);
      }

      return section;
    },

    getOrCreateUnknownSection(excludeSectionId = null) {
      let unknownSection = this.sections.find(
        (section) =>
          section.id !== excludeSectionId &&
          this.isUnknownSectionTitle(section.title)
      );

      if (!unknownSection) {
        unknownSection = createSection(UNKNOWN_SECTION_TITLE, []);
        this.sections.push(unknownSection);
      }

      return unknownSection;
    },

    showSnack(message, duration = 3000) {
      this.snack.open = true;
      this.snack.message = message;
      this.snack.duration = duration;
    },

    closeSnack() {
      this.snack.open = false;
    },

    async addSection(title) {
      const cleanTitle = (title || "").trim();

      if (!cleanTitle) {
        throw new Error("Section name is required");
      }

      if (this.isDuplicateSectionTitle(cleanTitle)) {
        throw new Error("Section name already exists");
      }

      this.loading.addingSection = true;

      try {
        await this.simulateApi();

        this.sections.push(createSection(cleanTitle, []));

        this.saveToLocalStorage();
        this.showSnack(`Section "${cleanTitle}" added`);
      } finally {
        this.loading.addingSection = false;
      }
    },

    async renameSection(sectionId, title) {
      const cleanTitle = (title || "").trim();

      if (!cleanTitle) {
        throw new Error("Section name is required");
      }

      if (this.isDuplicateSectionTitle(cleanTitle, sectionId)) {
        throw new Error("Section name already exists");
      }

      const section = this.sections.find((s) => s.id === sectionId);
      if (!section) {
        throw new Error("Section not found");
      }

      this.loading.renamingSectionId = sectionId;

      try {
        await this.simulateApi();

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
      } finally {
        this.loading.renamingSectionId = null;
      }
    },

    async deleteSection(sectionId) {
      const secToDelete = this.sections.find((s) => s.id === sectionId);
      if (!secToDelete) {
        throw new Error("Section not found");
      }

      this.loading.deletingSectionId = sectionId;

      try {
        await this.simulateApi();

        const deletedTitle = secToDelete.title;
        const tasksToMove = Array.isArray(secToDelete.tasks)
          ? secToDelete.tasks.map((task) => ({ ...task }))
          : [];

        if (this.isUnknownSectionTitle(deletedTitle)) {
          this.sections = this.sections.filter((s) => s.id !== sectionId);
          this.saveToLocalStorage();
          this.showSnack(
            `Section "${deletedTitle}" and all its tasks were deleted`,
            3000
          );
          return;
        }

        if (tasksToMove.length > 0) {
          const unknownSection = this.getOrCreateUnknownSection(sectionId);

          const movedTasks = tasksToMove.map((task) => ({
            ...createTask(task, unknownSection.title),
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
      } finally {
        this.loading.deletingSectionId = null;
      }
    },

    // -------------------------
    // Task Actions
    // -------------------------
    async addTask(task) {
      const sec = this.ensureSectionExists(task.status);
      if (!sec) {
        throw new Error("Target section not found");
      }

      this.loading.creatingTask = true;

      try {
        await this.simulateApi();

        sec.tasks.push(
          createTask(
            {
              ...task,
              status: sec.title,
            },
            sec.title
          )
        );

        this.saveToLocalStorage();
        this.showSnack("Task added", 2500);
      } finally {
        this.loading.creatingTask = false;
      }
    },

    async updateTask({ fromSectionId, editingTaskId, task }) {
      const fromSec = this.sections.find((s) => s.id === fromSectionId);
      if (!fromSec) {
        throw new Error("Source section not found");
      }

      const idx = fromSec.tasks.findIndex((t) => t.id === editingTaskId);
      if (idx === -1) {
        throw new Error("Task not found");
      }

      this.loading.updatingTaskId = editingTaskId;

      try {
        await this.simulateApi();

        const updated = { ...fromSec.tasks[idx], ...task, id: editingTaskId };
        const toSec = this.ensureSectionExists(updated.status);

        if (!toSec) {
          throw new Error("Target section not found");
        }

        updated.status = toSec.title;

        if (toSec.id !== fromSec.id) {
          fromSec.tasks.splice(idx, 1);
          toSec.tasks.push(updated);
        } else {
          fromSec.tasks[idx] = updated;
        }

        this.saveToLocalStorage();
        this.showSnack("Task updated", 2500);
      } finally {
        this.loading.updatingTaskId = null;
      }
    },

    async upsertTask({ fromSectionId, editingTaskId, task }) {
      if (editingTaskId) {
        await this.updateTask({ fromSectionId, editingTaskId, task });
        return;
      }

      await this.addTask(task);
    },

    async deleteTask({ sectionId, taskId }) {
      const sec = this.sections.find((s) => s.id === sectionId);
      if (!sec) {
        throw new Error("Section not found");
      }

      const idx = sec.tasks.findIndex((t) => t.id === taskId);
      if (idx === -1) {
        throw new Error("Task not found");
      }

      this.loading.deletingTaskId = taskId;

      try {
        await this.simulateApi();

        sec.tasks.splice(idx, 1);

        this.saveToLocalStorage();
        this.showSnack("Task deleted", 2500);
      } finally {
        this.loading.deletingTaskId = null;
      }
    },

    moveTask({ sectionId, taskId, newIndex }) {
      const sec = this.sections.find((s) => s.id === sectionId);
      if (!sec) return;

      const fromIndex = sec.tasks.findIndex((t) => t.id === taskId);
      if (fromIndex === -1) return;
      if (newIndex === fromIndex) return;
      if (newIndex < 0 || newIndex >= sec.tasks.length) return;

      const [task] = sec.tasks.splice(fromIndex, 1);
      sec.tasks.splice(newIndex, 0, task);

      this.saveToLocalStorage();
    },

    resetStore() {
      const fresh = getDefaultState();
      this.sections = fresh.sections;
      this.saveToLocalStorage();
    },
  },
});
