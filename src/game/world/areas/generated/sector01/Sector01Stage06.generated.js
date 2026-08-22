// GENERATED FILE - DO NOT EDIT
// Source: 1-6 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "1-6";
export const GENERATED_AREA_ID = "sector-01-06";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-01-06:anchor-a",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 1120,
        "y": -192
      },
      "objectIndex": 0,
      "surfaceIndex": 11,
      "target": {
        "id": "sector-01-06:anchor-a-surface",
        "properties": {},
        "x": 1120,
        "y": -192
      }
    },
    {
      "landmark": {
        "id": "sector-01-06:anchor-d",
        "properties": {
          "coordinateAnchor": "center",
          "label": "D",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -448,
        "y": -768
      },
      "objectIndex": 1,
      "surfaceIndex": 12,
      "target": {
        "id": "sector-01-06:anchor-d-surface",
        "properties": {},
        "x": -448,
        "y": -768
      }
    },
    {
      "landmark": {
        "id": "sector-01-06:grip-b",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 736,
        "y": -288
      },
      "objectIndex": 2,
      "surfaceIndex": 15,
      "target": {
        "id": "sector-01-06:grip-b-surface",
        "properties": {},
        "x": 736,
        "y": -288
      }
    },
    {
      "landmark": {
        "id": "sector-01-06:grip-c",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 320,
        "y": -352
      },
      "objectIndex": 3,
      "surfaceIndex": 16,
      "target": {
        "id": "sector-01-06:grip-c-surface",
        "properties": {},
        "x": 320,
        "y": -352
      }
    },
    {
      "landmark": {
        "id": "sector-01-06:grip-e",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 64,
        "y": -832
      },
      "objectIndex": 4,
      "surfaceIndex": 17,
      "target": {
        "id": "sector-01-06:grip-e-surface",
        "properties": {},
        "x": 64,
        "y": -832
      }
    },
    {
      "landmark": {
        "id": "sector-01-06:grip-f",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 704,
        "y": -896
      },
      "objectIndex": 5,
      "surfaceIndex": 18,
      "target": {
        "id": "sector-01-06:grip-f-surface",
        "properties": {},
        "x": 704,
        "y": -896
      }
    },
    {
      "landmark": {
        "id": "sector-01-06:access-anchor-a",
        "properties": {
          "coordinateAnchor": "center",
          "label": "ACCESS A",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -672,
        "y": -576
      },
      "objectIndex": 8,
      "surfaceIndex": 13,
      "target": {
        "id": "sector-01-06:access-anchor-a-surface",
        "properties": {},
        "x": -672,
        "y": -576
      }
    },
    {
      "landmark": {
        "id": "sector-01-06:access-anchor-b",
        "properties": {
          "coordinateAnchor": "center",
          "label": "ACCESS B",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -1056,
        "y": -640
      },
      "objectIndex": 9,
      "surfaceIndex": 14,
      "target": {
        "id": "sector-01-06:access-anchor-b-surface",
        "properties": {},
        "x": -1056,
        "y": -640
      }
    }
  ],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1280,
      "width": 3840
    },
    "cameraZones": [
      {
        "desktopZoom": 1.05,
        "id": "airflow-preview",
        "maxY": 0,
        "minY": -288,
        "mobileZoom": 0.74
      },
      {
        "desktopZoom": 0.81,
        "id": "fan-a-crossflow",
        "maxY": -288,
        "minY": -544,
        "mobileZoom": 0.62,
        "verticalPlayerRatio": 0.6
      },
      {
        "desktopZoom": 1.02,
        "id": "neutral-shadow",
        "maxY": -544,
        "minY": -672,
        "mobileZoom": 0.72,
        "verticalPlayerRatio": 0.62
      },
      {
        "desktopZoom": 0.79,
        "id": "fan-b-crossflow",
        "maxY": -672,
        "minY": -928,
        "mobileZoom": 0.61,
        "verticalPlayerRatio": 0.62
      },
      {
        "desktopZoom": 0.86,
        "id": "access-intake",
        "maxY": -928,
        "minY": -1024,
        "mobileZoom": 0.65,
        "verticalPlayerRatio": 0.62
      },
      {
        "desktopZoom": 1.1,
        "id": "exit",
        "maxY": -1024,
        "minY": -1280,
        "mobileZoom": 0.76
      }
    ],
    "checkpoints": [],
    "cueIds": [
      "airflow-unstable",
      "fan-a-continuous",
      "fan-b-lull-warning-active-decay",
      "cooling-pressure-critical"
    ],
    "entry": {
      "id": "sector-01-06:entry",
      "x": 1408,
      "y": -32
    },
    "exit": {
      "id": "sector-01-06:exit",
      "x": 1568,
      "y": -1120
    },
    "gate": {
      "id": "sector-01-06:gate",
      "nextAreaId": "sector-01-07",
      "requiredObjectiveIds": [
        "sector-01-06:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 1542,
        "y": -1150
      }
    },
    "id": "sector-01-06",
    "name": "COOLING SHAFT",
    "nextAreaId": "sector-01-07",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 320,
          "x": 1232,
          "y": -1120
        },
        "id": "sector-01-06:final-deck-reached",
        "type": "reach"
      },
      {
        "id": "sector-01-06:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-01-06:final-deck-reached"
        ],
        "sourceObjectId": "sector-01-06:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "center",
        "damage": false,
        "id": "sector-01-06:fan-a",
        "kind": "wind-source",
        "position": {
          "x": 1664,
          "y": -352
        },
        "presentationId": "world-object:wind-source",
        "windZoneId": "sector-01-06:fan-a-wind"
      },
      {
        "coordinateAnchor": "center",
        "damage": false,
        "id": "sector-01-06:fan-b",
        "kind": "wind-source",
        "position": {
          "x": -1664,
          "y": -800
        },
        "presentationId": "world-object:wind-source",
        "windZoneId": "sector-01-06:fan-b-wind"
      },
      {
        "accessModuleId": "sector-01:access-module:b",
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": -16
          },
          "size": {
            "height": 480,
            "width": 900
          }
        },
        "coordinateAnchor": "center",
        "enemyType": "sentry-t1",
        "id": "sector-01-06:access-carrier",
        "kind": "sentry",
        "position": {
          "x": -1456,
          "y": -672
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
        "id": "sector-01-06:access-guard-left",
        "kind": "sentry",
        "position": {
          "x": -1728,
          "y": -672
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
        "id": "sector-01-06:access-guard-right",
        "kind": "sentry",
        "position": {
          "x": -1184,
          "y": -672
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-06:gate",
        "id": "sector-01-06:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-01-06:exit-panel-engaged",
        "position": {
          "x": 1456,
          "y": -1088
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-01-06:final-deck-reached"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-06:gate",
        "id": "sector-01-06:exit-gate",
        "kind": "gate",
        "position": {
          "x": 1568,
          "y": -1088
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 6,
    "recoveryPoints": [
      {
        "id": "sector-01-06:recovery-fan-a-miss",
        "x": 544,
        "y": -152
      },
      {
        "id": "sector-01-06:recovery-fan-b-miss",
        "x": 320,
        "y": -760
      },
      {
        "id": "sector-01-06:recovery-access-local-reset",
        "x": -1184,
        "y": -704
      }
    ],
    "routePoints": [
      {
        "id": "sector-01-06:route-entry",
        "x": 1408,
        "y": -32
      },
      {
        "id": "sector-01-06:route-a",
        "landmark": "A",
        "x": 1120,
        "y": -192
      },
      {
        "id": "sector-01-06:route-b",
        "x": 736,
        "y": -288
      },
      {
        "id": "sector-01-06:route-c",
        "x": 320,
        "y": -352
      },
      {
        "id": "sector-01-06:route-neutral-landing",
        "x": -128,
        "y": -416
      },
      {
        "id": "sector-01-06:route-neutral-shadow",
        "x": -160,
        "y": -576
      },
      {
        "id": "sector-01-06:route-pulse-setup",
        "x": -704,
        "y": -704
      },
      {
        "id": "sector-01-06:route-d",
        "landmark": "D",
        "x": -448,
        "y": -768
      },
      {
        "id": "sector-01-06:route-e",
        "x": 64,
        "y": -832
      },
      {
        "id": "sector-01-06:route-f",
        "x": 704,
        "y": -896
      },
      {
        "id": "sector-01-06:route-exit-approach",
        "x": 1184,
        "y": -992
      },
      {
        "id": "sector-01-06:route-final-deck",
        "x": 1392,
        "y": -1088
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
      "airflow-unstable",
      "cooling-pressure-critical",
      "bypass-required"
    ],
    "subtitle": "AIRFLOW FAILURE",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-06:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 1408,
          "y": 0
        },
        "vertices": [
          {
            "x": 1152,
            "y": 0
          },
          {
            "x": 1664,
            "y": 0
          },
          {
            "x": 1664,
            "y": 32
          },
          {
            "x": 1152,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-06:fan-a-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 544,
          "y": -128
        },
        "vertices": [
          {
            "x": 384,
            "y": -128
          },
          {
            "x": 704,
            "y": -128
          },
          {
            "x": 704,
            "y": -110
          },
          {
            "x": 384,
            "y": -110
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-06:neutral-landing",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -128,
          "y": -416
        },
        "vertices": [
          {
            "x": -336,
            "y": -416
          },
          {
            "x": 80,
            "y": -416
          },
          {
            "x": 80,
            "y": -388
          },
          {
            "x": -336,
            "y": -388
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-01-06:wind-baffle",
        "kind": "solid",
        "oneWay": false,
        "position": {
          "x": -224,
          "y": -400
        },
        "vertices": [
          {
            "x": -272,
            "y": -688
          },
          {
            "x": -176,
            "y": -688
          },
          {
            "x": -176,
            "y": -400
          },
          {
            "x": -272,
            "y": -400
          }
        ],
        "windOcclusion": true
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-06:neutral-shadow-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -160,
          "y": -576
        },
        "vertices": [
          {
            "x": -416,
            "y": -576
          },
          {
            "x": 96,
            "y": -576
          },
          {
            "x": 96,
            "y": -544
          },
          {
            "x": -416,
            "y": -544
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-06:pulse-setup",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -704,
          "y": -704
        },
        "vertices": [
          {
            "x": -848,
            "y": -704
          },
          {
            "x": -560,
            "y": -704
          },
          {
            "x": -560,
            "y": -682
          },
          {
            "x": -848,
            "y": -682
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-06:fan-b-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 320,
          "y": -736
        },
        "vertices": [
          {
            "x": 160,
            "y": -736
          },
          {
            "x": 480,
            "y": -736
          },
          {
            "x": 480,
            "y": -718
          },
          {
            "x": 160,
            "y": -718
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-06:exit-approach",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 1184,
          "y": -992
        },
        "vertices": [
          {
            "x": 1008,
            "y": -992
          },
          {
            "x": 1360,
            "y": -992
          },
          {
            "x": 1360,
            "y": -964
          },
          {
            "x": 1008,
            "y": -964
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-06:access-intake-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1456,
          "y": -672
        },
        "vertices": [
          {
            "x": -1808,
            "y": -672
          },
          {
            "x": -1104,
            "y": -672
          },
          {
            "x": -1104,
            "y": -640
          },
          {
            "x": -1808,
            "y": -640
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-06:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1392,
          "y": -1088
        },
        "vertices": [
          {
            "x": 1184,
            "y": -1088
          },
          {
            "x": 1600,
            "y": -1088
          },
          {
            "x": 1600,
            "y": -1056
          },
          {
            "x": 1184,
            "y": -1056
          }
        ]
      }
    ],
    "windZones": [
      {
        "bounds": {
          "height": 320,
          "width": 2016,
          "x": -480,
          "y": -480
        },
        "direction": {
          "x": -1,
          "y": 0
        },
        "falloff": 80,
        "id": "sector-01-06:fan-a-wind",
        "mode": "continuous",
        "strength": 500
      },
      {
        "bounds": {
          "height": 288,
          "width": 2688,
          "x": -1408,
          "y": -992
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
        "id": "sector-01-06:fan-b-wind",
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
    "id": "1-6",
    "sector": 1,
    "sourceAreaId": "sector-01-06",
    "stage": 6
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
