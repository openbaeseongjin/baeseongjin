// GENERATED FILE - DO NOT EDIT
// Source: 2-7 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "2-7";
export const GENERATED_AREA_ID = "sector-02-07";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-02-07:editor-anchor-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "NEW"
        },
        "x": 175,
        "y": -1105
      },
      "target": {
        "id": "sector-02-07:editor-anchor-1-surface",
        "properties": {},
        "x": 175,
        "y": -1105
      }
    },
    {
      "landmark": {
        "id": "sector-02-07:editor-anchor-2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "NEW"
        },
        "x": 400,
        "y": -1135
      },
      "target": {
        "id": "sector-02-07:editor-anchor-2-surface",
        "properties": {},
        "x": 400,
        "y": -1135
      }
    },
    {
      "landmark": {
        "id": "sector-02-07:editor-anchor-3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "NEW"
        },
        "x": -125,
        "y": -545
      },
      "target": {
        "id": "sector-02-07:editor-anchor-3-surface",
        "properties": {},
        "x": -125,
        "y": -545
      }
    }
  ],
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
        "id": "sector-02-07:exit-panel-engaged",
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
          "x": -275,
          "y": -375
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
          "x": 200,
          "y": -845
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
          "x": -275,
          "y": -840
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
        "presentationId": "world-object:gate-panel"
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
          "x": -505,
          "y": -195
        },
        "vertices": [
          {
            "x": -593,
            "y": -195
          },
          {
            "x": -417,
            "y": -195
          },
          {
            "x": -417,
            "y": -173
          },
          {
            "x": -593,
            "y": -173
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
          "x": -5,
          "y": -230
        },
        "vertices": [
          {
            "x": -133,
            "y": -230
          },
          {
            "x": 123,
            "y": -230
          },
          {
            "x": 123,
            "y": -212
          },
          {
            "x": -133,
            "y": -212
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
          "x": -390,
          "y": -440
        },
        "vertices": [
          {
            "x": -470,
            "y": -440
          },
          {
            "x": -310,
            "y": -440
          },
          {
            "x": -310,
            "y": -418
          },
          {
            "x": -470,
            "y": -418
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
          "x": -280,
          "y": -720
        },
        "vertices": [
          {
            "x": -360,
            "y": -720
          },
          {
            "x": -200,
            "y": -720
          },
          {
            "x": -200,
            "y": -700
          },
          {
            "x": -360,
            "y": -700
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
          "x": 330,
          "y": -850
        },
        "vertices": [
          {
            "x": 258,
            "y": -850
          },
          {
            "x": 402,
            "y": -850
          },
          {
            "x": 402,
            "y": -828
          },
          {
            "x": 258,
            "y": -828
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
          "x": -60,
          "y": -950
        },
        "vertices": [
          {
            "x": -140,
            "y": -950
          },
          {
            "x": 20,
            "y": -950
          },
          {
            "x": 20,
            "y": -932
          },
          {
            "x": -140,
            "y": -932
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
    "id": "2-7",
    "sector": 2,
    "sourceAreaId": "sector-02-07",
    "stage": 7
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
