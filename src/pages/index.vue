<template>
  <div class="d-flex flex-column align-center">
    <SearchBar/>
    <div class="d-flex flex-wrap mb-2">
      <v-card class="pa-3 mr-1">
        <PieChart title="Sex Distribution"
          :data="dataSex"
          :height="250"
          selectable
          name-attr="sex"
          value-attr="value"/>
      </v-card>
      <v-card class="pa-3 ml-1">
        <Histogram title="Age Distribution"
          class="card"
          :data="dataAge"
          :width="450"
          :height="250"
          auto-ticks
          selectable
          x-attr="age"
          y-attr="value"/>
      </v-card>
    </div>
    <v-card class="pa-3 mb-2">
      <LineChart title="Kaplan Meier Curve"
        class="card"
        :data="dataKaplan"
        :width="650"
        :height="250"
        x-attr="time"
        y-attr="st"
        grid dots
        curve="curveStepAfter"
        format=".1f"/>
    </v-card>
    <v-card class="pa-3 mb-2">
        <Histogram title="Diagnosis"
          class="card"
          :data="dataDiagnoses"
          :width="650"
          :height="250"
          grid
          angled-ticks
          x-attr="name"
          y-attr="value"/>
      </v-card>
  </div>
</template>

<script setup>
  import * as d3 from 'd3';
  import SearchBar from '@/components/SearchBar.vue';
  import Histogram from '@/components/vis/Histogram.vue';
  import LineChart from '@/components/vis/LineChart.vue';
  import { computed } from 'vue';
  import { useApp } from '@/store/app';

  import DS from '@/data-structure.json'

  const app = useApp();

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  const formatter = d3.format("03d")

  const cohortSize = 100;
  const minAge = 10, maxAge = 50;
  const minTime = 1, maxTime = 10;

  const patients = [];
  for (let i = 0; i < cohortSize; i++) {
    patients.push({
      name: "Patient " + formatter(1 + i),
      age: minAge + getRandomInt(maxAge-minAge),
      sex: DS.sex.values[getRandomInt(DS.sex.values.length)],
      state: DS.state.values[getRandomInt(DS.state.values.length)],
      time: minTime + getRandomInt(maxTime-minTime),
      diagnosis: DS.diagnosis.values[getRandomInt(DS.diagnosis.values.length)],
    });
  }

  // TODO
  const data = computed(() => patients.filter(d => app.matchesFilters(d)))
  const dataAge = computed(() => {
    const g = d3.group(data.value, d => d.age);
    const tmp = Array.from(g, ([age, value]) => {
      return {
        age: Number.parseInt(age),
        value: value.length
      }
    });

    const result = [];
    const [min, max] = d3.extent(tmp, d => d.age);
    // d3.range(min, maxAge+1).forEach(i => {
    d3.range(min, max+1).forEach(i => {
      const item = tmp.find(d => d.age === i);
      result.push(item ? item : { age: i, value: 0 })
    });

    return result
  });

  const dataSex = computed(() => {
    const g = d3.group(data.value, d => d.sex);
    return Array.from(g, ([name, value]) => ({ sex: name, value: value.length }))
  });

  const dataKaplan = computed(() => {
    const g = d3.group(data.value, d => d.time);
    const rows = Array.from(g, ([time, value]) => ({ time: time, m: value.length }))
    rows.sort((a, b) => a.time - b.time)
    let cohortSize = data.value.length
    rows.forEach((d, i) => {
      const lastM = (i > 0 ? rows[i-1].m : 0);
      d.n = cohortSize - lastM;
      cohortSize -= lastM;
      d.st = (d.n - d.m) / data.value.length;
    })
    return [{ time: 0, m: 0, n: data.value.length, st: 1 }].concat(rows);
  });

  const dataDiagnoses = computed(() => {
    const g = d3.group(data.value, d => d.diagnosis);
    const tmp = Array.from(g, ([name, value]) => ({ name: name, value: value.length }));

    const result = [];
    DS.diagnosis.values.forEach(i => {
      const item = tmp.find(d => d.name === i);
      result.push(item ? item : { name: i, value: 0 })
    });

    return result
  });

  //
</script>
