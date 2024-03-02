// Utilities
import Filter, { FILTER_TYPES } from '@/use/filter';
import { defineStore } from 'pinia'

export const useApp = defineStore('app', {
    state: () => ({
        filters: [],
        filterTime: null,

        selectedDS: {},
        selectionTime: null
    }),

    getters: {
        filtersJSON: state => state.filters.map(f => f.toJSON()),
        selectedDSList: state => {
            return Object.entries(state.selectedDS)
                .filter(([_, val]) => val === true)
                .map(([key, _]) => key)
        }
    },

    actions: {

        hasDataSource(id) {
            return this.selectedDS[id] !== undefined;
        },

        addDataSource(id) {
            this.selectedDS[id] = true;
            this.selectionTime = Date.now();
        },

        toggleSelectedDataSource(id) {
            if (this.hasDataSource(id)) {
                this.selectedDS[id] = !this.selectedDS[id];
            } else {
                this.selectedDS[id] = true;
            }
            this.selectionTime = Date.now();
        },

        setFilter(type, name, values) {
            const f = this.getFilter(name)
            if (f) {
                f.set(values, type);
            } else {
                this.filters.push(new Filter(type, name, values));
            }
            this.filterTime = Date.now()
        },

        removeFilter(name) {
            const f = this.getFilter(name)
            if (f) {
                f.clear();
                this.filterTime = Date.now()
            }
        },

        toggleFilter(type, name, values) {
            const f = this.getFilter(name)
            if (f) {
                if (f.type === type && !f.isEmpty()) {
                    this.removeFilter(name)
                } else {
                    f.set(values, type);
                }
            } else {
                this.filters.push(new Filter(type, name, values));
            }
            this.filterTime = Date.now()
        },

        getFilter(name) {
            return this.filters.find(d => d.key === name);
        },

        hasFilter(name) {
            return this.getFilter() !== undefined;
        },

        clearFilters() {
            this.filters.forEach(f => f.clear());
            this.filterTime = Date.now()
        },

        matchesFilters(datum) {
            return this.filters.length === 0 || !this.filters.some(f => !f.matches(datum));
        }
    }
})
