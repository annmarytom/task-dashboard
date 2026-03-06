<template>
  <el-dialog
    :model-value="open"
    :title="title"
    width="560px"
    align-center
    @close="emit('cancel')"
  >
    <span>{{ message }}</span>

    <template #footer>
      <div style="display: flex; justify-content: center; gap: 12px; width: 100%;">
        <el-button type="primary" @click="emit('confirm')">OK</el-button>
        <el-button @click="emit('cancel')">Cancel</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "Confirm" },
  message: { type: String, default: "" },
});

const emit = defineEmits(["confirm", "cancel"]);
</script>