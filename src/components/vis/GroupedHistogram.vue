<template>
    <div style="text-align: center;">
        <h6 v-if="title" class="pb-2">{{ title }}</h6>
        <svg ref=el :width="width" :height="height"></svg>
    </div>
</template>

<script setup>

    import * as d3 from 'd3';
    import { useApp } from '@/store/app';
    import { FILTER_TYPES } from '@/use/filter';
    import { ref, onMounted, watch } from 'vue';

    const props = defineProps({
        data: {
            type: Array,
            required: true
        },
        colors: {
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
        groupAttr: {
            type: String,
            default: "group"
        },
        xAttr: {
            type: String,
            default: "name"
        },
        yAttr: {
            type: String,
            default: "value"
        },
        title: {
            type: String,
            default: ""
        },
        format: {
            type: String,
            default: "d"
        },
        grid: {
            type: Boolean,
            default: false
        },
        autoTicks: {
            type: Boolean,
            default: false
        },
        angledTicks: {
            type: Boolean,
            default: false
        },
        selectable: {
            type: Boolean,
            default: false
        },
    });

    const el = ref(null)

    const marginTop = 30;
    const marginRight = 10;
    const marginBottom = 50;
    const marginLeft = 40;

    const app = useApp();

    function draw() {
        const svg = d3.select(el.value)
        svg.selectAll("*").remove();

        const gDomain = Array.from(d3.group(props.data, d => d[props.groupAttr]).keys())
        const xdomain = Array.from(d3.group(props.data, d => d[props.xAttr]).keys())

        const x = d3.scaleBand()
            .domain(xdomain)
            .range([marginLeft, props.width-marginRight])
            .padding(0.1)

        const xG = d3.scaleBand()
            .domain(gDomain)
            .range([0, x.bandwidth()])
            .padding(0.1)

        const y = d3.scaleLinear()
            .domain([0, d3.max(props.data, d => d[props.yAttr])])
            .range([props.height-marginBottom, marginTop])

        // background grid (optional)
        if (props.grid) {
            const grid = svg.append("g")
                .attr("stroke", "#eee")
                .attr("stroke-width", 1)

            // TODO: hard-coded step size
            grid.selectAll(".xline")
                .data(x.domain())
                .join("line")
                .classed("xline", true)
                .attr("x1", d => x(d) + x.bandwidth() * 0.5)
                .attr("x2", d => x(d) + x.bandwidth() * 0.5)
                .attr("y1", y.range()[1])
                .attr("y2", y.range()[0])

            // TODO: hard-coded step size
            grid.selectAll(".yline")
                .data(d3.range(y.domain()[0], y.domain()[1]+1, 1))
                .join("line")
                .classed("yline", true)
                .attr("y1", d => y(d))
                .attr("y2", d => y(d))
                .attr("x1", x.range()[0])
                .attr("x2", x.range()[1])
        }


        // draw the bars
        const rects = svg.append("g")
            .selectAll("rect")
            .data(props.data.filter(d => d[props.yAttr] > 0))
            .join("rect")
            .attr("x", d => x(d[props.xAttr]) + xG(d[props.groupAttr]))
            .attr("y", d => y(d[props.yAttr]))
            .attr("width", xG.bandwidth())
            .attr("height", d => y(0) - y(d[props.yAttr]))
            .attr("fill", d => props.colors[gDomain.indexOf(d[props.groupAttr])])

        if (props.selectable) {
            rects.selectAll("rect")
                .style("cursor", "pointer")
                .on("pointerenter", function() {
                    d3.select(this).attr("stroke", "black")
                })
                .on("pointerleave", function() {
                    d3.select(this).attr("stroke", null)
                })
                .on("click", function(_, d) {
                    app.toggleFilter(FILTER_TYPES.VALUE, props.xAttr, d[props.xAttr])
                })
        }

        // Add the x-axis and label.
        const xaxis = svg.append("g")
            .attr("transform", `translate(0,${props.height - marginBottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))

        if (props.angledTicks) {
            // TODO: hard coded distances
            xaxis.selectAll(".tick text")
                .attr("transform", `translate(-15,10)rotate(-45)`)
        }

        if (props.autoTicks && xG.bandwidth() < 10) {
            // TODO: what about :not(:first-child) and :not(:last-child)
            xaxis.selectAll(".tick:not(:nth-child(6n+2)) text").remove()
        }

        const numYTicks = Math.floor((y.range()[0]-y.range()[1]) / 15)
        const yticks = d3.ticks(0, y.domain()[1], numYTicks)

        // Add the y-axis and label, and remove the domain line.
        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).tickValues(yticks).tickFormat(d3.format(props.format)))
            .call(g => g.select(".domain").remove())
    }

    onMounted(draw)

    watch(props, draw, { deep: true });
</script>
