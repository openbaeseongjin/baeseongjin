// GENERATED FILE - DO NOT EDIT
// Source: 1-2 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "1-2";
export const GENERATED_AREA_ID = "sector-01-02";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-01-02:anchor-a",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -120,
        "y": -170
      },
      "objectIndex": 2,
      "surfaceIndex": 10,
      "target": {
        "id": "sector-01-02:anchor-a-surface",
        "properties": {},
        "x": -120,
        "y": -170
      }
    },
    {
      "landmark": {
        "id": "sector-01-02:anchor-c",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -270,
        "y": -550
      },
      "objectIndex": 3,
      "surfaceIndex": 11,
      "target": {
        "id": "sector-01-02:anchor-c-surface",
        "properties": {},
        "x": -270,
        "y": -550
      }
    }
  ],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 960,
      "width": 1664
    },
    "cameraZones": [
      {
        "desktopZoom": 1.15,
        "horizontalPlayerRatio": 0.75,
        "id": "lift-failure",
        "maxY": 0,
        "minY": -224,
        "mobileZoom": 0.79
      },
      {
        "desktopZoom": 0.94,
        "horizontalPlayerRatio": 0.68,
        "id": "left-cross",
        "maxY": -223,
        "minY": -447,
        "mobileZoom": 0.7
      },
      {
        "desktopZoom": 0.9,
        "id": "airborne-reattach",
        "maxY": -449,
        "minY": -641,
        "mobileZoom": 0.68
      },
      {
        "desktopZoom": 0.96,
        "id": "roof-wrap",
        "maxY": -640,
        "minY": -800,
        "mobileZoom": 0.71
      },
      {
        "desktopZoom": 1.1,
        "id": "exit",
        "maxY": -800,
        "minY": -960,
        "mobileZoom": 0.76
      }
    ],
    "checkpoints": [],
    "cueIds": [
      "maintenance-lift",
      "airborne-handoff",
      "security-access-check",
      "counterweight-stalled"
    ],
    "entry": {
      "id": "sector-01-02:entry",
      "x": 448,
      "y": -32
    },
    "exit": {
      "id": "sector-01-02:exit",
      "x": -192,
      "y": -864
    },
    "gate": {
      "id": "sector-01-02:gate",
      "nextAreaId": "sector-01-03",
      "requiredObjectiveIds": [
        "sector-01-02:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": -218,
        "y": -894
      }
    },
    "id": "sector-01-02",
    "name": "DOUBLE ANCHOR SHAFT",
    "nextAreaId": "sector-01-03",
    "objectives": [
      {
        "id": "sector-01-02:exit-panel-engaged",
        "sourceObjectId": "sector-01-02:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-01-02:lift-offline"
        ],
        "gameplay": false,
        "id": "sector-01-02:maintenance-lift",
        "kind": "background-prop",
        "position": {
          "x": 115,
          "y": -460
        },
        "presentationId": "world-object:background-prop"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-01-02:counterweight-stalled"
        ],
        "gameplay": false,
        "id": "sector-01-02:counterweight-visual",
        "kind": "background-prop",
        "position": {
          "x": -544,
          "y": -480
        },
        "presentationId": "world-object:background-prop"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-02:gate",
        "id": "sector-01-02:exit-gate",
        "kind": "gate",
        "position": {
          "x": -192,
          "y": -832
        },
        "presentationId": "world-object:gate"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-02:gate",
        "id": "sector-01-02:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-01-02:exit-panel-engaged",
        "position": {
          "x": -304,
          "y": -832
        },
        "presentationId": "world-object:gate-panel"
      }
    ],
    "order": 2,
    "recoveryPoints": [
      {
        "id": "sector-01-02:recovery-p1",
        "x": -416,
        "y": -344
      },
      {
        "id": "sector-01-02:recovery-r2",
        "x": 64,
        "y": -680
      }
    ],
    "routePoints": [
      {
        "id": "sector-01-02:route-entry",
        "x": 448,
        "y": -32
      },
      {
        "id": "sector-01-02:route-a",
        "landmark": "A",
        "x": 224,
        "y": -192
      },
      {
        "id": "sector-01-02:route-airborne-c-window",
        "x": -208,
        "y": -350
      },
      {
        "id": "sector-01-02:route-c",
        "landmark": "C",
        "x": -320,
        "y": -560
      },
      {
        "id": "sector-01-02:route-p2",
        "x": 64,
        "y": -704
      },
      {
        "id": "sector-01-02:route-p3",
        "x": -160,
        "y": -768
      },
      {
        "id": "sector-01-02:route-final-deck",
        "x": -352,
        "y": -832
      }
    ],
    "routes": [
      "safe",
      "flow",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-01",
    "storyTriggers": [],
    "subtitle": "LIFT BYPASS",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-02:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 400,
          "y": 0
        },
        "vertices": [
          {
            "x": 192,
            "y": 0
          },
          {
            "x": 608,
            "y": 0
          },
          {
            "x": 608,
            "y": 32
          },
          {
            "x": 192,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-02:p1",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -416,
          "y": -320
        },
        "vertices": [
          {
            "x": -528,
            "y": -320
          },
          {
            "x": -304,
            "y": -320
          },
          {
            "x": -304,
            "y": -304
          },
          {
            "x": -528,
            "y": -304
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-02:p3",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -60,
          "y": -720
        },
        "vertices": [
          {
            "x": -220,
            "y": -720
          },
          {
            "x": 100,
            "y": -720
          },
          {
            "x": 100,
            "y": -696
          },
          {
            "x": -220,
            "y": -696
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-02:dead-lift-cage",
        "kind": "dead-lift-cage",
        "oneWay": false,
        "position": {
          "x": 175,
          "y": -600
        },
        "vertices": [
          {
            "x": -49,
            "y": -600
          },
          {
            "x": 399,
            "y": -600
          },
          {
            "x": 399,
            "y": -280
          },
          {
            "x": -49,
            "y": -280
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-02:counterweight-tower",
        "kind": "counterweight-tower",
        "oneWay": false,
        "position": {
          "x": -595,
          "y": -705
        },
        "vertices": [
          {
            "x": -643,
            "y": -705
          },
          {
            "x": -547,
            "y": -705
          },
          {
            "x": -547,
            "y": -257
          },
          {
            "x": -643,
            "y": -257
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-02:hoist-casing-left",
        "kind": "hoist-casing",
        "oneWay": false,
        "position": {
          "x": -816,
          "y": -960
        },
        "vertices": [
          {
            "x": -832,
            "y": -960
          },
          {
            "x": -800,
            "y": -960
          },
          {
            "x": -800,
            "y": 0
          },
          {
            "x": -832,
            "y": 0
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-02:hoist-casing-right",
        "kind": "hoist-casing",
        "oneWay": false,
        "position": {
          "x": 816,
          "y": -960
        },
        "vertices": [
          {
            "x": 800,
            "y": -960
          },
          {
            "x": 832,
            "y": -960
          },
          {
            "x": 832,
            "y": 0
          },
          {
            "x": 800,
            "y": 0
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-02:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -352,
          "y": -832
        },
        "vertices": [
          {
            "x": -544,
            "y": -832
          },
          {
            "x": -160,
            "y": -832
          },
          {
            "x": -160,
            "y": -800
          },
          {
            "x": -544,
            "y": -800
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
  "schemaVersion": "area-spec-v2",
  "stage": {
    "id": "1-2",
    "sector": 1,
    "sourceAreaId": "sector-01-02",
    "stage": 2
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
