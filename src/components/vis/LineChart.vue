<template>
    <div style="text-align: center;">
        <h6 v-if="title" class="pb-2">{{ title }}</h6>
        <svg ref=el :width="width" :height="height"></svg>
    </div>
</template>

<script setup>

    import * as d3 from 'd3';
    import { ref, onMounted, watch } from 'vue';

    const props = defineProps({
        data: {
            type: Array,
            required: true
        },
        width: {
            type: Number,
            default: 350
        },
        height: {
            type: Number,
            default: 200
        },
        xAttr: {
            type: String,
            default: "x"
        },
        yAttr: {
            type: String,
            default: "y"
        },
        colors: {
            type: Array,
            required: true
        },
        title: {
            type: String,
            default: ""
        },
        curve: {
            type: String,
            default: "curveLinear"
        },
        format: {
            type: String,
            default: "d"
        },
        grid: {
            type: Boolean,
            default: false,
        },
        dots: {
            type: Boolean,
            default: false,
        }
    });

    const el = ref(null)

    const marginTop = 30;
    const marginRight = 10;
    const marginBottom = 30;
    const marginLeft = 40;

    function draw() {
        const svg = d3.select(el.value)
        svg.selectAll("*").remove();

        const x = d3.scaleLinear()
            .domain([
                d3.min(props.data, array => d3.min(array, d => d[props.xAttr])),
                d3.max(props.data, array => d3.max(array, d => d[props.xAttr]))
            ])
            .range([marginLeft, props.width-marginRight])

        const y = d3.scaleLinear()
            .domain([
                d3.min(props.data, array => d3.min(array, d => d[props.yAttr])),
                d3.max(props.data, array => d3.max(array, d => d[props.yAttr]))
            ])
            .range([props.height-marginBottom, marginTop])

        const path = d3.line()
            .curve(d3[props.curve])
            .x(d => x(d[props.xAttr]))
            .y(d => y(d[props.yAttr]))

        // background grid
        if (props.grid) {
            const grid = svg.append("g")
                .attr("stroke", "#eee")
                .attr("stroke-width", 1)

            // TODO: hard-coded step size
            grid.selectAll(".xline")
                .data(d3.range(x.domain()[0], x.domain()[1], 1))
                .join("line")
                .classed("xline", true)
                .attr("x1", d => x(d))
                .attr("x2", d => x(d))
                .attr("y1", y.range()[1])
                .attr("y2", y.range()[0])

            // TODO: hard-coded step size
            grid.selectAll(".yline")
                .data(d3.range(y.domain()[0], y.domain()[1], 0.1))
                .join("line")
                .classed("yline", true)
                .attr("y1", d => y(d))
                .attr("y2", d => y(d))
                .attr("x1", x.range()[0])
                .attr("x2", x.range()[1])
        }

        // axes
        svg.append("g")
            .attr("transform", `translate(0,${props.height - marginBottom})`)
            .call(d3.axisBottom(x))

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).tickFormat(d3.format(props.format)))


        // the line
        svg.append("g")
            .selectAll("path")
            .data(props.data)
            .join("path")
            .attr("d", path)
            .attr("stroke", (_, i) => props.colors[i])
            .attr("stroke-width", 2)
            .attr("fill", "none")

        // data point dots
        if (props.dots) {
            svg.append("g")
                .selectAll("g")
                .data(props.data)
                .join("g")
                    .selectAll("circle")
                    .data((d, i) => d.map(dd => ({ data: dd, index: i })))
                    .join("circle")
                    .attr("cx", d => x(d.data[props.xAttr]))
                    .attr("cy", d => y(d.data[props.yAttr]))
                    .attr("r", 4)
                    .attr("fill", d => props.colors[d.index])
        }
    }

    onMounted(draw)

    watch(props, draw, { deep: true });
</script>
