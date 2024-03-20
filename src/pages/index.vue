<template>
    <div class="d-flex align-start justify-start">
        <v-card class="ma-2 pa-2" width="200">
            <DataSelector/>
        </v-card>
        <section>
            <SearchBar/>
            <div class="d-flex flex-wrap mb-2">
                <v-card class="d-flex pa-2 mr-1">
                    <PieChart v-for="(array,i) in sexData"
                        :title="'Sex Distribution '+selectedDSList[i]"
                        class="mr-2"
                        :data="array"
                        :colors="d3.schemeBlues[3]"
                        :size="150"
                        selectable
                        name-attr="sex"
                        value-attr="value"/>
                </v-card>
                <v-card class="pa-2 ml-1">
                    <GroupedHistogram title="Age Distribution"
                        class="card"
                        :data="ageData"
                        :colors="colors"
                        :width="1180 - sexData.length * 152"
                        :height="250"
                        auto-ticks
                        selectable
                        x-attr="age"
                        y-attr="value"
                        group-attr="_group"/>
                </v-card>
            </div>
            
            <div class="d-flex flex-wrap mb-2">
            <v-card class="pa-2 mr-1">
                <LineChart title="Kaplan Meier Curve"
                    class="card"
                    :data="kaplanData"
                    :colors="colors"
                    :width="600"
                    :height="250"
                    x-attr="time"
                    y-attr="st"
                    grid dots
                    curve="curveStepAfter"
                    format=".1f"/>
            </v-card>
            
            <v-card class="pa-2 ml-1">
                <LineChartX title="Stonesize v Successrate"
                    class="card"
                    :data="stoneData"
                    :areas="stoneStdData"
                    :colors="colors"
                    :width="600"
                    :height="250"
                    x-attr="stoneSize"
                    y-attr="value"
                    curve="curveBumpX"
                    grid
                    format=".1f"/>
            </v-card>
            </div>

            <v-card class="pa-2 mb-2">
                <GroupedHistogram title="Diagnosis"
                    class="card"
                    :data="diagData"
                    :colors="colors"
                    :width="1200"
                    :height="350"
                    x-attr="name"
                    y-attr="value"
                    grid
                    angled-ticks
                    group-attr="_group"/>
            </v-card>
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

    const mannheim = DataSource.generate("Mannheim")
    const stuttgart = DataSource.generate("Stuttgart")
    const munich = DataSource.generate("München")

    const germany = DataSource.combine("Deutschland", [mannheim, stuttgart, munich])

    DM.add(germany)
    app.addDataSource("Deutschland")
    DM.add(mannheim)
    app.addDataSource("Mannheim")
    DM.add(stuttgart)
    app.addDataSource("Stuttgart")

    const ageData = computed(() => DM.getDataByAttrFlat("age", selectedDSList.value))
    const sexData = computed(() => DM.getDataByAttr("sex", selectedDSList.value))
    const kaplanData = computed(() => DM.getDataByAttr("kaplan", selectedDSList.value))
    const diagData = computed(() => DM.getDataByAttrFlat("diagnosis", selectedDSList.value))
    const stoneData = computed(() => DM.getDataByAttr("stone", selectedDSList.value))
    const stoneStdData = computed(() => DM.getDataByAttr("stone_std", selectedDSList.value))

    const colors = computed(() => DM.getSourceColors(selectedDSList.value))

</script>
