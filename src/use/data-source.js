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

        return src;
    }

    setData(attr, data) {
        this.data[attr] = data;
        this.time = Date.now();
    }

    getData(attr) {
        return this.data[attr];
    }
}
