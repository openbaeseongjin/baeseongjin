import { defineArea, defineAreaCatalog } from "./AreaDefinition.js";
import { SECTOR_01_AREA_CATALOG } from "./sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "./sector02/Sector02AreaCatalog.js";

function connectArea(area, { order, nextAreaId, gate = {} }) {
    return defineArea({
        ...area,
        order,
        nextAreaId,
        gate: {
            ...area.gate,
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

const sector02Areas = SECTOR_02_AREA_CATALOG.areas.map((area, index) =>
    connectArea(area, {
        order: sector01Areas.length + index + 1,
        nextAreaId: area.nextAreaId
    })
);

export const CURRENT_AUTHORED_AREA_CATALOG = defineAreaCatalog({
    id: "current-authored-city-mock",
    revision: "sector-01-rev3-sector-02-rev1-v2",
    areas: [...sector01Areas, ...sector02Areas]
});
