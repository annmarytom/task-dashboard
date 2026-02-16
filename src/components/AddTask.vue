<template>
    <div v-if="showFormModal" class="modal" @click.stop>
        <div class="modal-header">
            <h2 class="modal-header_title">Add New Task</h2>
            <button class="modal-header_close" @click="close">✕
                <!-- <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg> -->
            </button>
        </div>

        <form class="form"  @submit.prevent="submit">
            <div class="input-fields">
                <label class="label">Task Name * </label>
                <input v-model.trim="name" type="text" class="input" placeholder="Ex:Build Logic">
            </div>
            <div class="input-fields">
                <label class="label">Description</label>
                <textarea v-model.trim="description" type="text" class="input" placeholder="Details"></textarea>
            </div>
            <div class="input-fields-meta">
                <div class="input-fields">
                    <label class="label">Status</label>
                    <select v-model="status" class="input" :style="{ width: '200px' }">
  <option v-for="opt in statusOptions" :key="opt" :value="opt">
    {{ opt }}
  </option>
</select>
                </div>
                <div class="input-fields">
                    <label class="label">Due Date</label>
                    <input  v-model="dueDate" type="date" class="input" :style="{ width: '200px' }">
                </div>
            </div>
            <div class="actions">
                <button class="cancel-button" type="button" @click="close">Cancel</button>
                <button class="add-button" type="submit">Add</button>
            </div>
        </form>
    </div>

</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  statusOptions: { type: Array, default: () => [] },
  defaultStatus: { type: String, default: "" },
});

const showFormModal = ref(true);
const emit = defineEmits(["close", "save"]);

const name = ref("");
const description = ref("");
const status = ref(props.defaultStatus || props.statusOptions[0] || "Todo");
const dueDate = ref("");

// if dashboard changes the default (like you clicked add task in another section)
watch(
  () => props.defaultStatus,
  (v) => {
    status.value = v || props.statusOptions[0] || "Todo";
  }
);

function close() {
  showFormModal.value = false;
  emit("close");
}

function submit() {
  if (!name.value.trim()) return;

  const task = {
    id: Date.now(),
    name: name.value.trim(),
    description: description.value.trim(),
    status: status.value,
    dueDate: dueDate.value || null,
  };

  emit("save", task);
}
</script>
<style>
.modal {

    width: 600px;
    background-color: #263d70;
    border: 1px solid rgb(67, 65, 65);
    border-radius: 15px;
    padding: 20px;
}

.modal-header {

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color:  #263d70;
}

.modal-header_title {

    font-size: large;
    color: white;
}

.modal-header_close {

    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 16px;
}

.form {

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 10px;
}

.input-fields {

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
    margin-top: 15px;
}

.label {

    color: white;
    font-family: Arial, Helvetica, sans-serif;
    font-size: small;
}

.input {

    width: auto;
    height: 40px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 10px;
    background-color: transparent;
    padding: 12px;
    color: gray;
}

.input-fields-meta {

    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.actions {

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 40px;
    justify-content: end;
    margin-top: 20px;
}

.cancel-button {

    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid #444;
    background: transparent;
    color: white;
}

.add-button {

    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid #444;
    background: transparent;
    color: white;
}
</style>