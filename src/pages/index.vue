<template>
    <div class="d-flex">
        <aside style="width: 300px;">
            <v-card class="ma-2 pa-2">
                <DataSelector/>
            </v-card>
        </aside>
        <section style="width: 100%;">
            <div class="d-flex flex-column align-start">
                <SearchBar/>
                <div class="d-flex flex-wrap mb-2">
                <v-card class="pa-3 mr-1">
                    <PieChart v-for="(array,i) in sexData"
                        :title="'Sex Distribution '+selectedDSList[i]"
                        :data="array"
                        :colors="d3.schemeBlues[3]"
                        :size="150"
                        selectable
                        name-attr="sex"
                        value-attr="value"/>
                </v-card>
                <v-card class="pa-3 ml-1">
                    <GroupedHistogram title="Age Distribution"
                        class="card"
                        :data="ageData"
                        :colors="colors"
                        :width="500"
                        :height="200"
                        auto-ticks
                        selectable
                        x-attr="age"
                        y-attr="value"
                        group-attr="_group"/>
                </v-card>
                </div>
                <v-card class="pa-3 mb-2">
                    <LineChart title="Kaplan Meier Curve"
                        class="card"
                        :data="kaplanData"
                        :colors="colors"
                        :width="650"
                        :height="250"
                        x-attr="time"
                        y-attr="st"
                        grid dots
                        curve="curveStepAfter"
                        format=".1f"/>
                </v-card>
                <v-card class="pa-3 mb-2">
                    <GroupedHistogram title="Diagnosis"
                        class="card"
                        :data="diagData"
                        :colors="colors"
                        :width="650"
                        :height="250"
                        x-attr="name"
                        y-attr="value"
                        grid
                        angled-ticks
                        group-attr="_group"/>
                </v-card>
                <v-card class="pa-3 mb-2">
                    <LineChartX title="Stonesize v Successrate"
                        class="card"
                        :data="stoneData"
                        :colors="colors"
                        :width="650"
                        :height="250"
                        x-attr="stoneSize"
                        y-attr="value"
                        grid
                        format=".1f"/>
                </v-card>
            </div>
        </section>
    </div>
</template>

<script setup>
    import * as d3 from 'd3';
    import SearchBar from '@/components/SearchBar.vue';
    import LineChart from '@/components/vis/LineChart.vue';
    import LineChartX from '@/components/vis/LineChartX.vue';
    import DataSelector from '@/components/DataSelector.vue';
    import GroupedHistogram from '@/components/vis/GroupedHistogram.vue';

    import DataSource from '@/use/data-source';
    import DM from '@/use/data-manager';
    import { useApp } from '@/store/app';
    import { computed } from 'vue';
    import { storeToRefs } from 'pinia';

    const app = useApp();
    const { selectedDSList } = storeToRefs(app)

    DM.add(DataSource.generate("Mannheim"))
    app.addDataSource("Mannheim")
    DM.add(DataSource.generate("Deutschland"))
    app.addDataSource("Deutschland")

    const ageData = computed(() => DM.getDataByAttrFlat("age", selectedDSList.value))
    const sexData = computed(() => DM.getDataByAttr("sex", selectedDSList.value))
    const kaplanData = computed(() => DM.getDataByAttr("kaplan", selectedDSList.value))
    const diagData = computed(() => DM.getDataByAttrFlat("diagnosis", selectedDSList.value))
    const stoneData = computed(() => DM.getDataByAttr("stone", selectedDSList.value))

    const colors = computed(() => DM.getSourceColors(selectedDSList.value))

</script>
