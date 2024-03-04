import * as d3 from 'd3';
import DS from '@/data-structure.json'

function genAgeData(data, minAge, maxAge) {
    const g = d3.group(data, d => d.age);
    const tmp = Array.from(g, ([age, value]) => {
        return {
            age: Number.parseInt(age),
            value: value.length
        }
    });

    const result = [];
    d3.range(minAge, maxAge+1).forEach(i => {
        const item = tmp.find(d => d.age === i);
        result.push(item ? item : { age: i, value: 0 })
    });

    return result
}

function genSexData(data) {
    const g = d3.group(data, d => d.sex);
    return Array.from(g, ([name, value]) => ({ sex: name, value: value.length }))
}

function genKaplanData(data) {
    const g = d3.group(data, d => d.time);
    const rows = [{ time: 0, m: 0, n: data.length, st: 1 }].concat(
        Array.from(g, ([time, value]) => ({ time: time, m: value.length }))
    );
    rows.sort((a, b) => a.time - b.time)

    let cohortSize = data.length
    for (let i = 1; i < rows.length; ++i) {
        const lastM = rows[i-1].m;
        rows[i].n = cohortSize - lastM;
        cohortSize -= lastM;
        rows[i].st = (rows[i].n - rows[i].m) / data.length;
    }
    return rows
}

function genDiagnosisData(data) {
    const g = d3.group(data, d => d.diagnosis);
    const tmp = Array.from(g, ([name, value]) => ({ name: name, value: value.length }));

    const result = [];
        DS.diagnosis.values.forEach(i => {
        const item = tmp.find(d => d.name === i);
        result.push(item ? item : { name: i, value: 0 })
    });

    return result
}

function genStoneData(data, minStone, maxStone) {
    const g = d3.group(data, d => d.stones);
    const tmp = Array.from(g, ([stoneSize, value]) => {
        let curedCount = 0
        value.forEach(elem => {
            if (elem.cured)
                curedCount++
        })
        return {
            stoneSize: Number.parseInt(stoneSize),
            value: curedCount / value.length
        }
    });

    // Search for container that are missing by iterating the range of possibilities
    const result = [];
    d3.range(minStone, maxStone+1).forEach(i => {
        const item = tmp.find(d => d.stoneSize === i);
        result.push(item ? item : { stoneSize: i, value: 0 })
    });

    return result
}

export {
    genAgeData,
    genSexData,
    genKaplanData,
    genDiagnosisData,
    genStoneData
}
