// GENERATED FILE - DO NOT EDIT
// Source: 4-6 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "4-6";
export const GENERATED_AREA_ID = "sector-04-06";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "a1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A1",
          "sourceId": "a1"
        },
        "x": 1650,
        "y": -530
      },
      "target": {
        "id": "a1-surface",
        "properties": {
          "sourceId": "a1"
        },
        "x": 1650,
        "y": -530
      }
    },
    {
      "landmark": {
        "id": "a2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A2",
          "sourceId": "a2"
        },
        "x": 1300,
        "y": -650
      },
      "target": {
        "id": "a2-surface",
        "properties": {
          "sourceId": "a2"
        },
        "x": 1300,
        "y": -650
      }
    },
    {
      "landmark": {
        "id": "a4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A4",
          "sourceId": "a4"
        },
        "x": 600,
        "y": -890
      },
      "target": {
        "id": "a4-surface",
        "properties": {
          "sourceId": "a4"
        },
        "x": 600,
        "y": -890
      }
    },
    {
      "landmark": {
        "id": "a5",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A5",
          "sourceId": "a5"
        },
        "x": 250,
        "y": -1010
      },
      "target": {
        "id": "a5-surface",
        "properties": {
          "sourceId": "a5"
        },
        "x": 250,
        "y": -1010
      }
    },
    {
      "landmark": {
        "id": "a6",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A6",
          "sourceId": "a6"
        },
        "x": 40,
        "y": -1190
      },
      "target": {
        "id": "a6-surface",
        "properties": {
          "sourceId": "a6"
        },
        "x": 40,
        "y": -1190
      }
    },
    {
      "landmark": {
        "id": "a7",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A7",
          "sourceId": "a7"
        },
        "x": 40,
        "y": -1550
      },
      "target": {
        "id": "a7-surface",
        "properties": {
          "sourceId": "a7"
        },
        "x": 40,
        "y": -1550
      }
    },
    {
      "landmark": {
        "id": "a8",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A8",
          "sourceId": "a8"
        },
        "x": 245,
        "y": -1805
      },
      "target": {
        "id": "a8-surface",
        "properties": {
          "sourceId": "a8"
        },
        "x": 245,
        "y": -1805
      }
    },
    {
      "landmark": {
        "id": "a12",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A12",
          "sourceId": "a12"
        },
        "x": 1425,
        "y": -2185
      },
      "target": {
        "id": "a12-surface",
        "properties": {
          "sourceId": "a12"
        },
        "x": 1425,
        "y": -2185
      }
    },
    {
      "landmark": {
        "id": "a13",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A13",
          "sourceId": "a13"
        },
        "x": 1815,
        "y": -2230
      },
      "target": {
        "id": "a13-surface",
        "properties": {
          "sourceId": "a13"
        },
        "x": 1815,
        "y": -2230
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 2656,
      "width": 5120
    },
    "cameraZones": [
      {
        "desktopZoom": 0.9,
        "id": "lower-gallery",
        "maxY": 0,
        "minY": -1300,
        "mobileZoom": 0.68
      },
      {
        "desktopZoom": 0.94,
        "id": "smoke-lock-transfer",
        "maxY": -1300,
        "minY": -1900,
        "mobileZoom": 0.7
      },
      {
        "desktopZoom": 0.9,
        "id": "upper-cutter-gallery",
        "maxY": -1900,
        "minY": -2350,
        "mobileZoom": 0.68
      },
      {
        "desktopZoom": 0.98,
        "id": "refuge-terrace-handoff",
        "maxY": -2350,
        "minY": -2560,
        "mobileZoom": 0.72
      }
    ],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-04-06:entry",
      "x": 1980,
      "y": -420
    },
    "exit": {
      "id": "sector-04-06:exit",
      "x": 1770,
      "y": -2180
    },
    "gate": {
      "id": "sector-04-06:gate",
      "nextAreaId": "sector-04-07",
      "requiredObjectiveIds": [
        "exit-panel-engaged"
      ],
      "trigger": {
        "height": 128,
        "width": 96,
        "x": 1722,
        "y": -2276
      }
    },
    "id": "sector-04-06",
    "name": "REFUGE ACCESS GALLERY",
    "nextAreaId": "sector-04-07",
    "objectives": [
      {
        "bounds": {
          "height": 128,
          "width": 360,
          "x": 1540,
          "y": -2280
        },
        "id": "final-deck-reached",
        "preset": "reach-deck",
        "type": "reach"
      },
      {
        "id": "exit-panel-engaged",
        "preset": "exit-panel",
        "requiredObjectiveIds": [
          "final-deck-reached"
        ],
        "sourceObjectId": "sector-04-06:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "activation": {
          "height": 950,
          "width": 1900,
          "x": 100,
          "y": -1150
        },
        "coordinateAnchor": "center",
        "enemyType": "pursuit-drone-t1",
        "id": "sector-04-06:lower-pursuit",
        "kind": "patrol-drone",
        "position": {
          "x": 1160,
          "y": -680
        }
      },
      {
        "activation": {
          "height": 700,
          "width": 1700,
          "x": 250,
          "y": -2400
        },
        "coordinateAnchor": "center",
        "enemyType": "sentry-t1",
        "id": "sector-04-06:upper-cutter",
        "kind": "sentry",
        "position": {
          "x": 1175,
          "y": -1795
        },
        "rules": [
          "cutter-fire",
          "cover-ends-los"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-04-06:gate",
        "id": "sector-04-06:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "exit-panel-engaged",
        "position": {
          "x": 1658,
          "y": -2045
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 480,
            "width": 640
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "patrol-drone-t1",
            "pursuit-drone-t1"
          ]
        },
        "id": "sector-04-06:route-guard-01",
        "kind": "sentry",
        "position": {
          "x": -40,
          "y": -1630
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
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
            "height": 480,
            "width": 640
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "sentry-t1",
            "patrol-drone-t1",
            "pursuit-drone-t1"
          ]
        },
        "id": "sector-04-06:route-guard-02",
        "kind": "sentry",
        "position": {
          "x": 170,
          "y": -1090
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
        ]
      }
    ],
    "order": 6,
    "recoveryPoints": [
      {
        "id": "sector-04-06:recover-lower",
        "maxRetrySeconds": 5,
        "x": 900,
        "y": -800
      },
      {
        "id": "sector-04-06:recover-shaft",
        "maxRetrySeconds": 5,
        "x": 40,
        "y": -1340
      },
      {
        "id": "sector-04-06:recover-upper",
        "maxRetrySeconds": 5,
        "x": 1080,
        "y": -2090
      }
    ],
    "routePoints": [
      {
        "id": "sector-04-06:route-entry",
        "sourceId": "entry",
        "x": 1980,
        "y": -420
      },
      {
        "id": "sector-04-06:route-a1",
        "sourceId": "a1",
        "x": 1650,
        "y": -530
      },
      {
        "id": "sector-04-06:route-a2",
        "sourceId": "a2",
        "x": 1300,
        "y": -650
      },
      {
        "id": "sector-04-06:route-a3",
        "sourceId": "a3",
        "x": 950,
        "y": -770
      },
      {
        "id": "sector-04-06:route-a4",
        "sourceId": "a4",
        "x": 600,
        "y": -890
      },
      {
        "id": "sector-04-06:route-a5",
        "sourceId": "a5",
        "x": 250,
        "y": -1010
      },
      {
        "id": "sector-04-06:route-a6",
        "sourceId": "a6",
        "x": 40,
        "y": -1190
      },
      {
        "id": "sector-04-06:route-a7",
        "sourceId": "a7",
        "x": 40,
        "y": -1550
      },
      {
        "id": "sector-04-06:route-a8",
        "sourceId": "a8",
        "x": 40,
        "y": -1880
      },
      {
        "id": "sector-04-06:route-a9",
        "sourceId": "a9",
        "x": 380,
        "y": -1940
      },
      {
        "id": "sector-04-06:route-a10",
        "sourceId": "a10",
        "x": 730,
        "y": -2000
      },
      {
        "id": "sector-04-06:route-a11",
        "sourceId": "a11",
        "x": 1080,
        "y": -2060
      },
      {
        "id": "sector-04-06:route-a12",
        "sourceId": "a12",
        "x": 1430,
        "y": -2120
      },
      {
        "id": "sector-04-06:route-a13",
        "sourceId": "a13",
        "x": 1770,
        "y": -2180
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-04",
    "storyTriggers": [],
    "subtitle": "SPLIT-HEIGHT REFUGE TRANSFER",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "lower-gallery-recovery",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": 860,
          "y": -760
        },
        "sourceId": "lower-gallery-recovery",
        "vertices": [
          {
            "x": -290,
            "y": -760
          },
          {
            "x": 2010,
            "y": -760
          },
          {
            "x": 2010,
            "y": -732
          },
          {
            "x": -290,
            "y": -732
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "smoke-lock-lower",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": 40,
          "y": -1300
        },
        "sourceId": "smoke-lock-lower",
        "vertices": [
          {
            "x": -95,
            "y": -1300
          },
          {
            "x": 175,
            "y": -1300
          },
          {
            "x": 175,
            "y": -1270
          },
          {
            "x": -95,
            "y": -1270
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "upper-gallery-recovery",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": 1065,
          "y": -2045
        },
        "sourceId": "upper-gallery-recovery",
        "vertices": [
          {
            "x": -110,
            "y": -2045
          },
          {
            "x": 2240,
            "y": -2045
          },
          {
            "x": 2240,
            "y": -2017
          },
          {
            "x": -110,
            "y": -2017
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-04-06:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1980,
          "y": -388
        },
        "vertices": [
          {
            "x": 1884,
            "y": -388
          },
          {
            "x": 2076,
            "y": -388
          },
          {
            "x": 2076,
            "y": -356
          },
          {
            "x": 1884,
            "y": -356
          }
        ]
      }
    ],
    "windZones": []
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
  "scenario": {
    "boundsProvenance": "expanded-for-authored-points",
    "status": "runtime-generated"
  },
  "schemaVersion": "area-spec-v2",
  "stage": {
    "id": "4-6",
    "sector": 4,
    "sourceAreaId": "sector-04-06",
    "stage": 6
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
