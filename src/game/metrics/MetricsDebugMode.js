export function isMetricsPanelEnabled(search = "") {
    return new URLSearchParams(search).get("metrics") === "1";
}
