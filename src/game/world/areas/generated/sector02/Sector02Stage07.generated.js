// GENERATED FILE - DO NOT EDIT
// Source: 2-7 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "2-7";
export const GENERATED_AREA_ID = "sector-02-07";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1312,
      "width": 1792
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "shelter-access",
      "two-patrol-bands",
      "no-crossfire",
      "transfer-suspended"
    ],
    "entry": {
      "id": "sector-02-07:entry",
      "x": -768,
      "y": -32
    },
    "exit": {
      "id": "sector-02-07:exit",
      "x": 736,
      "y": -1280
    },
    "gate": {
      "id": "sector-02-07:gate",
      "nextAreaId": "sector-02-08",
      "requiredObjectiveIds": [
        "sector-02-07:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 710,
        "y": -1310
      }
    },
    "id": "sector-02-07",
    "name": "SHELTER ACCESS",
    "nextAreaId": "sector-02-08",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 128,
          "x": 672,
          "y": -1312
        },
        "id": "sector-02-07:exit-reached",
        "type": "reach"
      },
      {
        "id": "sector-02-07:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-02-07:exit-reached"
        ],
        "sourceObjectId": "sector-02-07:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 80,
            "y": -38
          },
          "size": {
            "height": 448,
            "width": 928
          }
        },
        "coordinateAnchor": "center",
        "enemyType": "patrol-drone-t1",
        "id": "sector-02-07:drone-1",
        "kind": "patrol-drone",
        "patrol": {
          "mode": "pingpong",
          "points": [
            {
              "x": -512,
              "y": -304
            },
            {
              "x": 32,
              "y": -560
            }
          ],
          "speed": 48,
          "waitSeconds": 0.45
        },
        "position": {
          "x": -320,
          "y": -394
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
            "x": 16,
            "y": 0
          },
          "size": {
            "height": 288,
            "width": 704
          }
        },
        "coordinateAnchor": "center",
        "enemyType": "patrol-drone-t1",
        "id": "sector-02-07:drone-2",
        "kind": "patrol-drone",
        "patrol": {
          "mode": "pingpong",
          "points": [
            {
              "x": 32,
              "y": -992
            },
            {
              "x": 448,
              "y": -992
            }
          ],
          "speed": 48,
          "waitSeconds": 0.45
        },
        "position": {
          "x": 272,
          "y": -992
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
        "accessModuleId": "sector-02:access-module:c",
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
        "id": "sector-02-07:shelter-centre-guard",
        "kind": "sentry",
        "position": {
          "x": -256,
          "y": -768
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
          "shelter-capacity-full",
          "evacuation-transfer-suspended",
          "remain-designated-area"
        ],
        "id": "sector-02-07:shelter-status",
        "kind": "story-display",
        "position": {
          "x": 96,
          "y": -736
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-07:gate",
        "id": "sector-02-07:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-02-07:exit-panel-engaged",
        "position": {
          "x": 624,
          "y": -1248
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-02-07:exit-reached"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-07:gate",
        "id": "sector-02-07:exit-gate",
        "kind": "gate",
        "position": {
          "x": 736,
          "y": -1248
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 7,
    "recoveryPoints": [
      {
        "id": "sector-02-07:recovery-point-buttress",
        "x": -128,
        "y": -306
      },
      {
        "id": "sector-02-07:recovery-point-low-mast",
        "x": 512,
        "y": -754
      },
      {
        "id": "sector-02-07:recovery-point-upper-mast",
        "x": -32,
        "y": -914
      }
    ],
    "routePoints": [
      {
        "id": "sector-02-07:route-entry",
        "x": -768,
        "y": -32
      },
      {
        "id": "sector-02-07:route-g1",
        "x": -576,
        "y": -240
      },
      {
        "id": "sector-02-07:route-buttress-a",
        "x": -480,
        "y": -320
      },
      {
        "id": "sector-02-07:route-g2",
        "x": -256,
        "y": -416
      },
      {
        "id": "sector-02-07:route-buttress-b",
        "x": -144,
        "y": -480
      },
      {
        "id": "sector-02-07:route-g3",
        "x": 64,
        "y": -592
      },
      {
        "id": "sector-02-07:route-shelter-core",
        "x": 160,
        "y": -672
      },
      {
        "id": "sector-02-07:route-story-core-right-edge",
        "x": 352,
        "y": -672
      },
      {
        "id": "sector-02-07:route-g4",
        "x": 416,
        "y": -800
      },
      {
        "id": "sector-02-07:route-mast-landing-a",
        "x": 448,
        "y": -864
      },
      {
        "id": "sector-02-07:route-g5",
        "x": 128,
        "y": -1056
      },
      {
        "id": "sector-02-07:route-g6",
        "x": 448,
        "y": -1216
      },
      {
        "id": "sector-02-07:route-exit",
        "x": 672,
        "y": -1280
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
      "shelter-capacity-full",
      "transfer-suspended",
      "evacuation-platform-preview"
    ],
    "subtitle": "EVACUATION TRANSFER SUSPENDED",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-07:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -736,
          "y": 0
        },
        "vertices": [
          {
            "x": -896,
            "y": 0
          },
          {
            "x": -576,
            "y": 0
          },
          {
            "x": -576,
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
        "id": "sector-02-07:buttress-a",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -480,
          "y": -320
        },
        "vertices": [
          {
            "x": -568,
            "y": -320
          },
          {
            "x": -392,
            "y": -320
          },
          {
            "x": -392,
            "y": -298
          },
          {
            "x": -568,
            "y": -298
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-07:buttress-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -128,
          "y": -288
        },
        "vertices": [
          {
            "x": -256,
            "y": -288
          },
          {
            "x": 0,
            "y": -288
          },
          {
            "x": 0,
            "y": -270
          },
          {
            "x": -256,
            "y": -270
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-07:buttress-b",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -144,
          "y": -480
        },
        "vertices": [
          {
            "x": -224,
            "y": -480
          },
          {
            "x": -64,
            "y": -480
          },
          {
            "x": -64,
            "y": -458
          },
          {
            "x": -224,
            "y": -458
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-07:shelter-core",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 160,
          "y": -672
        },
        "vertices": [
          {
            "x": -32,
            "y": -672
          },
          {
            "x": 352,
            "y": -672
          },
          {
            "x": 352,
            "y": -646
          },
          {
            "x": -32,
            "y": -646
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-07:carrier-alcove",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -256,
          "y": -768
        },
        "vertices": [
          {
            "x": -336,
            "y": -768
          },
          {
            "x": -176,
            "y": -768
          },
          {
            "x": -176,
            "y": -748
          },
          {
            "x": -336,
            "y": -748
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-07:mast-landing-a",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 448,
          "y": -864
        },
        "vertices": [
          {
            "x": 376,
            "y": -864
          },
          {
            "x": 520,
            "y": -864
          },
          {
            "x": 520,
            "y": -842
          },
          {
            "x": 376,
            "y": -842
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-07:low-mast-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 512,
          "y": -736
        },
        "vertices": [
          {
            "x": 432,
            "y": -736
          },
          {
            "x": 592,
            "y": -736
          },
          {
            "x": 592,
            "y": -718
          },
          {
            "x": 432,
            "y": -718
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-07:upper-mast-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -32,
          "y": -896
        },
        "vertices": [
          {
            "x": -112,
            "y": -896
          },
          {
            "x": 48,
            "y": -896
          },
          {
            "x": 48,
            "y": -878
          },
          {
            "x": -112,
            "y": -878
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-02-07:shelter-core-wall",
        "kind": "solid",
        "oneWay": false,
        "position": {
          "x": 376,
          "y": -560
        },
        "vertices": [
          {
            "x": 360,
            "y": -816
          },
          {
            "x": 392,
            "y": -816
          },
          {
            "x": 392,
            "y": -560
          },
          {
            "x": 360,
            "y": -560
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-07:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 640,
          "y": -1248
        },
        "vertices": [
          {
            "x": 512,
            "y": -1248
          },
          {
            "x": 768,
            "y": -1248
          },
          {
            "x": 768,
            "y": -1216
          },
          {
            "x": 512,
            "y": -1216
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-07:g1-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -576,
          "y": -240
        },
        "renderable": false,
        "vertices": [
          {
            "x": -588,
            "y": -252
          },
          {
            "x": -564,
            "y": -252
          },
          {
            "x": -564,
            "y": -228
          },
          {
            "x": -588,
            "y": -228
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-07:g2-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -256,
          "y": -416
        },
        "renderable": false,
        "vertices": [
          {
            "x": -268,
            "y": -428
          },
          {
            "x": -244,
            "y": -428
          },
          {
            "x": -244,
            "y": -404
          },
          {
            "x": -268,
            "y": -404
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-07:g3-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 64,
          "y": -592
        },
        "renderable": false,
        "vertices": [
          {
            "x": 52,
            "y": -604
          },
          {
            "x": 76,
            "y": -604
          },
          {
            "x": 76,
            "y": -580
          },
          {
            "x": 52,
            "y": -580
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-07:access-anchor-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -64,
          "y": -736
        },
        "renderable": false,
        "vertices": [
          {
            "x": -76,
            "y": -748
          },
          {
            "x": -52,
            "y": -748
          },
          {
            "x": -52,
            "y": -724
          },
          {
            "x": -76,
            "y": -724
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-07:g4-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 416,
          "y": -800
        },
        "renderable": false,
        "vertices": [
          {
            "x": 404,
            "y": -812
          },
          {
            "x": 428,
            "y": -812
          },
          {
            "x": 428,
            "y": -788
          },
          {
            "x": 404,
            "y": -788
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-07:g5-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 128,
          "y": -1056
        },
        "renderable": false,
        "vertices": [
          {
            "x": 116,
            "y": -1068
          },
          {
            "x": 140,
            "y": -1068
          },
          {
            "x": 140,
            "y": -1044
          },
          {
            "x": 116,
            "y": -1044
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-07:g6-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 448,
          "y": -1216
        },
        "renderable": false,
        "vertices": [
          {
            "x": 436,
            "y": -1228
          },
          {
            "x": 460,
            "y": -1228
          },
          {
            "x": 460,
            "y": -1204
          },
          {
            "x": 436,
            "y": -1204
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
    "id": "2-7",
    "sector": 2,
    "sourceAreaId": "sector-02-07",
    "stage": 7
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
