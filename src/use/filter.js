const FILTER_TYPES = Object.freeze({
    RANGE: "f_range",
    MIN_VAL: "f_minval",
    MAX_VAL: "f_maxval",
    VALUE: "f_value",
    SET: "f_set",
});

class Filter {

    constructor(type, key, values=null) {
        this.type = type;
        this.key = key;
        if (this.type === FILTER_TYPES.SET) {
            this.values = new Set(values ? values : [])
        } else {
            this.values = values;
        }
    }

    toJSON() {
        return {
            name: this.key,
            values: this.type === FILTER_TYPES.SET ?
                Array.from(this.values.values()) :
                this.values
        }
    }

    isEmpty() {
        return this.values === null ||
            (this.type === FILTER_TYPES.SET && this.values.size === 0)
    }

    clear() {
        switch(this.type) {
            case FILTER_TYPES.SET:
                this.values = new Set();
                break;
            default:
                this.values = null;
        }
    }

    set(values, type=null) {
        if (type !== null) { this.type = type; }

        switch(this.type) {
            case FILTER_TYPES.SET:
                if (Array.isArray(values)) {
                    this.values = new Set(values);
                } else {
                    this.values = new Set([values]);
                }
                break;
            default:
                this.values = values;
        }
    }

    add(values) {
        switch(this.type) {
            case FILTER_TYPES.SET:
                if (Array.isArray(values)) {
                    values.forEach(d => this.values.add(d))
                } else {
                    this.values.add(values);
                }
                break;
            default:
                this.values = values;
        }
    }

    remove(values) {
        switch(this.type) {
            case FILTER_TYPES.SET:
                this.values.delete(values);
                break;
            default:
                this.clear();
        }
    }

    matches(d) {
        if (this.isEmpty()) return true;

        switch(this.type) {
            case FILTER_TYPES.MIN_VAL:
                return d[this.key] >= this.values;
            case FILTER_TYPES.MAX_VAL:
                return d[this.key] <= this.values;
            case FILTER_TYPES.VALUE:
                return d[this.key] === this.values;
            case FILTER_TYPES.RANGE:
                return d[this.key] >= this.values[0] && d[this.key] <= this.values[1];
            case FILTER_TYPES.SET:
                return this.values.has(d[this.key]);
        }
    }
}

export { Filter as default, FILTER_TYPES };
