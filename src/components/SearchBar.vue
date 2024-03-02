<template>
    <v-autocomplete
        style="width: 97%;"
        :model-value="selected"
        :items="data.items"
        item-title="values"
        item-value="values"
        return-object
        class="ma-2"
        placeholder="select a filter"
        rounded multiple
        variant="solo"
        append-inner-icon="mdi-magnify"
        density="comfortable"
        @update:model-value="update">

        <template v-slot:item="{ props, item }">
            <v-list-item
                v-bind="props"
                :title="item.raw.values"
                :subtitle="item.raw.name"
                density="compact"
            ></v-list-item>
        </template>

    </v-autocomplete>

</template>

<script setup>
    import * as d3 from 'd3';
    import { useApp } from '@/store/app';
    import { computed, reactive, onMounted } from 'vue';
    import DS from '@/data-structure.json'
    import { FILTER_TYPES } from '@/use/filter';
    import { storeToRefs } from 'pinia';

    const app = useApp()
    const data = reactive({ items: [] });

    const { filtersJSON } = storeToRefs(app)
    const selected = computed(() => {
        return filtersJSON.value.map(f => {
            return Array.isArray(f.values) ?
                f.values.map(d => ({ name: f.name, values: d })) :
                f
        }).flat()
    });

    function init() {
        const items = [];
        Object.keys(DS).forEach(cat => {
            if (DS[cat].type === "string") {
                DS[cat].values.forEach(d => items.push({ values: d, name: DS[cat].key }))
            }
        });
        data.items = items;
    }


    function update(items) {
        const g = d3.group(items, d => d.name)
        app.clearFilters();
        g.forEach((array, _) => {
            if (array.length > 1) {
                app.setFilter(FILTER_TYPES.SET, array[0].name, array.map(d => d.values))
            } else {
                app.setFilter(FILTER_TYPES.VALUE, array[0].name, array[0].values)
            }
        });
    }

    onMounted(init)

</script>
