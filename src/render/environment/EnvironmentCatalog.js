import { EnvironmentDefinition } from "./EnvironmentDefinition.js";
import { ENVIRONMENT_MAX_ALTITUDE, ENVIRONMENT_ZONE_STEP } from "./EnvironmentAltitude.js";
import { runtimeAssetUrl } from "../assets/RuntimeAssetCatalog.js";

export { ENVIRONMENT_MAX_ALTITUDE, ENVIRONMENT_ZONE_STEP } from "./EnvironmentAltitude.js";

const FRAME_SIZE = Object.freeze({ width: 24, height: 24 });

function atlasDef(id, image, columns, rows) {
    return {
        id,
        source: runtimeAssetUrl("environments", "default-mock", image),
        size: { width: columns * FRAME_SIZE.width, height: rows * FRAME_SIZE.height },
        frameSize: FRAME_SIZE
    };
}

function frame(atlasId, column, row) {
    return Object.freeze({
        atlasId,
        x: column * FRAME_SIZE.width,
        y: row * FRAME_SIZE.height,
        width: FRAME_SIZE.width,
        height: FRAME_SIZE.height
    });
}

function material(matId, fillCol, fillRow, edgeCol, edgeRow, oneWayColor) {
    return Object.freeze({
        id: matId,
        fill: frame("terrain-fill", fillCol, fillRow),
        edge: frame("terrain-edge", edgeCol, edgeRow),
        oneWayColor
    });
}

function decorationGroup(items) {
    return Object.freeze({
        items: Object.freeze(items)
    });
}

const ATLASES = Object.freeze({
    "backdrop-far": atlasDef("backdrop-far", "backdrop-far.png", 2, 1),
    "backdrop-mid": atlasDef("backdrop-mid", "backdrop-mid.png", 2, 1),
    "backdrop-near": atlasDef("backdrop-near", "backdrop-near.png", 2, 1),
    "terrain-fill": atlasDef("terrain-fill", "terrain-fill.png", 2, 2),
    "terrain-edge": atlasDef("terrain-edge", "terrain-edge.png", 2, 1),
    decoration: atlasDef("decoration", "decoration.png", 4, 1)
});

const ZONES = Object.freeze([
    Object.freeze({
        id: "waste",
        label: "폐기물 처리구역",
        minAltitude: 0,
        palette: Object.freeze({
            skyTop: "#1a1a2e",
            skyBottom: "#0a0a14",
            silhouetteFar: "#1e2430",
            silhouetteMid: "#2a2f38",
            silhouetteNear: "#383d42",
            terrainFill: "#4a4540",
            terrainEdge: "#6e6860",
            oneWayEdge: "#a0d8c8",
            accent: "#f59e0b"
        }),
        backdropVariant: "waste",
        terrainMaterial: "waste-rock",
        decorationGroup: "waste"
    }),
    Object.freeze({
        id: "industrial-maintenance",
        label: "산업 정비구역",
        minAltitude: ENVIRONMENT_ZONE_STEP,
        palette: Object.freeze({
            skyTop: "#1e2433",
            skyBottom: "#0e121c",
            silhouetteFar: "#243040",
            silhouetteMid: "#303848",
            silhouetteNear: "#3e444a",
            terrainFill: "#505048",
            terrainEdge: "#787068",
            oneWayEdge: "#b8e8d8",
            accent: "#67e8f9"
        }),
        backdropVariant: "industrial",
        terrainMaterial: "industrial-rock",
        decorationGroup: "industrial"
    }),
    Object.freeze({
        id: "residential-commercial",
        label: "주거·상업 구역",
        minAltitude: ENVIRONMENT_ZONE_STEP * 2,
        palette: Object.freeze({
            skyTop: "#2a2a3e",
            skyBottom: "#141420",
            silhouetteFar: "#2a3650",
            silhouetteMid: "#384058",
            silhouetteNear: "#444a52",
            terrainFill: "#585850",
            terrainEdge: "#807870",
            oneWayEdge: "#c8f8e8",
            accent: "#fbbf24"
        }),
        backdropVariant: "residential",
        terrainMaterial: "residential-rock",
        decorationGroup: "residential"
    }),
    Object.freeze({
        id: "corporate-security",
        label: "기업 보안구역",
        minAltitude: ENVIRONMENT_ZONE_STEP * 3,
        palette: Object.freeze({
            skyTop: "#2e2e44",
            skyBottom: "#181828",
            silhouetteFar: "#303a58",
            silhouetteMid: "#404860",
            silhouetteNear: "#4a5058",
            terrainFill: "#5e5e56",
            terrainEdge: "#888078",
            oneWayEdge: "#d8fff0",
            accent: "#f87171"
        }),
        backdropVariant: "corporate",
        terrainMaterial: "corporate-rock",
        decorationGroup: "corporate"
    }),
    Object.freeze({
        id: "landing-pad",
        label: "착륙장",
        minAltitude: ENVIRONMENT_ZONE_STEP * 4,
        palette: Object.freeze({
            skyTop: "#3a3050",
            skyBottom: "#1e1a30",
            silhouetteFar: "#384060",
            silhouetteMid: "#485068",
            silhouetteNear: "#505860",
            terrainFill: "#686858",
            terrainEdge: "#928a80",
            oneWayEdge: "#e8ffe8",
            accent: "#a7f3d0"
        }),
        backdropVariant: "landing",
        terrainMaterial: "landing-rock",
        decorationGroup: "landing"
    })
]);

