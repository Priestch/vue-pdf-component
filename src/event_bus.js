import Vue from 'vue';

let eventBus = new Vue();
eventBus.dispatch = eventBus.$emit;

export default eventBus;
