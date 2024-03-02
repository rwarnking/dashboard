import * as d3 from 'd3';

class DataManager {

    constructor() {
        this.sources = new Map();
        this.time = Date.now();
        this.colorMap = d3.schemeSet2;
        this.colors = d3.scaleOrdinal(this.colorMap);
    }

    has(id) {
        return this.sources.has(id);
    }

    get(id) {
        return this.sources.get(id);
    }

    add(source) {
        if (this.has(source.id)) {
            throw new Error(`data source ${id} already exists`)
        }
        this.sources.set(source.id, source);
        this.colors.domain(this.getSourceIDs());
        this.time = Date.now();
    }

    remove(id) {
        this.sources.delete(id);
        this.time = Date.now();
    }

    getSourceIDs() {
        return Array.from(this.sources.keys());
    }

    getSourceColor(id) {
        return this.colors(id)
    }
    getSourceColors(filter=null) {
        if (filter === null) {
            return this.getSourceIDs().map(id => this.getSourceColor(id))
        }
        return filter.map(id => this.getSourceColor(id))
    }

    getDataByAttr(attr, filter=null) {
        const data = [];
        if (filter === null) {
            this.sources.forEach(src => data.push(src.getData(attr)))
        } else {
            filter.forEach(id => data.push(this.get(id).getData(attr)))
        }
        return data;
    }

    getDataByAttrFlat(attr, filter=null) {
        let data = [];
        if (filter === null) {
            this.sources.forEach(src => {
                data = data.concat(src.getData(attr)
                    .map(dd => Object.assign(dd, { _group: src.id }))
                )
            })
        } else {
            filter.forEach(id => {
                data = data.concat(this.get(id).getData(attr)
                    .map(dd => Object.assign(dd, { _group: id }))
                )
            })
        }
        return data;
    }
}

const DM = new DataManager();

export { DM as default, DataManager };
