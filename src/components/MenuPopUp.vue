<template>
    <div class="menu-wrap" @click.stop>
        <button class="icon-btn" aria-label="Menu" @click="toggle">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
            </svg>

        </button>

        <div v-if="open" class="menu-popup">
            <button class="menu-item" @click="onEdit">Edit</button>
            <button class="menu-item danger" @click="onDelete">Delete</button>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    open: { type: Boolean, default: false },
});

const emit = defineEmits(["toggle", "edit", "delete"]);

function toggle() {
    emit("toggle");
}
function onEdit() {
    emit("edit");
}
function onDelete() {
    emit("delete");
}
</script>

<style scoped>
.menu-wrap {
    position: relative;
}

.menu-popup {
    position: absolute;
    top: 34px;
    right: 0;
    width: 140px;
    background: #1f2f58;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
    padding: 6px;
    z-index: 80;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.menu-item {
    width: 100%;
    text-align: left;
    padding: 10px 10px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: #e5e7eb;
    cursor: pointer;
    font-size: 14px;
}

.menu-item:hover {
    background: rgba(255, 255, 255, 0.08);
}

.menuItem.danger {
    color: #fca5a5;
}

.menu-item.danger:hover {
    background: rgba(248, 113, 113, 0.15);
}

.icon-btn {
    width: 25px;
    height: 25px;
    color: black;
    background-color: transparent;
    border: none;
    cursor: pointer;
}
</style>
