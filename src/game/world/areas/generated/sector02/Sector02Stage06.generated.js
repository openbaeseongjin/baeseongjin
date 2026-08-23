// GENERATED FILE - DO NOT EDIT
// Source: 2-6 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "2-6";
export const GENERATED_AREA_ID = "sector-02-06";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-02-06:g1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G1",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -704,
        "y": -224
      },
      "objectIndex": 0,
      "surfaceIndex": 10,
      "target": {
        "id": "sector-02-06:g1-surface",
        "properties": {},
        "x": -704,
        "y": -224
      }
    },
    {
      "landmark": {
        "id": "sector-02-06:g2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G2",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -608,
        "y": -480
      },
      "objectIndex": 1,
      "surfaceIndex": 11,
      "target": {
        "id": "sector-02-06:g2-surface",
        "properties": {},
        "x": -608,
        "y": -480
      }
    },
    {
      "landmark": {
        "id": "sector-02-06:g3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G3",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 192,
        "y": -576
      },
      "objectIndex": 2,
      "surfaceIndex": 12,
      "target": {
        "id": "sector-02-06:g3-surface",
        "properties": {},
        "x": 192,
        "y": -576
      }
    },
    {
      "landmark": {
        "id": "sector-02-06:g4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G4",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 640,
        "y": -608
      },
      "objectIndex": 3,
      "surfaceIndex": 13,
      "target": {
        "id": "sector-02-06:g4-surface",
        "properties": {},
        "x": 640,
        "y": -608
      }
    }
  ],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 832,
      "width": 1920
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "quiet-residential-void",
      "residential-scale",
      "delayed-security",
      "visual-relief"
    ],
    "entry": {
      "id": "sector-02-06:entry",
      "x": -816,
      "y": -32
    },
    "exit": {
      "id": "sector-02-06:exit",
      "x": 896,
      "y": -672
    },
    "gate": {
      "id": "sector-02-06:gate",
      "nextAreaId": "sector-02-07",
      "requiredObjectiveIds": [
        "sector-02-06:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 870,
        "y": -702
      }
    },
    "id": "sector-02-06",
    "name": "QUIET RESIDENTIAL VOID",
    "nextAreaId": "sector-02-07",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 128,
          "x": 832,
          "y": -704
        },
        "id": "sector-02-06:exit-reached",
        "type": "reach"
      },
      {
        "id": "sector-02-06:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-02-06:exit-reached"
        ],
        "sourceObjectId": "sector-02-06:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 160,
            "width": 320
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "patrol-drone-t1",
            "shield-drone-t1",
            "support-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-02-06:courtyard-left-guard",
        "kind": "sentry",
        "position": {
          "x": 352,
          "y": -544
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
            "height": 160,
            "width": 352
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "support-drone-t1",
            "artillery-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-02-06:courtyard-right-guard",
        "kind": "sentry",
        "position": {
          "x": 704,
          "y": -576
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
        ]
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "residential-scale",
          "quiet-void"
        ],
        "gameplayCollision": false,
        "id": "sector-02-06:courtyard-void",
        "kind": "background-prop",
        "position": {
          "x": -160,
          "y": -560
        },
        "presentationId": "world-object:background-prop"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-06:gate",
        "id": "sector-02-06:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-02-06:exit-panel-engaged",
        "position": {
          "x": 784,
          "y": -640
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-02-06:exit-reached"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-06:gate",
        "id": "sector-02-06:exit-gate",
        "kind": "gate",
        "position": {
          "x": 896,
          "y": -640
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 6,
    "recoveryPoints": [
      {
        "id": "sector-02-06:recovery-point-a",
        "x": 128,
        "y": -402
      },
      {
        "id": "sector-02-06:recovery-point-b",
        "x": 512,
        "y": -466
      }
    ],
    "routePoints": [
      {
        "id": "sector-02-06:route-entry",
        "x": -816,
        "y": -32
      },
      {
        "id": "sector-02-06:route-g1",
        "landmark": "G1",
        "x": -704,
        "y": -224
      },
      {
        "id": "sector-02-06:route-lift-landing",
        "x": -640,
        "y": -288
      },
      {
        "id": "sector-02-06:route-g2",
        "landmark": "G2",
        "x": -608,
        "y": -480
      },
      {
        "id": "sector-02-06:route-reveal-overlook",
        "x": -448,
        "y": -512
      },
      {
        "id": "sector-02-06:route-quiet-upper-rim-edge",
        "x": 32,
        "y": -512
      },
      {
        "id": "sector-02-06:route-g3",
        "landmark": "G3",
        "x": 192,
        "y": -576
      },
      {
        "id": "sector-02-06:route-rim-landing-a",
        "x": 320,
        "y": -544
      },
      {
        "id": "sector-02-06:route-rim-transfer",
        "x": 480,
        "y": -544
      },
      {
        "id": "sector-02-06:route-g4",
        "landmark": "G4",
        "x": 640,
        "y": -608
      },
      {
        "id": "sector-02-06:route-final-rim",
        "x": 736,
        "y": -576
      },
      {
        "id": "sector-02-06:route-exit",
        "x": 832,
        "y": -672
      }
    ],
    "routes": [
      "main",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-02",
    "storyTriggers": [
      "quiet-courtyard",
      "residential-scale",
      "upper-route-preview"
    ],
    "subtitle": "RESIDENTIAL SCALE REVEAL",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-06:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -800,
          "y": 0
        },
        "vertices": [
          {
            "x": -960,
            "y": 0
          },
          {
            "x": -640,
            "y": 0
          },
          {
            "x": -640,
            "y": 32
          },
          {
            "x": -960,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-06:lift-landing",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -640,
          "y": -288
        },
        "vertices": [
          {
            "x": -768,
            "y": -288
          },
          {
            "x": -512,
            "y": -288
          },
          {
            "x": -512,
            "y": -266
          },
          {
            "x": -768,
            "y": -266
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-06:reveal-overlook",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -448,
          "y": -512
        },
        "vertices": [
          {
            "x": -640,
            "y": -512
          },
          {
            "x": -256,
            "y": -512
          },
          {
            "x": -256,
            "y": -488
          },
          {
            "x": -640,
            "y": -488
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-06:quiet-upper-rim",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -128,
          "y": -512
        },
        "vertices": [
          {
            "x": -288,
            "y": -512
          },
          {
            "x": 32,
            "y": -512
          },
          {
            "x": 32,
            "y": -488
          },
          {
            "x": -288,
            "y": -488
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-06:rim-landing-a",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 320,
          "y": -544
        },
        "vertices": [
          {
            "x": 192,
            "y": -544
          },
          {
            "x": 448,
            "y": -544
          },
          {
            "x": 448,
            "y": -522
          },
          {
            "x": 192,
            "y": -522
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-06:recovery-a",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 128,
          "y": -384
        },
        "vertices": [
          {
            "x": 0,
            "y": -384
          },
          {
            "x": 256,
            "y": -384
          },
          {
            "x": 256,
            "y": -366
          },
          {
            "x": 0,
            "y": -366
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-06:rim-transfer",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 480,
          "y": -544
        },
        "vertices": [
          {
            "x": 368,
            "y": -544
          },
          {
            "x": 592,
            "y": -544
          },
          {
            "x": 592,
            "y": -522
          },
          {
            "x": 368,
            "y": -522
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-06:recovery-b",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 512,
          "y": -448
        },
        "vertices": [
          {
            "x": 400,
            "y": -448
          },
          {
            "x": 624,
            "y": -448
          },
          {
            "x": 624,
            "y": -430
          },
          {
            "x": 400,
            "y": -430
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-06:final-residential-rim",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 736,
          "y": -576
        },
        "vertices": [
          {
            "x": 576,
            "y": -576
          },
          {
            "x": 896,
            "y": -576
          },
          {
            "x": 896,
            "y": -554
          },
          {
            "x": 576,
            "y": -554
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-06:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 800,
          "y": -640
        },
        "vertices": [
          {
            "x": 672,
            "y": -640
          },
          {
            "x": 928,
            "y": -640
          },
          {
            "x": 928,
            "y": -608
          },
          {
            "x": 672,
            "y": -608
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
    "id": "2-6",
    "sector": 2,
    "sourceAreaId": "sector-02-06",
    "stage": 6
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
