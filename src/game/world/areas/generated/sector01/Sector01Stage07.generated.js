// GENERATED FILE - DO NOT EDIT
// Source: 1-7 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "1-7";
export const GENERATED_AREA_ID = "sector-01-07";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-01-07:anchor-a",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -1088,
        "y": -192
      },
      "objectIndex": 0,
      "surfaceIndex": 10,
      "target": {
        "id": "sector-01-07:anchor-a-surface",
        "properties": {},
        "x": -1088,
        "y": -192
      }
    },
    {
      "landmark": {
        "id": "sector-01-07:anchor-d",
        "properties": {
          "coordinateAnchor": "center",
          "label": "D",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 608,
        "y": -512
      },
      "objectIndex": 1,
      "surfaceIndex": 11,
      "target": {
        "id": "sector-01-07:anchor-d-surface",
        "properties": {},
        "x": 608,
        "y": -512
      }
    },
    {
      "landmark": {
        "id": "sector-01-07:anchor-g",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -320,
        "y": -960
      },
      "objectIndex": 2,
      "surfaceIndex": 12,
      "target": {
        "id": "sector-01-07:anchor-g-surface",
        "properties": {},
        "x": -320,
        "y": -960
      }
    },
    {
      "landmark": {
        "id": "sector-01-07:grip-b",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": -672,
        "y": -256
      },
      "objectIndex": 3,
      "surfaceIndex": 15,
      "target": {
        "id": "sector-01-07:grip-b-surface",
        "properties": {},
        "x": -672,
        "y": -256
      }
    },
    {
      "landmark": {
        "id": "sector-01-07:grip-c",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": -224,
        "y": -320
      },
      "objectIndex": 4,
      "surfaceIndex": 16,
      "target": {
        "id": "sector-01-07:grip-c-surface",
        "properties": {},
        "x": -224,
        "y": -320
      }
    },
    {
      "landmark": {
        "id": "sector-01-07:grip-e",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 352,
        "y": -640
      },
      "objectIndex": 5,
      "surfaceIndex": 17,
      "target": {
        "id": "sector-01-07:grip-e-surface",
        "properties": {},
        "x": 352,
        "y": -640
      }
    },
    {
      "landmark": {
        "id": "sector-01-07:grip-f",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": -128,
        "y": -704
      },
      "objectIndex": 6,
      "surfaceIndex": 18,
      "target": {
        "id": "sector-01-07:grip-f-surface",
        "properties": {},
        "x": -128,
        "y": -704
      }
    },
    {
      "landmark": {
        "id": "sector-01-07:grip-h",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 160,
        "y": -1024
      },
      "objectIndex": 7,
      "surfaceIndex": 19,
      "target": {
        "id": "sector-01-07:grip-h-surface",
        "properties": {},
        "x": 160,
        "y": -1024
      }
    },
    {
      "landmark": {
        "id": "sector-01-07:far-catch",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 704,
        "y": -1088
      },
      "objectIndex": 8,
      "surfaceIndex": 20,
      "target": {
        "id": "sector-01-07:far-catch-surface",
        "properties": {},
        "x": 704,
        "y": -1088
      }
    },
    {
      "landmark": {
        "id": "sector-01-07:access-anchor-a",
        "properties": {
          "coordinateAnchor": "center",
          "label": "ACCESS A",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 960,
        "y": -992
      },
      "objectIndex": 10,
      "surfaceIndex": 13,
      "target": {
        "id": "sector-01-07:access-anchor-a-surface",
        "properties": {},
        "x": 960,
        "y": -992
      }
    },
    {
      "landmark": {
        "id": "sector-01-07:access-anchor-b",
        "properties": {
          "coordinateAnchor": "center",
          "label": "ACCESS B",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 1280,
        "y": -896
      },
      "objectIndex": 11,
      "surfaceIndex": 14,
      "target": {
        "id": "sector-01-07:access-anchor-b-surface",
        "properties": {},
        "x": 1280,
        "y": -896
      }
    }
  ],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1472,
      "width": 3360
    },
    "cameraZones": [
      {
        "desktopZoom": 0.95,
        "id": "lower-approach",
        "maxY": 0,
        "minY": -176,
        "mobileZoom": 0.7
      },
      {
        "desktopZoom": 1.02,
        "id": "pressure-preview",
        "maxY": -176,
        "minY": -352,
        "mobileZoom": 0.72
      },
      {
        "desktopZoom": 0.84,
        "id": "middle-against",
        "maxY": -352,
        "minY": -544,
        "mobileZoom": 0.64,
        "verticalPlayerRatio": 0.64
      },
      {
        "desktopZoom": 1.05,
        "id": "left-shadow",
        "maxY": -544,
        "minY": -832,
        "mobileZoom": 0.74,
        "verticalPlayerRatio": 0.62
      },
      {
        "desktopZoom": 0.82,
        "id": "upper-with",
        "maxY": -832,
        "minY": -1088,
        "mobileZoom": 0.63,
        "verticalPlayerRatio": 0.62
      },
      {
        "desktopZoom": 0.88,
        "id": "access-pocket",
        "maxY": -1088,
        "minY": -1216,
        "mobileZoom": 0.66,
        "verticalPlayerRatio": 0.62
      },
      {
        "desktopZoom": 1.08,
        "id": "bypass",
        "maxY": -1216,
        "minY": -1344,
        "mobileZoom": 0.75
      },
      {
        "desktopZoom": 1.12,
        "id": "exit",
        "maxY": -1344,
        "minY": -1472,
        "mobileZoom": 0.77
      }
    ],
    "checkpoints": [],
    "cueIds": [
      "pressure-unstable",
      "pressure-limit",
      "containment-violation",
      "manual-bypass",
      "service-route-available"
    ],
    "entry": {
      "id": "sector-01-07:entry",
      "x": -1248,
      "y": -32
    },
    "exit": {
      "id": "sector-01-07:exit",
      "x": 1328,
      "y": -1376
    },
    "gate": {
      "id": "sector-01-07:gate",
      "nextAreaId": "sector-01-08",
      "requiredObjectiveIds": [
        "sector-01-07:bypass-open"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 1302,
        "y": -1406
      }
    },
    "id": "sector-01-07",
    "name": "PRESSURE BYPASS",
    "nextAreaId": "sector-01-08",
    "objectives": [
      {
        "id": "sector-01-07:bypass-open",
        "sourceObjectId": "sector-01-07:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "center",
        "damage": false,
        "id": "sector-01-07:main-pressure-vent",
        "kind": "wind-source",
        "position": {
          "x": -1504,
          "y": -832
        },
        "presentationId": "world-object:wind-source",
        "windZoneId": "sector-01-07:main-pressure-vent-wind"
      },
      {
        "accessModuleId": "sector-01:access-module:c",
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": -16
          },
          "size": {
            "height": 480,
            "width": 480
          }
        },
        "coordinateAnchor": "center",
        "enemyType": "sentry-t1",
        "id": "sector-01-07:access-carrier",
        "kind": "sentry",
        "position": {
          "x": 1440,
          "y": -832
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut"
        ]
      },
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 320,
            "width": 320
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "sentry-t1",
            "pursuit-drone-t1",
            "shield-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-01-07:access-guard-a",
        "kind": "sentry",
        "position": {
          "x": 1216,
          "y": -832
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut"
        ]
      },
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 320,
            "width": 160
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "sentry-t1",
            "pursuit-drone-t1",
            "shield-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-01-07:access-guard-b",
        "kind": "sentry",
        "position": {
          "x": 1600,
          "y": -832
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-07:gate",
        "id": "sector-01-07:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-01-07:bypass-open",
        "position": {
          "x": 1216,
          "y": -1344
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-07:gate",
        "id": "sector-01-07:exit-gate",
        "kind": "gate",
        "position": {
          "x": 1328,
          "y": -1344
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 7,
    "recoveryPoints": [
      {
        "id": "sector-01-07:recovery-lower",
        "x": -544,
        "y": -152
      },
      {
        "id": "sector-01-07:recovery-middle",
        "x": 64,
        "y": -568
      },
      {
        "id": "sector-01-07:recovery-upper-local",
        "x": 352,
        "y": -944
      },
      {
        "id": "sector-01-07:recovery-access-local",
        "x": 1216,
        "y": -864
      }
    ],
    "routePoints": [
      {
        "id": "sector-01-07:route-entry",
        "x": -1248,
        "y": -32
      },
      {
        "id": "sector-01-07:route-a",
        "landmark": "A",
        "x": -1088,
        "y": -192
      },
      {
        "id": "sector-01-07:route-b",
        "x": -672,
        "y": -256
      },
      {
        "id": "sector-01-07:route-c",
        "x": -224,
        "y": -320
      },
      {
        "id": "sector-01-07:route-right-turn",
        "x": 352,
        "y": -352
      },
      {
        "id": "sector-01-07:route-d",
        "landmark": "D",
        "x": 608,
        "y": -512
      },
      {
        "id": "sector-01-07:route-e",
        "x": 352,
        "y": -640
      },
      {
        "id": "sector-01-07:route-f",
        "x": -128,
        "y": -704
      },
      {
        "id": "sector-01-07:route-middle-turn",
        "x": -704,
        "y": -768
      },
      {
        "id": "sector-01-07:route-upper-turn",
        "x": -704,
        "y": -928
      },
      {
        "id": "sector-01-07:route-g",
        "landmark": "G",
        "x": -320,
        "y": -960
      },
      {
        "id": "sector-01-07:route-h",
        "x": 160,
        "y": -1024
      },
      {
        "id": "sector-01-07:route-far-catch",
        "x": 704,
        "y": -1088
      },
      {
        "id": "sector-01-07:route-bypass",
        "x": 896,
        "y": -1216
      },
      {
        "id": "sector-01-07:route-final-deck",
        "x": 1184,
        "y": -1344
      }
    ],
    "routes": [
      "safe",
      "flow",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-01",
    "storyTriggers": [
      "pressure-unstable",
      "security-response-active",
      "pressure-limit",
      "containment-violation",
      "bypass-ready",
      "bypass-open",
      "service-route-available"
    ],
    "subtitle": "MANUAL PRESSURE CONTROL",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-07:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -1248,
          "y": 0
        },
        "vertices": [
          {
            "x": -1472,
            "y": 0
          },
          {
            "x": -1024,
            "y": 0
          },
          {
            "x": -1024,
            "y": 32
          },
          {
            "x": -1472,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-07:lower-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -544,
          "y": -128
        },
        "vertices": [
          {
            "x": -688,
            "y": -128
          },
          {
            "x": -400,
            "y": -128
          },
          {
            "x": -400,
            "y": -110
          },
          {
            "x": -688,
            "y": -110
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-07:right-turn-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 352,
          "y": -352
        },
        "vertices": [
          {
            "x": 192,
            "y": -352
          },
          {
            "x": 512,
            "y": -352
          },
          {
            "x": 512,
            "y": -328
          },
          {
            "x": 192,
            "y": -328
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-07:middle-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 64,
          "y": -544
        },
        "vertices": [
          {
            "x": -96,
            "y": -544
          },
          {
            "x": 224,
            "y": -544
          },
          {
            "x": 224,
            "y": -526
          },
          {
            "x": -96,
            "y": -526
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-07:left-safe-shadow",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -704,
          "y": -832
        },
        "vertices": [
          {
            "x": -880,
            "y": -832
          },
          {
            "x": -528,
            "y": -832
          },
          {
            "x": -528,
            "y": -808
          },
          {
            "x": -880,
            "y": -808
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": true,
        "id": "sector-01-07:pressure-baffle",
        "kind": "solid",
        "oneWay": false,
        "position": {
          "x": -832,
          "y": -704
        },
        "vertices": [
          {
            "x": -880,
            "y": -928
          },
          {
            "x": -784,
            "y": -928
          },
          {
            "x": -784,
            "y": -704
          },
          {
            "x": -880,
            "y": -704
          }
        ],
        "windOcclusion": true
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-07:bypass-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 896,
          "y": -1216
        },
        "vertices": [
          {
            "x": 704,
            "y": -1216
          },
          {
            "x": 1088,
            "y": -1216
          },
          {
            "x": 1088,
            "y": -1188
          },
          {
            "x": 704,
            "y": -1188
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": true,
        "id": "sector-01-07:bypass-panel-body",
        "kind": "solid",
        "oneWay": false,
        "position": {
          "x": 960,
          "y": -1216
        },
        "vertices": [
          {
            "x": 936,
            "y": -1296
          },
          {
            "x": 984,
            "y": -1296
          },
          {
            "x": 984,
            "y": -1216
          },
          {
            "x": 936,
            "y": -1216
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-07:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1184,
          "y": -1344
        },
        "vertices": [
          {
            "x": 1008,
            "y": -1344
          },
          {
            "x": 1360,
            "y": -1344
          },
          {
            "x": 1360,
            "y": -1312
          },
          {
            "x": 1008,
            "y": -1312
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-07:access-pocket-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1440,
          "y": -832
        },
        "vertices": [
          {
            "x": 1200,
            "y": -832
          },
          {
            "x": 1680,
            "y": -832
          },
          {
            "x": 1680,
            "y": -804
          },
          {
            "x": 1200,
            "y": -804
          }
        ]
      }
    ],
    "windZones": [
      {
        "bounds": {
          "height": 256,
          "width": 1664,
          "x": -1248,
          "y": -384
        },
        "direction": {
          "x": 1,
          "y": 0
        },
        "falloff": 80,
        "id": "sector-01-07:residual-airflow",
        "mode": "continuous",
        "strength": 220
      },
      {
        "bounds": {
          "height": 576,
          "width": 1696,
          "x": -736,
          "y": -1120
        },
        "cycle": {
          "active": 1.4,
          "decay": 0.3,
          "lull": 1.75,
          "warning": 0.7
        },
        "direction": {
          "x": 1,
          "y": 0
        },
        "falloff": 80,
        "id": "sector-01-07:main-pressure-vent-wind",
        "mode": "pulsed",
        "strength": 800
      }
    ]
  },
  "editor": {
    "editableDomains": [
      "bounds",
      "entry",
      "exit",
      "surfaces",
      "anchors",
      "recoveryRoute",
      "enemySlots",
      "worldObjects",
      "wind",
      "camera"
    ],
    "readOnlyDomains": [
      "objectives",
      "progression",
      "story",
      "scanner",
      "behaviorRegistry"
    ]
  },
  "schemaVersion": "area-spec-v2",
  "stage": {
    "id": "1-7",
    "sector": 1,
    "sourceAreaId": "sector-01-07",
    "stage": 7
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
