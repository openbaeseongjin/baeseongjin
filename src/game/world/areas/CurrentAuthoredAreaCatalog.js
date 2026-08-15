import { defineArea, defineAreaCatalog } from "./AreaDefinition.js";
import { SECTOR_01_AREA_CATALOG } from "./sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "./sector02/Sector02AreaCatalog.js";
import { SECTOR_03_AREA_CATALOG } from "./sector03/Sector03AreaCatalog.js";

function connectArea(area, { order, nextAreaId, gate = {} }) {
    const baseGate = nextAreaId === null ? area.gate : { ...area.gate, completionMode: undefined };
    return defineArea({
        ...area,
        order,
        nextAreaId,
        gate: {
            ...baseGate,
            ...gate,
            nextAreaId
        }
    });
}

const sector01Areas = SECTOR_01_AREA_CATALOG.areas.map((area, index, areas) =>
    connectArea(area, {
        order: index + 1,
        nextAreaId: index === areas.length - 1 ? SECTOR_02_AREA_CATALOG.areas[0].id : area.nextAreaId
    })
);

const sector02Areas = SECTOR_02_AREA_CATALOG.areas.map((area, index, areas) =>
    connectArea(area, {
        order: sector01Areas.length + index + 1,
        nextAreaId: index === areas.length - 1 ? SECTOR_03_AREA_CATALOG.areas[0].id : area.nextAreaId
    })
);

// 3-8은 Post-Sector 03 Boss/전환(TBD)까지 content-boundary이며, 3-8 → 4-1 직접 연결은 확정하지 않는다.
const sector03Areas = SECTOR_03_AREA_CATALOG.areas.map((area, index) =>
    connectArea(area, {
        order: sector01Areas.length + sector02Areas.length + index + 1,
        nextAreaId: area.nextAreaId
    })
);

export const CURRENT_AUTHORED_AREA_CATALOG = defineAreaCatalog({
    id: "current-authored-city-mock",
    revision: "sector-01-rev3-sector-02-rev1-sector-03-rev1-v1",
    areas: [...sector01Areas, ...sector02Areas, ...sector03Areas]
});
