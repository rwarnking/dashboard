import * as d3 from 'd3';
import DS from '@/data-structure.json'
import { genAgeData, genDiagnosisData, genKaplanData, genSexData, genStoneData } from './generator';

function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
}

function getRandomIntEx(max) {
    return Math.floor(Math.random() * max);
}

function getRandomIntStone(max, stoneSize) {
    if (Math.random() < 1/(stoneSize/2.8*stoneSize/2.8))
        return 1
    else
        return 0
}

export default class DataSource {

    constructor(id, meta={}) {
        this.id = id;
        this.meta = meta;
        this.data = {};
        this.time = Date.now();
        this.indices = [];
    }

    static generate(
        name, size=300, minAge=10, maxAge=50, minTime=1, maxTime=10, minStone=3, maxStone=10
    ) {
        const formatter = d3.format("03d")

        const patients = [];
        for (let i = 0; i < size; i++) {
            let stoneSize = minStone + getRandomInt(maxStone-minStone)

            patients.push({
                name: "Patient " + formatter(1 + i),
                age: minAge + getRandomInt(maxAge-minAge),
                sex: DS.sex.values[getRandomIntEx(DS.sex.values.length)],
                state: DS.state.values[getRandomIntEx(DS.state.values.length)],
                time: minTime + getRandomInt(maxTime-minTime),
                diagnosis: DS.diagnosis.values[getRandomIntEx(DS.diagnosis.values.length)],
                stones: stoneSize,
                cured: DS.cured.values[getRandomIntStone(DS.cured.values.length, stoneSize)],
            });
        }

        // create dummy data source
        const src = new DataSource(name);
        src.setData("patients", patients);
        src.setData("age", genAgeData(patients, minAge, maxAge));
        src.setData("sex", genSexData(patients));
        src.setData("kaplan", genKaplanData(patients));
        src.setData("diagnosis", genDiagnosisData(patients));
        src.setData("stone", genStoneData(patients, minStone, maxStone));
        // src.setData("stone_std", genStoneData(patients, minStone, maxStone));

        return src;
    }

    static combine(
        name, data_srcs
    ) {
        const src = new DataSource(name);

        let stone_data = []
        let kaplan_data = []

        data_srcs.forEach(data_src => {
            Object.entries(data_src.data).forEach(([key, categories]) => {
                src.mergeData(key, categories);
                if (key === "stone")
                    stone_data = stone_data.concat(categories)
                else if (key === "kaplan")
                    kaplan_data = kaplan_data.concat(categories)
            });
        });

        ///////////////////
        // Stone size
        ///////////////////
        const g = d3.group(stone_data, d => d.stoneSize);
        const tmp = Array.from(g, ([name, value]) => {
            let median = d3.sum(value, d => d.value) / value.length
            return ({ stoneSize: name, value: median})
        });

        let tmp2 = Array.from(g, ([name, value]) => {
            let median = d3.sum(value, d => d.value) / value.length

            let std_dev = Math.sqrt(d3.sum(value, d => (Math.pow(d.value - median, 2) * 1 / value.length)))

            return ({ stoneSize: name, value: median - std_dev})
        });
        tmp2 = tmp2.concat(Array.from(g, ([name, value]) => {
            let median = d3.sum(value, d => d.value) / value.length

            let std_dev = Math.sqrt(d3.sum(value, d => (Math.pow(d.value - median, 2) * 1 / value.length)))

            return ({ stoneSize: name, value: median + std_dev})
        }).reverse())
        src.data["stone"] = tmp
        src.data["stone_std"] = tmp2

        ///////////////////
        // Kaplan
        ///////////////////
        const g2 = d3.group(kaplan_data, d => d.time);
        const rows = Array.from(g2, ([name, value]) => {
            let m = d3.sum(value, d => d.m)
            return ({ time: name, m: m})
        });

        const cmpl_size = 900
        rows[0].n = cmpl_size
        rows[0].st = 1.0
        let cohortSize = cmpl_size
        for (let i = 1; i < rows.length; ++i) {
            const lastM = rows[i-1].m;
            rows[i].n = cohortSize - lastM;
            cohortSize -= lastM;
            rows[i].st = (rows[i].n - rows[i].m) / cmpl_size;
        }
        src.data["kaplan"] = rows

        return src;
    }

    setData(attr, data) {
        this.data[attr] = data;
        this.time = Date.now();
    }

    mergeData(attr, data) {

        if (attr in this.data) {
            if (attr === "age" || attr === "sex" || attr === "diagnosis") {
                Object.entries(data).forEach(([key, value]) => {
                    this.data[attr][key]["value"] += value["value"]
                });
            }
        } else {
            this.data[attr] = structuredClone(data);
        }

        this.time = Date.now();
    }

    getData(attr) {
        return this.data[attr];
    }
}
