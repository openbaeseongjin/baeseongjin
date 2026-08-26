// GENERATED FILE - DO NOT EDIT
// Source: 2-1 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "2-1";
export const GENERATED_AREA_ID = "sector-02-01";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 832,
      "width": 1472
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "worker-block-12",
      "residential-courtyard",
      "quiet-housing",
      "community-notice"
    ],
    "entry": {
      "id": "sector-02-01:entry",
      "x": -624,
      "y": -32
    },
    "exit": {
      "id": "sector-02-01:exit",
      "x": 658,
      "y": -782
    },
    "gate": {
      "id": "sector-02-01:gate",
      "nextAreaId": "sector-02-02",
      "requiredObjectiveIds": [
        "sector-02-01:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 632,
        "y": -812
      }
    },
    "id": "sector-02-01",
    "name": "WORKER BLOCK 12",
    "nextAreaId": "sector-02-02",
    "objectives": [
      {
        "id": "sector-02-01:exit-panel-engaged",
        "sourceObjectId": "sector-02-01:exit-panel",
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
            "height": 256,
            "width": 384
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "sentry-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-02-01:courtyard-guard",
        "kind": "sentry",
        "position": {
          "x": 65,
          "y": -370
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
        "cueIds": [
          "evacuation-group-c",
          "wait-for-further-instruction"
        ],
        "id": "sector-02-01:community-notice",
        "kind": "story-display",
        "position": {
          "x": 685,
          "y": -755
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-01:gate",
        "id": "sector-02-01:exit-panel",
        "interactionSpec": {
          "anchor": "bottom-center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 144,
            "width": 96
          }
        },
        "kind": "gate-panel",
        "objectiveId": "sector-02-01:exit-panel-engaged",
        "position": {
          "x": 546,
          "y": -750
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-01:gate",
        "id": "sector-02-01:exit-gate",
        "kind": "gate",
        "position": {
          "x": 658,
          "y": -750
        },
        "presentationId": "world-object:gate"
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
            "pursuit-drone-t1",
            "shield-drone-t1"
          ]
        },
        "id": "sector-02-01:route-guard-01",
        "kind": "sentry",
        "position": {
          "x": -304,
          "y": -256
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
            "shield-drone-t1",
            "support-drone-t1"
          ]
        },
        "id": "sector-02-01:route-guard-02",
        "kind": "sentry",
        "position": {
          "x": 400,
          "y": -464
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
        ]
      }
    ],
    "order": 1,
    "recoveryPoints": [
      {
        "id": "sector-02-01:recovery-r1",
        "x": -192,
        "y": -128
      },
      {
        "id": "sector-02-01:recovery-r2",
        "x": 16,
        "y": -224
      },
      {
        "id": "sector-02-01:recovery-r3",
        "x": 160,
        "y": -336
      },
      {
        "id": "sector-02-01:recovery-r4",
        "x": -64,
        "y": -432
      }
    ],
    "routePoints": [
      {
        "id": "sector-02-01:route-entry",
        "x": -624,
        "y": -32
      },
      {
        "id": "sector-02-01:route-lower-alley",
        "x": -448,
        "y": -96
      },
      {
        "id": "sector-02-01:route-anchor-a",
        "landmark": "A",
        "x": -384,
        "y": -176
      },
      {
        "id": "sector-02-01:route-b",
        "x": -96,
        "y": -256
      },
      {
        "id": "sector-02-01:route-small-court",
        "x": 96,
        "y": -288
      },
      {
        "id": "sector-02-01:route-anchor-c",
        "landmark": "C",
        "x": 224,
        "y": -352
      },
      {
        "id": "sector-02-01:route-mid-utility",
        "x": 320,
        "y": -384
      },
      {
        "id": "sector-02-01:route-d",
        "x": 160,
        "y": -464
      },
      {
        "id": "sector-02-01:route-laundry-landing",
        "x": -32,
        "y": -496
      },
      {
        "id": "sector-02-01:route-anchor-e",
        "landmark": "E",
        "x": 160,
        "y": -576
      },
      {
        "id": "sector-02-01:route-f",
        "x": 416,
        "y": -640
      },
      {
        "id": "sector-02-01:route-upper-gallery",
        "x": 480,
        "y": -672
      },
      {
        "id": "sector-02-01:route-story-safe",
        "x": 288,
        "y": -704
      },
      {
        "id": "sector-02-01:route-anchor-g",
        "landmark": "G",
        "x": 416,
        "y": -752
      },
      {
        "id": "sector-02-01:route-exit",
        "x": 594,
        "y": -782
      }
    ],
    "routes": [
      "safe",
      "flow",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-02",
    "storyTriggers": [
      "block-12-entry",
      "lived-in-trace",
      "community-notice"
    ],
    "subtitle": "RESIDENTIAL COURTYARD",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:entry-walk",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -560,
          "y": 0
        },
        "vertices": [
          {
            "x": -736,
            "y": 0
          },
          {
            "x": -384,
            "y": 0
          },
          {
            "x": -384,
            "y": 32
          },
          {
            "x": -736,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:lower-alley",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -190,
          "y": -100
        },
        "vertices": [
          {
            "x": -334,
            "y": -100
          },
          {
            "x": -46,
            "y": -100
          },
          {
            "x": -46,
            "y": -80
          },
          {
            "x": -334,
            "y": -80
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:small-court-landing",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 170,
          "y": -220
        },
        "vertices": [
          {
            "x": 42,
            "y": -220
          },
          {
            "x": 298,
            "y": -220
          },
          {
            "x": 298,
            "y": -198
          },
          {
            "x": 42,
            "y": -198
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:mid-utility-landing",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 315,
          "y": -385
        },
        "vertices": [
          {
            "x": 203,
            "y": -385
          },
          {
            "x": 427,
            "y": -385
          },
          {
            "x": 427,
            "y": -363
          },
          {
            "x": 203,
            "y": -363
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:r4",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -210,
          "y": -370
        },
        "vertices": [
          {
            "x": -314,
            "y": -370
          },
          {
            "x": -106,
            "y": -370
          },
          {
            "x": -106,
            "y": -354
          },
          {
            "x": -314,
            "y": -354
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:laundry-landing",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 20,
          "y": -525
        },
        "vertices": [
          {
            "x": -108,
            "y": -525
          },
          {
            "x": 148,
            "y": -525
          },
          {
            "x": 148,
            "y": -503
          },
          {
            "x": -108,
            "y": -503
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:story-safe-landing",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 360,
          "y": -615
        },
        "vertices": [
          {
            "x": 232,
            "y": -615
          },
          {
            "x": 488,
            "y": -615
          },
          {
            "x": 488,
            "y": -597
          },
          {
            "x": 232,
            "y": -597
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 530,
          "y": -750
        },
        "vertices": [
          {
            "x": 370,
            "y": -750
          },
          {
            "x": 690,
            "y": -750
          },
          {
            "x": 690,
            "y": -718
          },
          {
            "x": 370,
            "y": -718
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
    "id": "2-1",
    "sector": 2,
    "sourceAreaId": "sector-02-01",
    "stage": 1
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
