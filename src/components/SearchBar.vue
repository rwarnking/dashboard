<template>
    <v-autocomplete
        style="width: 97%;"
        v-model="data.selected"
        :items="data.items"
        item-title="name"
        item-value="name"
        return-object
        class="ma-2"
        placeholder="select a filter"
        rounded multiple
        variant="solo"
        append-inner-icon="mdi-magnify"
        density="comfortable"
        @update:model-value="update">


        <!-- <template v-slot:chip="{ props, item }">
            <v-chip
                v-bind="props"
                :prepend-avatar="item.raw.avatar"
                :text="item.raw.name"
            ></v-chip>
        </template> -->

        <template v-slot:item="{ props, item }">
            <v-list-item
                v-bind="props"
                :title="item.raw.name"
                :subtitle="item.raw.group ? item.raw.group : ''"
            ></v-list-item>
        </template>

    </v-autocomplete>

</template>

<script setup>
    import * as d3 from 'd3';
    import { useApp } from '@/store/app';
    import { reactive, onMounted, watch } from 'vue';
    import DS from '@/data-structure.json'
    import { FILTER_TYPES } from '@/use/filter';

    const data = reactive({
        items: [],
        selected: []
    });

    function init() {
        const items = [];
        Object.keys(DS).forEach(cat => {
            if (DS[cat].type === "string") {
                DS[cat].values.forEach(d => items.push({ name: d, group: cat, key: DS[cat].key }))
            }
        });
        data.items = items;
        readFilters();
    }

    const app = useApp()

    function update() {
        const g = d3.group(data.selected, d => d.group)
        app.clearFilters();
        g.forEach((array, _) => {
            if (array.length > 1) {
                app.setFilter(FILTER_TYPES.SET, array[0].key, array.map(d => d.name))
            } else {
                app.setFilter(FILTER_TYPES.VALUE, array[0].key, array[0].name)
            }
        })
    }

    function readFilters() {
        // TODO
    }

    onMounted(init)

    watch(() => app.filterTime, readFilters)

</script>
