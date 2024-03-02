import * as d3 from 'd3';
import DS from '@/data-structure.json'
import { genAgeData, genDiagnosisData, genKaplanData, genSexData } from './generator';

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export default class DataSource {

    constructor(id, meta={}) {
        this.id = id;
        this.meta = meta;
        this.data = {};
        this.time = Date.now();
        this.indices = [];
    }

    static generate(name, size=100, minAge=10, maxAge=50, minTime=1, maxTime=10) {
        const formatter = d3.format("03d")

        const patients = [];
        for (let i = 0; i < size; i++) {
            patients.push({
                name: "Patient " + formatter(1 + i),
                age: minAge + getRandomInt(maxAge-minAge),
                sex: DS.sex.values[getRandomInt(DS.sex.values.length)],
                state: DS.state.values[getRandomInt(DS.state.values.length)],
                time: minTime + getRandomInt(maxTime-minTime),
                diagnosis: DS.diagnosis.values[getRandomInt(DS.diagnosis.values.length)],
            });
        }

        // create dummy data source
        const src = new DataSource(name);
        src.setData("patients", patients);
        src.setData("age", genAgeData(patients, minAge, maxAge));
        src.setData("sex", genSexData(patients));
        src.setData("kaplan", genKaplanData(patients));
        src.setData("diagnosis", genDiagnosisData(patients));

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
