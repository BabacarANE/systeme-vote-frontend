// src/components/dashboard/DashboardCard.vue
<template>
  <v-card :class="['dashboard-card', colorClass]">
    <v-card-text>
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-1 mb-2">{{ title }}</div>
          <div class="text-h4 font-weight-bold">{{ value }}</div>
        </div>
        <v-icon size="48" :color="iconColor">{{ icon }}</v-icon>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  colorClass: String,
  iconColor: {
    type: String,
    default: 'white'
  }
})
</script>

<style scoped>
.dashboard-card {
  transition: transform 0.2s;
}

.dashboard-card:hover {
  transform: translateY(-5px);
}

.primary-gradient {
  background: linear-gradient(135deg, #008000 0%, #006400 100%);
  color: white;
}

.secondary-gradient {
  background: linear-gradient(135deg, #FFD700 0%, #DAA520 100%);
  color: white;
}

.error-gradient {
  background: linear-gradient(135deg, #FF0000 0%, #8B0000 100%);
  color: white;
}
</style>
