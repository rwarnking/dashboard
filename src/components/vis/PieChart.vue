<template>
    <div style="text-align: center;">
        <h6 v-if="title" class="pb-2">{{ title }}</h6>
        <svg ref=el :width="size" :height="size"></svg>
    </div>
</template>

<script setup>

    import * as d3 from 'd3';
    import { ref, onMounted, watch } from 'vue';
    import { FILTER_TYPES } from '@/use/filter';
    import { useApp } from '@/store/app';

    const props = defineProps({
        data: {
            type: Array,
            required: true
        },
        colors: {
            type: Array,
            required: true
        },
        size: {
            type: Number,
            default: 250
        },
        nameAttr: {
            type: String,
            default: "name"
        },
        valueAttr: {
            type: String,
            default: "value"
        },
        title: {
            type: String,
            default: ""
        },
        selectable: {
            type: Boolean,
            default: false
        },
    });

    const el = ref(null)
    const app = useApp();

    function draw() {
        const svg = d3.select(el.value)
            .attr("viewBox", [-props.size/2, -props.size/2, props.size, props.size])
        svg.selectAll("*").remove();

        const pie = d3.pie()
            .sort(null)
            .value(d => d[props.valueAttr]);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(props.size / 2 - 1);

        const labelRadius = arc.outerRadius()() * 0.6;

        // A separate arc generator for labels.
        const arcLabel = d3.arc()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

        const arcs = pie(props.data);

        const piePieces = svg.append("g")
            .attr("stroke", "white")
            .selectAll("path")
            .data(arcs)
            .join("path")
            .attr("fill", (_, i) => props.colors[i])
            .attr("d", arc)

        piePieces.append("title")
            .text(d => d.data[props.nameAttr]);

        if (props.selectable) {
            piePieces
                .style("cursor", "pointer")
                .on("pointerenter", function() {
                    d3.select(this).attr("stroke", "black").raise()
                })
                .on("pointerleave", function() {
                    d3.select(this).attr("stroke", null)
                })
                .on("click", function(_, d) {
                    app.toggleFilter(FILTER_TYPES.VALUE, props.nameAttr, d.data[props.nameAttr])
                })
        }

        svg.append("g")
            .attr("text-anchor", "middle")
            .selectAll()
            .data(arcs)
            .join("text")
            .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
            .call(text => text.append("tspan")
                // .attr("y", "-0.2em")
                .attr("font-weight", "bold")
                .attr("font-size", props.size / 10)
                .text(d => d.data[props.nameAttr]))
            .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
                .attr("x", 0)
                .attr("y", "1.2em")
                .attr("font-size", props.size / 12)
                .attr("fill-opacity", 0.7)
                .text(d => d.data[props.valueAttr].toLocaleString("de-DE")));
    }

    onMounted(draw)

    watch(props, draw, { deep: true });
</script>
