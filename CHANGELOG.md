# Changelog

All notable changes to this project will be documented in this file.

This changelog records the progress of the Task Dashboard project from initial setup to the latest fixes and improvements.

---

## [Unreleased]

### Added
- Added changelog file.

### Fixed
- Fixed issue where "Unknown Tasks" items were getting overwritten across sections.
- Fixed search filter issues.
- Fixed deletion-related issues for unknown tasks.

---

## [2026-03-17]

### Fixed
- Improved section tab styling and layout for better usability.
- Fixed task creation button alignment issues in table view.
- Fixed Add and Cancel button alignment issue in table view while creating a task.
- Fixed board view empty-state behavior for sections and task messages.
- Fixed missing add section button after deleting all sections in board view.
- Fixed "no task found" message behavior in empty board state.
-  Fixed section tab styling and layout for better usability
---

## [2026-03-16]

### Added
- Added loading state support to task and section components.
- Allowed users to create a new section directly from task creation flow.
- Implemented localStorage persistence for task store state.
- Added reset functionality for persisted task state.

### Changed
- Moved tasks to "Unknown Tasks" section when deleting a section.
- Implemented pagination for task table.
- Refactored task display logic for better structure.

### Fixed
- Prevented duplicate section names with validation.
- Improved error handling in `SectionInlineEditor` and `TaskTable`.
- Added search functionality in `DashBoard` for filtering by task name, description, status, and due date.
- Added validation support for section editing and task editing in table view.
- Improved task deletion confirmation dialog behavior.

---

## [2026-03-10]

### Changed
- Updated section position handling in section form.
- Refactored `SectionInlineEditor` and `AddTask` components to use Element Plus forms.
- Improved validation structure and overall form consistency.
- Refactored `DashBoard` component to use Element Plus components for UI consistency and improved user interactions.

### Added
- Added Element Plus components and integrated them into the application.

---

## [2026-03-04]

### Added
- Added Pinia for state management.
- Implemented centralized task store with section and task actions.

---

## [2026-03-03]

### Added
- Added `ConfirmDialog` component for user confirmation interactions.
- Added `Snackbar` component and integrated it into `DashBoard` for notifications.

---

## [2026-03-02]

### Changed
- Refactored `MenuPopUp` and `SectionInlineEditor` components for improved styling and structure.
- Merged `toggle-switch` branch.

---

## [2026-02-25]

### Added
- Implemented table view functionality.
- Added task operations in table view:
  - add task
  - edit task
  - delete task
  - interchange / move task
- Updated CSS styles related to task table behavior.

---

## [2026-02-23]

### Added
- Added `.gitignore` todo entries.

### Changed
- Implemented toggle between table view and dashboard view.

---

## [2026-02-20]

### Added
- Implemented functionality to move a task within the same section.

### Changed
- Updated edit form to follow the same order as task fields.

---

## [2026-02-18]

### Changed
- Created separate components for task list and section handling.
- Removed modal for adding/editing a section.
- Updated SVG icons using Heroicons.

### Added
- Committed lockfile.
- Added menu button component.

---

## [2026-02-17]

### Added
- Used Lodash to generate unique section IDs.
- Implemented delete button functionality for a task.
- Added Edit functionality of Add Task button.
- Added section create, edit, and delete functionality.

### Changed
- Updated CSS styles for `AddTask` component.
- Added logic to update status dropdown options when a new section is created.

---

## [2026-02-13]

### Added
- Added Heroicon CDN.
- Implemented Add Task functionality.
- Added `saveSection()` function to create new task sections.

---

## [2026-02-12]

### Added
- Implemented add section modal UI.
- Added `DashBoard` UI component to create sections of tasks.
- Added `AddTask` UI component for creating new tasks with form inputs.

### Changed
- Changed background color of Add Task modal.
- Fixed `AddTask` component to conditionally show modal and handle close action.

---

## [2026-02-11]

### Changed
- Refactored Task Dashboard layout using Flexbox for improved responsiveness.
- Reduced minimum height of Task Dashboard columns from 300px to 200px.

---

## [2026-02-10]

### Added
- Added GitHub Actions workflow for deploying static content to GitHub Pages.
- Added Task Dashboard component with task management features.
- Initialized Vue 3 project with Vite.
- Added basic project structure and configuration files.

### Changed
- Updated Vite configuration to set base path for Task Dashboard.

---

## Project Summary

### Major Features Added
- Vue 3 + Vite project setup
- Task Dashboard UI
- Section creation and management
- Task create, edit, delete, and move support
- Table view and board view toggle
- Inline editing and validation
- Snackbar and confirmation dialog components
- Pinia-based centralized state management
- Element Plus UI integration
- Search and filtering
- Pagination
- LocalStorage persistence
- Empty-state and deletion handling improvements

### Technical Improvements
- Refactoring for better component separation
- Improved validation and UI consistency
- Better responsiveness and usability
- Branch merges and incremental bug fixes