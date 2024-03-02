<template>
    <div>
        <h5>Data Sources</h5>
        <div v-for="id in dataSources" :key="id">
            <v-checkbox :model-value="selectedDS[id]"
                density="compact"
                :color="DM.getSourceColor(id)"
                hide-details
                hide-spin-buttons
                :label="id"
                @update:model-value="app.toggleSelectedDataSource(id)">

                <template v-slot:label="{ props, label }">
                    <span v-bind="props" class="text-caption">{{ label }}</span>
                </template>
            </v-checkbox>
        </div>
    </div>
</template>

<script setup>
    import { useApp } from '@/store/app';
    import { storeToRefs } from 'pinia';
    import { computed } from 'vue';
    import DM from '@/use/data-manager';

    const app = useApp();
    const { selectedDS } = storeToRefs(app);

    const dataSources = computed(() => DM.getSourceIDs());
</script>
