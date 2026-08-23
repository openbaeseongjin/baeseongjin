// GENERATED FILE - DO NOT EDIT
// Source: 2-2 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "2-2";
export const GENERATED_AREA_ID = "sector-02-02";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-02-02:g1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G1",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -560,
        "y": -160
      },
      "objectIndex": 0,
      "surfaceIndex": 13,
      "target": {
        "id": "sector-02-02:g1-surface",
        "properties": {},
        "x": -560,
        "y": -160
      }
    },
    {
      "landmark": {
        "id": "sector-02-02:g2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G2",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -240,
        "y": -352
      },
      "objectIndex": 1,
      "surfaceIndex": 14,
      "target": {
        "id": "sector-02-02:g2-surface",
        "properties": {},
        "x": -240,
        "y": -352
      }
    },
    {
      "landmark": {
        "id": "sector-02-02:g4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G4",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 368,
        "y": -448
      },
      "objectIndex": 2,
      "surfaceIndex": 16,
      "target": {
        "id": "sector-02-02:g4-surface",
        "properties": {},
        "x": 368,
        "y": -448
      }
    },
    {
      "landmark": {
        "id": "sector-02-02:g5",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G5",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 608,
        "y": -640
      },
      "objectIndex": 3,
      "surfaceIndex": 17,
      "target": {
        "id": "sector-02-02:g5-surface",
        "properties": {},
        "x": 608,
        "y": -640
      }
    }
  ],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 896,
      "width": 1792
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "patrol-walkway",
      "patrol-drone-t1",
      "security-still-active"
    ],
    "entry": {
      "id": "sector-02-02:entry",
      "x": -768,
      "y": -32
    },
    "exit": {
      "id": "sector-02-02:exit",
      "x": 832,
      "y": -832
    },
    "gate": {
      "id": "sector-02-02:gate",
      "nextAreaId": "sector-02-03",
      "requiredObjectiveIds": [
        "sector-02-02:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 806,
        "y": -862
      }
    },
    "id": "sector-02-02",
    "name": "PATROL WALKWAY",
    "nextAreaId": "sector-02-03",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 128,
          "x": 768,
          "y": -864
        },
        "id": "sector-02-02:exit-reached",
        "type": "reach"
      },
      {
        "id": "sector-02-02:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-02-02:exit-reached"
        ],
        "sourceObjectId": "sector-02-02:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 320,
            "y": 0
          },
          "size": {
            "height": 512,
            "width": 1280
          }
        },
        "coordinateAnchor": "center",
        "enemyType": "patrol-drone-t1",
        "id": "sector-02-02:drone-1",
        "kind": "patrol-drone",
        "patrol": {
          "mode": "pingpong",
          "points": [
            {
              "x": -320,
              "y": -384
            },
            {
              "x": 320,
              "y": -384
            }
          ],
          "speed": 48,
          "waitSeconds": 0.45
        },
        "position": {
          "x": -320,
          "y": -384
        },
        "presentationId": "world-object:patrol-drone",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "target-lock-cycle",
          "activation-band-only"
        ]
      },
      {
        "accessModuleId": "sector-02:access-module:a",
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
            "patrol-drone-t1",
            "pursuit-drone-t1",
            "shield-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-02-02:upper-walkway-guard",
        "kind": "sentry",
        "position": {
          "x": 256,
          "y": -800
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
          "security-patrol-active",
          "residential-transit-restricted"
        ],
        "id": "sector-02-02:security-status",
        "kind": "story-display",
        "position": {
          "x": 608,
          "y": -704
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-02:gate",
        "id": "sector-02-02:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-02-02:exit-panel-engaged",
        "position": {
          "x": 720,
          "y": -800
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-02-02:exit-reached"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-02:gate",
        "id": "sector-02-02:exit-gate",
        "kind": "gate",
        "position": {
          "x": 832,
          "y": -800
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 2,
    "recoveryPoints": [
      {
        "id": "sector-02-02:recovery-point-lower",
        "x": -320,
        "y": -304
      },
      {
        "id": "sector-02-02:recovery-point-middle",
        "x": 64,
        "y": -336
      },
      {
        "id": "sector-02-02:recovery-point-far",
        "x": 400,
        "y": -464
      },
      {
        "id": "sector-02-02:recovery-point-access",
        "x": 416,
        "y": -720
      }
    ],
    "routePoints": [
      {
        "id": "sector-02-02:route-entry",
        "x": -768,
        "y": -32
      },
      {
        "id": "sector-02-02:route-g1",
        "landmark": "G1",
        "x": -560,
        "y": -160
      },
      {
        "id": "sector-02-02:route-observation",
        "x": -464,
        "y": -224
      },
      {
        "id": "sector-02-02:route-g2",
        "landmark": "G2",
        "x": -240,
        "y": -352
      },
      {
        "id": "sector-02-02:route-g3",
        "x": 80,
        "y": -352
      },
      {
        "id": "sector-02-02:route-g4",
        "landmark": "G4",
        "x": 368,
        "y": -448
      },
      {
        "id": "sector-02-02:route-disengage",
        "x": 512,
        "y": -512
      },
      {
        "id": "sector-02-02:route-g5",
        "landmark": "G5",
        "x": 608,
        "y": -640
      },
      {
        "id": "sector-02-02:route-upper-landing",
        "x": 608,
        "y": -704
      },
      {
        "id": "sector-02-02:route-exit",
        "x": 768,
        "y": -832
      }
    ],
    "routes": [
      "safe",
      "flow",
      "pressure",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-02",
    "storyTriggers": [
      "patrol-cycle-reveal",
      "security-still-active"
    ],
    "subtitle": "FIRST MOVING SECURITY",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-02:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -720,
          "y": 0
        },
        "vertices": [
          {
            "x": -896,
            "y": 0
          },
          {
            "x": -544,
            "y": 0
          },
          {
            "x": -544,
            "y": 32
          },
          {
            "x": -896,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-02:observation-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -464,
          "y": -224
        },
        "vertices": [
          {
            "x": -640,
            "y": -224
          },
          {
            "x": -288,
            "y": -224
          },
          {
            "x": -288,
            "y": -200
          },
          {
            "x": -640,
            "y": -200
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-02:recovery-lower",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -320,
          "y": -288
        },
        "vertices": [
          {
            "x": -432,
            "y": -288
          },
          {
            "x": -208,
            "y": -288
          },
          {
            "x": -208,
            "y": -272
          },
          {
            "x": -432,
            "y": -272
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-02:cover-a-deck",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -176,
          "y": -416
        },
        "vertices": [
          {
            "x": -304,
            "y": -416
          },
          {
            "x": -48,
            "y": -416
          },
          {
            "x": -48,
            "y": -394
          },
          {
            "x": -304,
            "y": -394
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-02:recovery-middle",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 64,
          "y": -320
        },
        "vertices": [
          {
            "x": -48,
            "y": -320
          },
          {
            "x": 176,
            "y": -320
          },
          {
            "x": 176,
            "y": -304
          },
          {
            "x": -48,
            "y": -304
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-02:central-deck",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 64,
          "y": -416
        },
        "vertices": [
          {
            "x": -48,
            "y": -416
          },
          {
            "x": 176,
            "y": -416
          },
          {
            "x": 176,
            "y": -394
          },
          {
            "x": -48,
            "y": -394
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-02:recovery-far",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 400,
          "y": -448
        },
        "vertices": [
          {
            "x": 288,
            "y": -448
          },
          {
            "x": 512,
            "y": -448
          },
          {
            "x": 512,
            "y": -432
          },
          {
            "x": 288,
            "y": -432
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-02:disengage-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 512,
          "y": -512
        },
        "vertices": [
          {
            "x": 368,
            "y": -512
          },
          {
            "x": 656,
            "y": -512
          },
          {
            "x": 656,
            "y": -488
          },
          {
            "x": 368,
            "y": -488
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-02:upper-landing",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 608,
          "y": -704
        },
        "vertices": [
          {
            "x": 464,
            "y": -704
          },
          {
            "x": 752,
            "y": -704
          },
          {
            "x": 752,
            "y": -680
          },
          {
            "x": 464,
            "y": -680
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-02:access-carrier-balcony",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 256,
          "y": -800
        },
        "vertices": [
          {
            "x": 144,
            "y": -800
          },
          {
            "x": 368,
            "y": -800
          },
          {
            "x": 368,
            "y": -776
          },
          {
            "x": 144,
            "y": -776
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-02-02:cover-a",
        "kind": "cover",
        "losBlocker": true,
        "oneWay": false,
        "position": {
          "x": -112,
          "y": -352
        },
        "vertices": [
          {
            "x": -152,
            "y": -512
          },
          {
            "x": -72,
            "y": -512
          },
          {
            "x": -72,
            "y": -352
          },
          {
            "x": -152,
            "y": -352
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-02-02:cover-b",
        "kind": "cover",
        "losBlocker": true,
        "oneWay": false,
        "position": {
          "x": 240,
          "y": -352
        },
        "vertices": [
          {
            "x": 200,
            "y": -512
          },
          {
            "x": 280,
            "y": -512
          },
          {
            "x": 280,
            "y": -352
          },
          {
            "x": 200,
            "y": -352
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-02:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 736,
          "y": -800
        },
        "vertices": [
          {
            "x": 608,
            "y": -800
          },
          {
            "x": 864,
            "y": -800
          },
          {
            "x": 864,
            "y": -768
          },
          {
            "x": 608,
            "y": -768
          }
        ]
      },
      {
        "collision": true,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-02:g3-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 80,
          "y": -352
        },
        "renderable": true,
        "vertices": [
          {
            "x": 68,
            "y": -364
          },
          {
            "x": 92,
            "y": -364
          },
          {
            "x": 92,
            "y": -340
          },
          {
            "x": 68,
            "y": -340
          }
        ]
      },
      {
        "collision": true,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-02:access-anchor-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 416,
          "y": -752
        },
        "renderable": true,
        "vertices": [
          {
            "x": 404,
            "y": -764
          },
          {
            "x": 428,
            "y": -764
          },
          {
            "x": 428,
            "y": -740
          },
          {
            "x": 404,
            "y": -740
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
    "id": "2-2",
    "sector": 2,
    "sourceAreaId": "sector-02-02",
    "stage": 2
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
