// GENERATED FILE - DO NOT EDIT
// Source: 2-4 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "2-4";
export const GENERATED_AREA_ID = "sector-02-04";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1088,
      "width": 1984
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "residential-stack",
      "multi-route",
      "patrol-drone-t1",
      "no-build-lock"
    ],
    "entry": {
      "id": "sector-02-04:entry",
      "x": -864,
      "y": -32
    },
    "exit": {
      "id": "sector-02-04:exit",
      "x": 848,
      "y": -1024
    },
    "gate": {
      "id": "sector-02-04:gate",
      "nextAreaId": "sector-02-05",
      "requiredObjectiveIds": [
        "sector-02-04:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 822,
        "y": -1054
      }
    },
    "id": "sector-02-04",
    "name": "RESIDENTIAL STACK",
    "nextAreaId": "sector-02-05",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 128,
          "x": 784,
          "y": -1056
        },
        "id": "sector-02-04:exit-reached",
        "type": "reach"
      },
      {
        "id": "sector-02-04:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-02-04:exit-reached"
        ],
        "sourceObjectId": "sector-02-04:exit-panel",
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
            "height": 288,
            "width": 384
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
        "id": "sector-02-04:route-choice-guard",
        "kind": "sentry",
        "position": {
          "x": 96,
          "y": -352
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
            "x": 288,
            "y": 0
          },
          "size": {
            "height": 448,
            "width": 1216
          }
        },
        "coordinateAnchor": "center",
        "enemyType": "patrol-drone-t1",
        "id": "sector-02-04:drone-1",
        "kind": "patrol-drone",
        "patrol": {
          "mode": "pingpong",
          "points": [
            {
              "x": -128,
              "y": -736
            },
            {
              "x": 544,
              "y": -736
            }
          ],
          "speed": 48,
          "waitSeconds": 0.45
        },
        "position": {
          "x": -128,
          "y": -736
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
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-04:gate",
        "id": "sector-02-04:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-02-04:exit-panel-engaged",
        "position": {
          "x": 736,
          "y": -992
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-02-04:exit-reached"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-04:gate",
        "id": "sector-02-04:exit-gate",
        "kind": "gate",
        "position": {
          "x": 848,
          "y": -992
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 4,
    "recoveryPoints": [
      {
        "id": "sector-02-04:recovery-point-a",
        "x": -224,
        "y": -498
      },
      {
        "id": "sector-02-04:recovery-point-b",
        "x": 64,
        "y": -722
      },
      {
        "id": "sector-02-04:recovery-point-right",
        "x": 416,
        "y": -850
      }
    ],
    "routePoints": [
      {
        "id": "sector-02-04:route-entry",
        "x": -864,
        "y": -32
      },
      {
        "id": "sector-02-04:route-reveal",
        "x": -672,
        "y": -160
      },
      {
        "id": "sector-02-04:route-safe-a-grip",
        "x": -560,
        "y": -320
      },
      {
        "id": "sector-02-04:route-safe-a",
        "x": -672,
        "y": -384
      },
      {
        "id": "sector-02-04:route-safe-x-grip",
        "x": -352,
        "y": -480
      },
      {
        "id": "sector-02-04:route-flow-a-grip",
        "x": -336,
        "y": -352
      },
      {
        "id": "sector-02-04:route-flow-a",
        "x": -176,
        "y": -416
      },
      {
        "id": "sector-02-04:route-press-a-grip",
        "x": -304,
        "y": -256
      },
      {
        "id": "sector-02-04:route-pressure-a",
        "x": 64,
        "y": -352
      },
      {
        "id": "sector-02-04:route-switch",
        "x": -64,
        "y": -544
      },
      {
        "id": "sector-02-04:route-safe-b-grip",
        "x": -352,
        "y": -672
      },
      {
        "id": "sector-02-04:route-safe-b",
        "x": -448,
        "y": -768
      },
      {
        "id": "sector-02-04:route-safe-m1-grip",
        "x": -192,
        "y": -848
      },
      {
        "id": "sector-02-04:route-safe-m2-grip",
        "x": 96,
        "y": -896
      },
      {
        "id": "sector-02-04:route-flow-b1-grip",
        "x": 64,
        "y": -672
      },
      {
        "id": "sector-02-04:route-flow-b2-grip",
        "x": 320,
        "y": -768
      },
      {
        "id": "sector-02-04:route-flow-b",
        "x": 176,
        "y": -832
      },
      {
        "id": "sector-02-04:route-press-b-grip",
        "x": 224,
        "y": -608
      },
      {
        "id": "sector-02-04:route-pressure-b",
        "x": 512,
        "y": -672
      },
      {
        "id": "sector-02-04:route-right-recovery",
        "x": 416,
        "y": -832
      },
      {
        "id": "sector-02-04:route-merge",
        "x": 288,
        "y": -928
      },
      {
        "id": "sector-02-04:route-final-grip",
        "x": 560,
        "y": -960
      },
      {
        "id": "sector-02-04:route-exit",
        "x": 784,
        "y": -1024
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
      "housing-density",
      "route-choice",
      "residential-scale"
    ],
    "subtitle": "MULTI-ROUTE HOUSING",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -816,
          "y": 0
        },
        "vertices": [
          {
            "x": -976,
            "y": 0
          },
          {
            "x": -656,
            "y": 0
          },
          {
            "x": -656,
            "y": 32
          },
          {
            "x": -976,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:reveal-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -672,
          "y": -160
        },
        "vertices": [
          {
            "x": -864,
            "y": -160
          },
          {
            "x": -480,
            "y": -160
          },
          {
            "x": -480,
            "y": -136
          },
          {
            "x": -864,
            "y": -136
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:safe-a",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -672,
          "y": -384
        },
        "vertices": [
          {
            "x": -816,
            "y": -384
          },
          {
            "x": -528,
            "y": -384
          },
          {
            "x": -528,
            "y": -362
          },
          {
            "x": -816,
            "y": -362
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:flow-a",
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
        "id": "sector-02-04:pressure-a",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 64,
          "y": -352
        },
        "vertices": [
          {
            "x": -96,
            "y": -352
          },
          {
            "x": 224,
            "y": -352
          },
          {
            "x": 224,
            "y": -330
          },
          {
            "x": -96,
            "y": -330
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:recovery-a",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -224,
          "y": -480
        },
        "vertices": [
          {
            "x": -400,
            "y": -480
          },
          {
            "x": -48,
            "y": -480
          },
          {
            "x": -48,
            "y": -462
          },
          {
            "x": -400,
            "y": -462
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:switch-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -64,
          "y": -544
        },
        "vertices": [
          {
            "x": -288,
            "y": -544
          },
          {
            "x": 160,
            "y": -544
          },
          {
            "x": 160,
            "y": -518
          },
          {
            "x": -288,
            "y": -518
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:safe-b",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -448,
          "y": -768
        },
        "vertices": [
          {
            "x": -608,
            "y": -768
          },
          {
            "x": -288,
            "y": -768
          },
          {
            "x": -288,
            "y": -746
          },
          {
            "x": -608,
            "y": -746
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:flow-b",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 176,
          "y": -832
        },
        "vertices": [
          {
            "x": 48,
            "y": -832
          },
          {
            "x": 304,
            "y": -832
          },
          {
            "x": 304,
            "y": -810
          },
          {
            "x": 48,
            "y": -810
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:pressure-b",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 512,
          "y": -672
        },
        "vertices": [
          {
            "x": 336,
            "y": -672
          },
          {
            "x": 688,
            "y": -672
          },
          {
            "x": 688,
            "y": -650
          },
          {
            "x": 336,
            "y": -650
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:recovery-b",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 64,
          "y": -704
        },
        "vertices": [
          {
            "x": -112,
            "y": -704
          },
          {
            "x": 240,
            "y": -704
          },
          {
            "x": 240,
            "y": -686
          },
          {
            "x": -112,
            "y": -686
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:right-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 416,
          "y": -832
        },
        "vertices": [
          {
            "x": 272,
            "y": -832
          },
          {
            "x": 560,
            "y": -832
          },
          {
            "x": 560,
            "y": -814
          },
          {
            "x": 272,
            "y": -814
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:merge-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 288,
          "y": -928
        },
        "vertices": [
          {
            "x": 32,
            "y": -928
          },
          {
            "x": 544,
            "y": -928
          },
          {
            "x": 544,
            "y": -902
          },
          {
            "x": 32,
            "y": -902
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-04:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 720,
          "y": -992
        },
        "vertices": [
          {
            "x": 560,
            "y": -992
          },
          {
            "x": 880,
            "y": -992
          },
          {
            "x": 880,
            "y": -960
          },
          {
            "x": 560,
            "y": -960
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-04:g-safe-a-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -560,
          "y": -320
        },
        "renderable": false,
        "vertices": [
          {
            "x": -572,
            "y": -332
          },
          {
            "x": -548,
            "y": -332
          },
          {
            "x": -548,
            "y": -308
          },
          {
            "x": -572,
            "y": -308
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-04:g-safe-x-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -352,
          "y": -480
        },
        "renderable": false,
        "vertices": [
          {
            "x": -364,
            "y": -492
          },
          {
            "x": -340,
            "y": -492
          },
          {
            "x": -340,
            "y": -468
          },
          {
            "x": -364,
            "y": -468
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-04:g-flow-a-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -336,
          "y": -352
        },
        "renderable": false,
        "vertices": [
          {
            "x": -348,
            "y": -364
          },
          {
            "x": -324,
            "y": -364
          },
          {
            "x": -324,
            "y": -340
          },
          {
            "x": -348,
            "y": -340
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-04:g-press-a-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -304,
          "y": -256
        },
        "renderable": false,
        "vertices": [
          {
            "x": -316,
            "y": -268
          },
          {
            "x": -292,
            "y": -268
          },
          {
            "x": -292,
            "y": -244
          },
          {
            "x": -316,
            "y": -244
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-04:g-safe-b-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -352,
          "y": -672
        },
        "renderable": false,
        "vertices": [
          {
            "x": -364,
            "y": -684
          },
          {
            "x": -340,
            "y": -684
          },
          {
            "x": -340,
            "y": -660
          },
          {
            "x": -364,
            "y": -660
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-04:g-safe-m1-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -192,
          "y": -848
        },
        "renderable": false,
        "vertices": [
          {
            "x": -204,
            "y": -860
          },
          {
            "x": -180,
            "y": -860
          },
          {
            "x": -180,
            "y": -836
          },
          {
            "x": -204,
            "y": -836
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-04:g-safe-m2-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 96,
          "y": -896
        },
        "renderable": false,
        "vertices": [
          {
            "x": 84,
            "y": -908
          },
          {
            "x": 108,
            "y": -908
          },
          {
            "x": 108,
            "y": -884
          },
          {
            "x": 84,
            "y": -884
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-04:g-flow-b1-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 64,
          "y": -672
        },
        "renderable": false,
        "vertices": [
          {
            "x": 52,
            "y": -684
          },
          {
            "x": 76,
            "y": -684
          },
          {
            "x": 76,
            "y": -660
          },
          {
            "x": 52,
            "y": -660
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-04:g-flow-b2-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 320,
          "y": -768
        },
        "renderable": false,
        "vertices": [
          {
            "x": 308,
            "y": -780
          },
          {
            "x": 332,
            "y": -780
          },
          {
            "x": 332,
            "y": -756
          },
          {
            "x": 308,
            "y": -756
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-04:g-press-b-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 224,
          "y": -608
        },
        "renderable": false,
        "vertices": [
          {
            "x": 212,
            "y": -620
          },
          {
            "x": 236,
            "y": -620
          },
          {
            "x": 236,
            "y": -596
          },
          {
            "x": 212,
            "y": -596
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-04:g-final-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 560,
          "y": -960
        },
        "renderable": false,
        "vertices": [
          {
            "x": 548,
            "y": -972
          },
          {
            "x": 572,
            "y": -972
          },
          {
            "x": 572,
            "y": -948
          },
          {
            "x": 548,
            "y": -948
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
    "id": "2-4",
    "sector": 2,
    "sourceAreaId": "sector-02-04",
    "stage": 4
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
