(function (global) {
    const defaultDataSets = {
        risks: [],
        controls: [],
        actionPlans: [],
        history: []
    };

    const freezeList = (list) => Array.isArray(list)
        ? Object.freeze(list.map(item => (item && typeof item === 'object')
            ? Object.freeze({ ...item })
            : item))
        : Object.freeze([]);

    global.RMS_DEFAULT_DATA = Object.freeze({
        risks: freezeList(defaultDataSets.risks),
        controls: freezeList(defaultDataSets.controls),
        actionPlans: freezeList(defaultDataSets.actionPlans),
        history: freezeList(defaultDataSets.history)
    });
})(typeof window !== 'undefined' ? window : globalThis);
