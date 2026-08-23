// GENERATED FILE - DO NOT EDIT
// Source: 3-1 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "3-1";
export const GENERATED_AREA_ID = "sector-03-01";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-03-01:g1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g1"
        },
        "x": -1184,
        "y": -192
      },
      "target": {
        "id": "sector-03-01:g1-surface",
        "properties": {
          "sourceId": "g1"
        },
        "x": -1184,
        "y": -192
      }
    },
    {
      "landmark": {
        "id": "sector-03-01:g2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G2",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g2"
        },
        "x": -640,
        "y": -416
      },
      "target": {
        "id": "sector-03-01:g2-surface",
        "properties": {
          "sourceId": "g2"
        },
        "x": -640,
        "y": -416
      }
    },
    {
      "landmark": {
        "id": "sector-03-01:g3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G3",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g3"
        },
        "x": 416,
        "y": -640
      },
      "target": {
        "id": "sector-03-01:g3-surface",
        "properties": {
          "sourceId": "g3"
        },
        "x": 416,
        "y": -640
      }
    },
    {
      "landmark": {
        "id": "sector-03-01:g4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G4",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g4"
        },
        "x": 1184,
        "y": -672
      },
      "target": {
        "id": "sector-03-01:g4-surface",
        "properties": {
          "sourceId": "g4"
        },
        "x": 1184,
        "y": -672
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1088,
      "width": 3072
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "powered-promenade",
      "commercial-threshold"
    ],
    "entry": {
      "id": "sector-03-01:entry",
      "x": -1392,
      "y": -32
    },
    "exit": {
      "id": "sector-03-01:exit",
      "x": 1440,
      "y": -832
    },
    "gate": {
      "id": "sector-03-01:gate",
      "nextAreaId": "sector-03-02",
      "requiredObjectiveIds": [
        "sector-03-01:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 1414,
        "y": -862
      }
    },
    "id": "sector-03-01",
    "name": "LOWER MARKET PROMENADE",
    "nextAreaId": "sector-03-02",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 320,
          "x": 1152,
          "y": -832
        },
        "id": "sector-03-01:final-deck-reached",
        "type": "reach"
      },
      {
        "id": "sector-03-01:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-03-01:final-deck-reached"
        ],
        "sourceObjectId": "sector-03-01:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-01:district-sign"
        ],
        "id": "sector-03-01:district-sign",
        "kind": "story-display",
        "position": {
          "x": -1026,
          "y": -286
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-01:welcome-kiosk"
        ],
        "id": "sector-03-01:welcome-kiosk",
        "kind": "story-display",
        "position": {
          "x": -112,
          "y": -610
        },
        "presentationId": "world-object:story-display"
      },
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 192,
            "width": 384
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "artillery-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-03-01:promenade-guard",
        "kind": "sentry",
        "position": {
          "x": 944,
          "y": -416
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-01:gate",
        "id": "sector-03-01:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-03-01:exit-panel-engaged",
        "position": {
          "x": 1360,
          "y": -800
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-01:gate",
        "id": "sector-03-01:exit-gate",
        "kind": "gate",
        "position": {
          "x": 1440,
          "y": -800
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 1,
    "recoveryPoints": [
      {
        "id": "sector-03-01:recovery-recovery-a",
        "sourceId": "recovery-a",
        "x": -576,
        "y": -194
      },
      {
        "id": "sector-03-01:recovery-recovery-b",
        "sourceId": "recovery-b",
        "x": 384,
        "y": -322
      }
    ],
    "routePoints": [
      {
        "id": "sector-03-01:route-entry",
        "sourceId": "entry",
        "x": -1392,
        "y": -32
      },
      {
        "id": "sector-03-01:route-g1",
        "sourceId": "g1",
        "x": -1184,
        "y": -192
      },
      {
        "id": "sector-03-01:route-p1",
        "sourceId": "p1",
        "x": -1056,
        "y": -224
      },
      {
        "id": "sector-03-01:route-g2",
        "sourceId": "g2",
        "x": -640,
        "y": -416
      },
      {
        "id": "sector-03-01:route-island-left-edge",
        "sourceId": "island-left-edge",
        "x": -384,
        "y": -544
      },
      {
        "id": "sector-03-01:route-island-centre",
        "sourceId": "island-centre",
        "x": -128,
        "y": -544
      },
      {
        "id": "sector-03-01:route-island-right-edge",
        "sourceId": "island-right-edge",
        "x": 128,
        "y": -544
      },
      {
        "id": "sector-03-01:route-g3",
        "sourceId": "g3",
        "x": 416,
        "y": -640
      },
      {
        "id": "sector-03-01:route-p3-left-edge",
        "sourceId": "p3-left-edge",
        "x": 704,
        "y": -416
      },
      {
        "id": "sector-03-01:route-p3",
        "sourceId": "p3",
        "x": 896,
        "y": -416
      },
      {
        "id": "sector-03-01:route-g4",
        "sourceId": "g4",
        "x": 1184,
        "y": -672
      },
      {
        "id": "sector-03-01:route-exit",
        "sourceId": "exit",
        "x": 1376,
        "y": -832
      }
    ],
    "routes": [
      "safe",
      "flow",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-03",
    "storyTriggers": [
      "district-sign",
      "powered-environment",
      "automated-welcome"
    ],
    "subtitle": "COMMERCIAL THRESHOLD",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -1392,
          "y": 0
        },
        "sourceId": "p0",
        "vertices": [
          {
            "x": -1504,
            "y": 0
          },
          {
            "x": -1280,
            "y": 0
          },
          {
            "x": -1280,
            "y": 32
          },
          {
            "x": -1504,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p1-left-market",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1056,
          "y": -224
        },
        "sourceId": "p1-left-market",
        "vertices": [
          {
            "x": -1248,
            "y": -224
          },
          {
            "x": -864,
            "y": -224
          },
          {
            "x": -864,
            "y": -198
          },
          {
            "x": -1248,
            "y": -198
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "recovery-a",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -576,
          "y": -176
        },
        "sourceId": "recovery-a",
        "vertices": [
          {
            "x": -704,
            "y": -176
          },
          {
            "x": -448,
            "y": -176
          },
          {
            "x": -448,
            "y": -158
          },
          {
            "x": -704,
            "y": -158
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p2-suspended-market-island",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -128,
          "y": -544
        },
        "sourceId": "p2-suspended-market-island",
        "vertices": [
          {
            "x": -384,
            "y": -544
          },
          {
            "x": 128,
            "y": -544
          },
          {
            "x": 128,
            "y": -514
          },
          {
            "x": -384,
            "y": -514
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "recovery-b",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 384,
          "y": -304
        },
        "sourceId": "recovery-b",
        "vertices": [
          {
            "x": 256,
            "y": -304
          },
          {
            "x": 512,
            "y": -304
          },
          {
            "x": 512,
            "y": -286
          },
          {
            "x": 256,
            "y": -286
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p3-right-market",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 896,
          "y": -416
        },
        "sourceId": "p3-right-market",
        "vertices": [
          {
            "x": 704,
            "y": -416
          },
          {
            "x": 1088,
            "y": -416
          },
          {
            "x": 1088,
            "y": -390
          },
          {
            "x": 704,
            "y": -390
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1312,
          "y": -800
        },
        "sourceId": "exit-deck",
        "vertices": [
          {
            "x": 1152,
            "y": -800
          },
          {
            "x": 1472,
            "y": -800
          },
          {
            "x": 1472,
            "y": -772
          },
          {
            "x": 1152,
            "y": -772
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
    "id": "3-1",
    "sector": 3,
    "sourceAreaId": "sector-03-01",
    "stage": 1
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
