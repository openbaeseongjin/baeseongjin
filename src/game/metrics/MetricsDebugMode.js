export function isMetricsPanelEnabled(search = "") {
    return new URLSearchParams(search).get("metrics") === "1";
}

export function parseStartAreaId(search = "") {
    const value = new URLSearchParams(search).get("start");
    return value && value.trim() ? value.trim() : null;
}
