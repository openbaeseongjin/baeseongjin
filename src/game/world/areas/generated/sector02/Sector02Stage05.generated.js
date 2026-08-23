// GENERATED FILE - DO NOT EDIT
// Source: 2-5 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "2-5";
export const GENERATED_AREA_ID = "sector-02-05";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 704,
      "width": 1984
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "evacuation-walkway",
      "assembly-complete",
      "upper-transit-restricted",
      "maintenance-bypass"
    ],
    "entry": {
      "id": "sector-02-05:entry",
      "x": -864,
      "y": -32
    },
    "exit": {
      "id": "sector-02-05:exit",
      "x": 176,
      "y": -96
    },
    "gate": {
      "id": "sector-02-05:gate",
      "nextAreaId": "sector-02-06",
      "requiredObjectiveIds": [
        "sector-02-05:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 150,
        "y": -126
      }
    },
    "id": "sector-02-05",
    "name": "EVACUATION WALKWAY",
    "nextAreaId": "sector-02-06",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 128,
          "x": 112,
          "y": -128
        },
        "id": "sector-02-05:exit-reached",
        "type": "reach"
      },
      {
        "id": "sector-02-05:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-02-05:exit-reached"
        ],
        "sourceObjectId": "sector-02-05:exit-panel",
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
            "height": 464,
            "width": 320
          }
        },
        "coordinateAnchor": "center",
        "enemyType": "patrol-drone-t1",
        "id": "sector-02-05:drone-1",
        "kind": "patrol-drone",
        "patrol": {
          "mode": "pingpong",
          "points": [
            {
              "x": -288,
              "y": -160
            },
            {
              "x": -288,
              "y": -368
            }
          ],
          "speed": 48,
          "waitSeconds": 0.45
        },
        "position": {
          "x": -288,
          "y": -264
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
            "patrol-drone-t1",
            "shield-drone-t1",
            "support-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-02-05:assembly-guard",
        "kind": "sentry",
        "position": {
          "x": 288,
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
        "accessModuleId": "sector-02:access-module:b",
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 288,
            "width": 320
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
        "id": "sector-02-05:upper-transit-guard",
        "kind": "sentry",
        "position": {
          "x": 208,
          "y": -272
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional-for-stage-exit",
          "kill-required-for-access-module",
          "no-rope-cut",
          "activation-band-only"
        ]
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "upper-transit-restricted",
          "transfer-authorization-pending"
        ],
        "grappleable": false,
        "id": "sector-02-05:upper-transit-gate",
        "kind": "gate",
        "narrativeLock": true,
        "opensInStage": false,
        "position": {
          "x": 788,
          "y": -480
        },
        "presentationId": "world-object:gate"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "assembly-complete",
          "transfer-authorization-pending",
          "upper-transit-restricted"
        ],
        "id": "sector-02-05:evacuation-status",
        "kind": "story-display",
        "position": {
          "x": 608,
          "y": -544
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-05:gate",
        "id": "sector-02-05:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-02-05:exit-panel-engaged",
        "position": {
          "x": 64,
          "y": -64
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-02-05:exit-reached"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-05:gate",
        "id": "sector-02-05:exit-gate",
        "kind": "gate",
        "position": {
          "x": 176,
          "y": -64
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 5,
    "recoveryPoints": [
      {
        "id": "sector-02-05:recovery-point-public",
        "x": -96,
        "y": -210
      },
      {
        "id": "sector-02-05:recovery-point-drop1",
        "x": 688,
        "y": -178
      },
      {
        "id": "sector-02-05:recovery-point-drop2",
        "x": 384,
        "y": -96
      }
    ],
    "routePoints": [
      {
        "id": "sector-02-05:route-entry",
        "x": -864,
        "y": -32
      },
      {
        "id": "sector-02-05:route-assembly",
        "x": -640,
        "y": -128
      },
      {
        "id": "sector-02-05:route-g1",
        "x": -560,
        "y": -224
      },
      {
        "id": "sector-02-05:route-queue-a",
        "x": -448,
        "y": -256
      },
      {
        "id": "sector-02-05:route-g2",
        "x": -192,
        "y": -320
      },
      {
        "id": "sector-02-05:route-g3",
        "x": 160,
        "y": -384
      },
      {
        "id": "sector-02-05:route-g4",
        "x": 512,
        "y": -448
      },
      {
        "id": "sector-02-05:route-story-forecourt",
        "x": 576,
        "y": -480
      },
      {
        "id": "sector-02-05:route-service-hatch",
        "x": 720,
        "y": -558
      },
      {
        "id": "sector-02-05:route-g5",
        "x": 464,
        "y": -336
      },
      {
        "id": "sector-02-05:route-maintenance-shelf",
        "x": 432,
        "y": -272
      },
      {
        "id": "sector-02-05:route-g6",
        "x": 96,
        "y": -96
      },
      {
        "id": "sector-02-05:route-exit",
        "x": 112,
        "y": -96
      }
    ],
    "routes": [
      "main",
      "access",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-02",
    "storyTriggers": [
      "assembly-complete",
      "upper-transit-restricted",
      "maintenance-bypass"
    ],
    "subtitle": "UPPER TRANSIT RESTRICTED",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -832,
          "y": 0
        },
        "vertices": [
          {
            "x": -992,
            "y": 0
          },
          {
            "x": -672,
            "y": 0
          },
          {
            "x": -672,
            "y": 32
          },
          {
            "x": -992,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:assembly-concourse",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -640,
          "y": -128
        },
        "vertices": [
          {
            "x": -832,
            "y": -128
          },
          {
            "x": -448,
            "y": -128
          },
          {
            "x": -448,
            "y": -104
          },
          {
            "x": -832,
            "y": -104
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:queue-shelf-a",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -448,
          "y": -256
        },
        "vertices": [
          {
            "x": -544,
            "y": -256
          },
          {
            "x": -352,
            "y": -256
          },
          {
            "x": -352,
            "y": -236
          },
          {
            "x": -544,
            "y": -236
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:public-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -96,
          "y": -192
        },
        "vertices": [
          {
            "x": -224,
            "y": -192
          },
          {
            "x": 32,
            "y": -192
          },
          {
            "x": 32,
            "y": -174
          },
          {
            "x": -224,
            "y": -174
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:transit-neck",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 160,
          "y": -416
        },
        "vertices": [
          {
            "x": 96,
            "y": -416
          },
          {
            "x": 224,
            "y": -416
          },
          {
            "x": 224,
            "y": -396
          },
          {
            "x": 96,
            "y": -396
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:story-forecourt",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 576,
          "y": -480
        },
        "vertices": [
          {
            "x": 448,
            "y": -480
          },
          {
            "x": 704,
            "y": -480
          },
          {
            "x": 704,
            "y": -456
          },
          {
            "x": 448,
            "y": -456
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:service-hatch-lip",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 720,
          "y": -576
        },
        "vertices": [
          {
            "x": 672,
            "y": -576
          },
          {
            "x": 768,
            "y": -576
          },
          {
            "x": 768,
            "y": -558
          },
          {
            "x": 672,
            "y": -558
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:maintenance-shelf",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 432,
          "y": -272
        },
        "vertices": [
          {
            "x": 368,
            "y": -272
          },
          {
            "x": 496,
            "y": -272
          },
          {
            "x": 496,
            "y": -252
          },
          {
            "x": 368,
            "y": -252
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:drop1-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 688,
          "y": -160
        },
        "vertices": [
          {
            "x": 592,
            "y": -160
          },
          {
            "x": 784,
            "y": -160
          },
          {
            "x": 784,
            "y": -142
          },
          {
            "x": 592,
            "y": -142
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-02-05:drop1-divider",
        "kind": "solid",
        "oneWay": false,
        "position": {
          "x": 532,
          "y": -64
        },
        "vertices": [
          {
            "x": 520,
            "y": -336
          },
          {
            "x": 544,
            "y": -336
          },
          {
            "x": 544,
            "y": -64
          },
          {
            "x": 520,
            "y": -64
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:carrier-alcove",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 208,
          "y": -272
        },
        "vertices": [
          {
            "x": 128,
            "y": -272
          },
          {
            "x": 288,
            "y": -272
          },
          {
            "x": 288,
            "y": -252
          },
          {
            "x": 128,
            "y": -252
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:drop2-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 384,
          "y": -80
        },
        "vertices": [
          {
            "x": 304,
            "y": -80
          },
          {
            "x": 464,
            "y": -80
          },
          {
            "x": 464,
            "y": -64
          },
          {
            "x": 304,
            "y": -64
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-02-05:drop2-divider",
        "kind": "solid",
        "oneWay": false,
        "position": {
          "x": 244,
          "y": 0
        },
        "vertices": [
          {
            "x": 232,
            "y": -176
          },
          {
            "x": 256,
            "y": -176
          },
          {
            "x": 256,
            "y": 0
          },
          {
            "x": 232,
            "y": 0
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-05:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 80,
          "y": -64
        },
        "vertices": [
          {
            "x": -48,
            "y": -64
          },
          {
            "x": 208,
            "y": -64
          },
          {
            "x": 208,
            "y": -32
          },
          {
            "x": -48,
            "y": -32
          }
        ]
      },
      {
        "collision": true,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-05:g1-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -560,
          "y": -224
        },
        "renderable": true,
        "vertices": [
          {
            "x": -572,
            "y": -236
          },
          {
            "x": -548,
            "y": -236
          },
          {
            "x": -548,
            "y": -212
          },
          {
            "x": -572,
            "y": -212
          }
        ]
      },
      {
        "collision": true,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-05:g2-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -192,
          "y": -320
        },
        "renderable": true,
        "vertices": [
          {
            "x": -204,
            "y": -332
          },
          {
            "x": -180,
            "y": -332
          },
          {
            "x": -180,
            "y": -308
          },
          {
            "x": -204,
            "y": -308
          }
        ]
      },
      {
        "collision": true,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-05:g3-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 160,
          "y": -384
        },
        "renderable": true,
        "vertices": [
          {
            "x": 148,
            "y": -396
          },
          {
            "x": 172,
            "y": -396
          },
          {
            "x": 172,
            "y": -372
          },
          {
            "x": 148,
            "y": -372
          }
        ]
      },
      {
        "collision": true,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-05:g4-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 512,
          "y": -448
        },
        "renderable": true,
        "vertices": [
          {
            "x": 500,
            "y": -460
          },
          {
            "x": 524,
            "y": -460
          },
          {
            "x": 524,
            "y": -436
          },
          {
            "x": 500,
            "y": -436
          }
        ]
      },
      {
        "collision": true,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-05:g5-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 464,
          "y": -336
        },
        "renderable": true,
        "vertices": [
          {
            "x": 452,
            "y": -348
          },
          {
            "x": 476,
            "y": -348
          },
          {
            "x": 476,
            "y": -324
          },
          {
            "x": 452,
            "y": -324
          }
        ]
      },
      {
        "collision": true,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-05:access-anchor-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 320,
          "y": -320
        },
        "renderable": true,
        "vertices": [
          {
            "x": 308,
            "y": -332
          },
          {
            "x": 332,
            "y": -332
          },
          {
            "x": 332,
            "y": -308
          },
          {
            "x": 308,
            "y": -308
          }
        ]
      },
      {
        "collision": true,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-05:g6-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 96,
          "y": -96
        },
        "renderable": true,
        "vertices": [
          {
            "x": 84,
            "y": -108
          },
          {
            "x": 108,
            "y": -108
          },
          {
            "x": 108,
            "y": -84
          },
          {
            "x": 84,
            "y": -84
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
    "id": "2-5",
    "sector": 2,
    "sourceAreaId": "sector-02-05",
    "stage": 5
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
