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
        "x": 224,
        "y": -192
      },
      "objectIndex": 2,
      "surfaceIndex": 10,
      "target": {
        "id": "sector-01-02:anchor-a-surface",
        "properties": {},
        "x": 224,
        "y": -192
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
        "x": -320,
        "y": -560
      },
      "objectIndex": 3,
      "surfaceIndex": 11,
      "target": {
        "id": "sector-01-02:anchor-c-surface",
        "properties": {},
        "x": -320,
        "y": -560
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
        "maxY": -224,
        "minY": -448,
        "mobileZoom": 0.7
      },
      {
        "desktopZoom": 0.9,
        "id": "airborne-reattach",
        "maxY": -448,
        "minY": -640,
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
        "bounds": {
          "height": 96,
          "width": 320,
          "x": -512,
          "y": -864
        },
        "id": "sector-01-02:final-deck-reached",
        "type": "reach"
      },
      {
        "id": "sector-01-02:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-01-02:final-deck-reached"
        ],
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
          "x": 128,
          "y": -448
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
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-01-02:final-deck-reached"
        ]
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
          "x": 416,
          "y": 0
        },
        "vertices": [
          {
            "x": 192,
            "y": 0
          },
          {
            "x": 640,
            "y": 0
          },
          {
            "x": 640,
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
        "id": "sector-01-02:r2",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 64,
          "y": -656
        },
        "vertices": [
          {
            "x": -48,
            "y": -656
          },
          {
            "x": 176,
            "y": -656
          },
          {
            "x": 176,
            "y": -640
          },
          {
            "x": -48,
            "y": -640
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-02:p2",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 64,
          "y": -704
        },
        "vertices": [
          {
            "x": -64,
            "y": -704
          },
          {
            "x": 192,
            "y": -704
          },
          {
            "x": 192,
            "y": -688
          },
          {
            "x": -64,
            "y": -688
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
          "x": -160,
          "y": -768
        },
        "vertices": [
          {
            "x": -320,
            "y": -768
          },
          {
            "x": 0,
            "y": -768
          },
          {
            "x": 0,
            "y": -744
          },
          {
            "x": -320,
            "y": -744
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
          "x": 128,
          "y": -608
        },
        "vertices": [
          {
            "x": -96,
            "y": -608
          },
          {
            "x": 352,
            "y": -608
          },
          {
            "x": 352,
            "y": -288
          },
          {
            "x": -96,
            "y": -288
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": false,
        "id": "sector-01-02:counterweight-tower",
        "kind": "counterweight-tower",
        "oneWay": false,
        "position": {
          "x": -544,
          "y": -704
        },
        "vertices": [
          {
            "x": -592,
            "y": -704
          },
          {
            "x": -496,
            "y": -704
          },
          {
            "x": -496,
            "y": -256
          },
          {
            "x": -592,
            "y": -256
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": false,
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
        "grappleable": false,
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
    "legacyStageAlias": "1-2",
    "sector": 1,
    "sourceAreaId": "sector-01-02",
    "stage": 2
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