const BACKDROP = Object.freeze({
    layers: Object.freeze([
        Object.freeze({
            id: "far",
            depth: 0,
            parallaxX: 0.06,
            parallaxY: 0.03,
            frames: Object.freeze([frame("backdrop-far", 0, 0), frame("backdrop-far", 1, 0)]),
            tileWidth: 384,
            baselineRatio: 0.62,
            peakHeight: 180
        }),
        Object.freeze({
            id: "mid",
            depth: 1,
            parallaxX: 0.12,
            parallaxY: 0.08,
            frames: Object.freeze([frame("backdrop-mid", 0, 0), frame("backdrop-mid", 1, 0)]),
            tileWidth: 320,
            baselineRatio: 0.74,
            peakHeight: 240
        }),
        Object.freeze({
            id: "near",
            depth: 2,
            parallaxX: 0.19,
            parallaxY: 0.14,
            frames: Object.freeze([frame("backdrop-near", 0, 0), frame("backdrop-near", 1, 0)]),
            tileWidth: 264,
            baselineRatio: 0.88,
            peakHeight: 280
        })
    ])
});

const TERRAIN = Object.freeze({
    materials: Object.freeze({
        "waste-rock": material("waste-rock", 0, 0, 0, 0, "#a0d8c8"),
        "industrial-rock": material("industrial-rock", 0, 1, 1, 0, "#b8e8d8"),
        "residential-rock": material("residential-rock", 1, 0, 0, 0, "#c8f8e8"),
        "corporate-rock": material("corporate-rock", 1, 1, 1, 0, "#d8fff0"),
        "landing-rock": material("landing-rock", 0, 0, 0, 0, "#e8ffe8")
    })
});

const DECORATION = Object.freeze({
    groups: Object.freeze({
        waste: decorationGroup([
            Object.freeze({
                frame: frame("decoration", 0, 0),
                placement: Object.freeze({ depth: "far", surfaceLevelOffset: 0, avoidPlayPath: true }),
                size: Object.freeze({ width: 16, height: 16 })
            }),
            Object.freeze({
                frame: frame("decoration", 1, 0),
                placement: Object.freeze({ depth: "mid", surfaceLevelOffset: -1, avoidPlayPath: true }),
                size: Object.freeze({ width: 12, height: 20 })
            })
        ]),
        industrial: decorationGroup([
            Object.freeze({
                frame: frame("decoration", 0, 0),
                placement: Object.freeze({ depth: "far", surfaceLevelOffset: 0, avoidPlayPath: true }),
                size: Object.freeze({ width: 20, height: 16 })
            }),
            Object.freeze({
                frame: frame("decoration", 2, 0),
                placement: Object.freeze({ depth: "near", surfaceLevelOffset: -2, avoidPlayPath: true }),
                size: Object.freeze({ width: 10, height: 18 })
            })
        ]),
        residential: decorationGroup([
            Object.freeze({
                frame: frame("decoration", 1, 0),
                placement: Object.freeze({ depth: "mid", surfaceLevelOffset: 0, avoidPlayPath: true }),
                size: Object.freeze({ width: 14, height: 14 })
            }),
            Object.freeze({
                frame: frame("decoration", 3, 0),
                placement: Object.freeze({ depth: "near", surfaceLevelOffset: -1, avoidPlayPath: true }),
                size: Object.freeze({ width: 16, height: 12 })
            })
        ]),
        corporate: decorationGroup([
            Object.freeze({
                frame: frame("decoration", 2, 0),
                placement: Object.freeze({ depth: "far", surfaceLevelOffset: 0, avoidPlayPath: true }),
                size: Object.freeze({ width: 18, height: 10 })
            }),
            Object.freeze({
                frame: frame("decoration", 0, 0),
                placement: Object.freeze({ depth: "mid", surfaceLevelOffset: -3, avoidPlayPath: true }),
                size: Object.freeze({ width: 10, height: 20 })
            })
        ]),
        landing: decorationGroup([
            Object.freeze({
                frame: frame("decoration", 3, 0),
                placement: Object.freeze({ depth: "near", surfaceLevelOffset: -1, avoidPlayPath: true }),
                size: Object.freeze({ width: 12, height: 12 })
            }),
            Object.freeze({
                frame: frame("decoration", 1, 0),
                placement: Object.freeze({ depth: "mid", surfaceLevelOffset: 0, avoidPlayPath: true }),
                size: Object.freeze({ width: 16, height: 14 })
            })
        ])
    })
});

export const DEFAULT_ENVIRONMENT_DEFINITION = new EnvironmentDefinition({
    id: "environment-default-mock",
    atlases: ATLASES,
    zones: ZONES,
    backdrop: BACKDROP,
    terrain: TERRAIN,
    decoration: DECORATION
});
