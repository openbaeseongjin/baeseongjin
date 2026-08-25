// GENERATED FILE - DO NOT EDIT
// Source: 2-4 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "2-4";
export const GENERATED_AREA_ID = "sector-02-04";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-02-04:editor-anchor-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "NEW"
        },
        "x": 380,
        "y": -905
      },
      "target": {
        "id": "sector-02-04:editor-anchor-1-surface",
        "properties": {},
        "x": 380,
        "y": -905
      }
    }
  ],
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
        "id": "sector-02-04:exit-panel-engaged",
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
          "x": -440,
          "y": -300
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
          "x": -5,
          "y": -640
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
        "presentationId": "world-object:gate-panel"
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
      },
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 160
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
        "id": "sector-02-04:route-guard-01",
        "kind": "sentry",
        "position": {
          "x": 368,
          "y": -1008
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
        ]
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
        "id": "sector-02-04:flow-a",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -215,
          "y": -310
        },
        "vertices": [
          {
            "x": -343,
            "y": -310
          },
          {
            "x": -87,
            "y": -310
          },
          {
            "x": -87,
            "y": -288
          },
          {
            "x": -343,
            "y": -288
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
          "x": 85,
          "y": -470
        },
        "vertices": [
          {
            "x": -139,
            "y": -470
          },
          {
            "x": 309,
            "y": -470
          },
          {
            "x": 309,
            "y": -444
          },
          {
            "x": -139,
            "y": -444
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
          "x": 100,
          "y": -755
        },
        "vertices": [
          {
            "x": -28,
            "y": -755
          },
          {
            "x": 228,
            "y": -755
          },
          {
            "x": 228,
            "y": -733
          },
          {
            "x": -28,
            "y": -733
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
          "x": 670,
          "y": -595
        },
        "vertices": [
          {
            "x": 494,
            "y": -595
          },
          {
            "x": 846,
            "y": -595
          },
          {
            "x": 846,
            "y": -573
          },
          {
            "x": 494,
            "y": -573
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
    "id": "2-4",
    "sector": 2,
    "sourceAreaId": "sector-02-04",
    "stage": 4
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
