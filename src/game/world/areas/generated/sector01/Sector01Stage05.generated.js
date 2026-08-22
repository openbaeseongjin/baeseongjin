// GENERATED FILE - DO NOT EDIT
// Source: 1-5 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "1-5";
export const GENERATED_AREA_ID = "sector-01-05";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-01-05:anchor-c",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -704,
        "y": -224
      },
      "objectIndex": 0,
      "surfaceIndex": 9,
      "target": {
        "id": "sector-01-05:anchor-c-surface",
        "properties": {},
        "x": -704,
        "y": -224
      }
    },
    {
      "landmark": {
        "id": "sector-01-05:anchor-g",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -160,
        "y": -768
      },
      "objectIndex": 1,
      "surfaceIndex": 10,
      "target": {
        "id": "sector-01-05:anchor-g-surface",
        "properties": {},
        "x": -160,
        "y": -768
      }
    },
    {
      "landmark": {
        "id": "sector-01-05:relaunch",
        "properties": {
          "coordinateAnchor": "center",
          "label": "RE-LAUNCH",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 544,
        "y": -352
      },
      "objectIndex": 2,
      "surfaceIndex": 13,
      "target": {
        "id": "sector-01-05:relaunch-surface",
        "properties": {},
        "x": 544,
        "y": -352
      }
    },
    {
      "landmark": {
        "id": "sector-01-05:f1",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": -176,
        "y": -384
      },
      "objectIndex": 3,
      "surfaceIndex": 11,
      "target": {
        "id": "sector-01-05:f1-surface",
        "properties": {},
        "x": -176,
        "y": -384
      }
    },
    {
      "landmark": {
        "id": "sector-01-05:f2",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 224,
        "y": -416
      },
      "objectIndex": 4,
      "surfaceIndex": 12,
      "target": {
        "id": "sector-01-05:f2-surface",
        "properties": {},
        "x": 224,
        "y": -416
      }
    },
    {
      "landmark": {
        "id": "sector-01-05:mid-grip",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 352,
        "y": -512
      },
      "objectIndex": 5,
      "surfaceIndex": 14,
      "target": {
        "id": "sector-01-05:mid-grip-surface",
        "properties": {},
        "x": 352,
        "y": -512
      }
    },
    {
      "landmark": {
        "id": "sector-01-05:high-capture",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 192,
        "y": -672
      },
      "objectIndex": 6,
      "surfaceIndex": 15,
      "target": {
        "id": "sector-01-05:high-capture-surface",
        "properties": {},
        "x": 192,
        "y": -672
      }
    },
    {
      "landmark": {
        "id": "sector-01-05:final-grip",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": -576,
        "y": -928
      },
      "objectIndex": 7,
      "surfaceIndex": 16,
      "target": {
        "id": "sector-01-05:final-grip-surface",
        "properties": {},
        "x": -576,
        "y": -928
      }
    }
  ],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1152,
      "width": 2304
    },
    "cameraZones": [
      {
        "desktopZoom": 0.88,
        "id": "launch-span",
        "maxY": 0,
        "minY": -192,
        "mobileZoom": 0.66
      },
      {
        "desktopZoom": 0.96,
        "id": "drop-slot",
        "maxY": -192,
        "minY": -448,
        "mobileZoom": 0.7
      },
      {
        "desktopZoom": 0.92,
        "id": "relaunch",
        "maxY": -448,
        "minY": -704,
        "mobileZoom": 0.68
      },
      {
        "desktopZoom": 0.9,
        "id": "upper-return",
        "maxY": -704,
        "minY": -928,
        "mobileZoom": 0.67
      },
      {
        "desktopZoom": 1.1,
        "id": "exit",
        "maxY": -928,
        "minY": -1152,
        "mobileZoom": 0.76
      }
    ],
    "checkpoints": [],
    "cueIds": [
      "vertical-load-test",
      "security-response-test",
      "cooling-distribution-service-access"
    ],
    "entry": {
      "id": "sector-01-05:entry",
      "x": -896,
      "y": -32
    },
    "exit": {
      "id": "sector-01-05:exit",
      "x": -608,
      "y": -1056
    },
    "gate": {
      "id": "sector-01-05:gate",
      "nextAreaId": "sector-01-06",
      "requiredObjectiveIds": [
        "sector-01-05:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": -634,
        "y": -1086
      }
    },
    "id": "sector-01-05",
    "name": "AUGMENT TEST BAY",
    "nextAreaId": "sector-01-06",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 320,
          "x": -928,
          "y": -1056
        },
        "id": "sector-01-05:final-deck-reached",
        "type": "reach"
      },
      {
        "id": "sector-01-05:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-01-05:final-deck-reached"
        ],
        "sourceObjectId": "sector-01-05:exit-panel",
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
            "height": 320,
            "width": 320
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "sentry-t1",
            "pursuit-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-01-05:low-guard",
        "kind": "sentry",
        "position": {
          "x": 864,
          "y": -160
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut"
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
            "sentry-t1",
            "pursuit-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-01-05:upper-guard",
        "kind": "sentry",
        "position": {
          "x": 96,
          "y": -832
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-05:gate",
        "id": "sector-01-05:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-01-05:exit-panel-engaged",
        "position": {
          "x": -720,
          "y": -1024
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-01-05:final-deck-reached"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-05:gate",
        "id": "sector-01-05:exit-gate",
        "kind": "gate",
        "position": {
          "x": -608,
          "y": -1024
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 5,
    "recoveryPoints": [
      {
        "id": "sector-01-05:recovery-r1",
        "x": 64,
        "y": -280
      },
      {
        "id": "sector-01-05:recovery-low-slot",
        "x": 620,
        "y": -192
      },
      {
        "id": "sector-01-05:recovery-upper-return",
        "x": -416,
        "y": -856
      }
    ],
    "routePoints": [
      {
        "id": "sector-01-05:route-entry",
        "x": -896,
        "y": -32
      },
      {
        "id": "sector-01-05:route-c",
        "landmark": "C",
        "x": -704,
        "y": -224
      },
      {
        "id": "sector-01-05:route-launch",
        "x": -560,
        "y": -320
      },
      {
        "id": "sector-01-05:route-f1",
        "x": -176,
        "y": -384
      },
      {
        "id": "sector-01-05:route-f2",
        "x": 224,
        "y": -416
      },
      {
        "id": "sector-01-05:route-far-right",
        "x": 736,
        "y": -448
      },
      {
        "id": "sector-01-05:route-controlled-drop",
        "x": 736,
        "y": -180
      },
      {
        "id": "sector-01-05:route-low-slot",
        "x": 620,
        "y": -160
      },
      {
        "id": "sector-01-05:route-relaunch",
        "x": 544,
        "y": -352
      },
      {
        "id": "sector-01-05:route-mid-grip",
        "x": 352,
        "y": -512
      },
      {
        "id": "sector-01-05:route-high-capture",
        "x": 192,
        "y": -672
      },
      {
        "id": "sector-01-05:route-g",
        "landmark": "G",
        "x": -160,
        "y": -768
      },
      {
        "id": "sector-01-05:route-upper-return",
        "x": -416,
        "y": -832
      },
      {
        "id": "sector-01-05:route-final-grip",
        "x": -576,
        "y": -928
      },
      {
        "id": "sector-01-05:route-final-deck",
        "x": -768,
        "y": -1024
      }
    ],
    "routes": [
      "base-safe",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-01",
    "storyTriggers": [
      "vertical-load-test",
      "security-response-test",
      "cooling-distribution-service-access"
    ],
    "subtitle": "LIVE CALIBRATION",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-05:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -832,
          "y": 0
        },
        "vertices": [
          {
            "x": -1088,
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
            "x": -1088,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-05:launch-deck",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -560,
          "y": -320
        },
        "vertices": [
          {
            "x": -704,
            "y": -320
          },
          {
            "x": -416,
            "y": -320
          },
          {
            "x": -416,
            "y": -296
          },
          {
            "x": -704,
            "y": -296
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-05:r1",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 64,
          "y": -256
        },
        "vertices": [
          {
            "x": -96,
            "y": -256
          },
          {
            "x": 224,
            "y": -256
          },
          {
            "x": 224,
            "y": -238
          },
          {
            "x": -96,
            "y": -238
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-05:far-right-landing",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 736,
          "y": -448
        },
        "vertices": [
          {
            "x": 576,
            "y": -448
          },
          {
            "x": 896,
            "y": -448
          },
          {
            "x": 896,
            "y": -424
          },
          {
            "x": 576,
            "y": -424
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-05:low-test-slot",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 736,
          "y": -160
        },
        "vertices": [
          {
            "x": 512,
            "y": -160
          },
          {
            "x": 960,
            "y": -160
          },
          {
            "x": 960,
            "y": -128
          },
          {
            "x": 512,
            "y": -128
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-01-05:low-cover",
        "kind": "cover",
        "oneWay": false,
        "position": {
          "x": 608,
          "y": -160
        },
        "vertices": [
          {
            "x": 572,
            "y": -272
          },
          {
            "x": 644,
            "y": -272
          },
          {
            "x": 644,
            "y": -160
          },
          {
            "x": 572,
            "y": -160
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-05:upper-return-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -416,
          "y": -832
        },
        "vertices": [
          {
            "x": -560,
            "y": -832
          },
          {
            "x": -272,
            "y": -832
          },
          {
            "x": -272,
            "y": -812
          },
          {
            "x": -560,
            "y": -812
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-01-05:upper-cover",
        "kind": "cover",
        "oneWay": false,
        "position": {
          "x": -224,
          "y": -832
        },
        "vertices": [
          {
            "x": -256,
            "y": -944
          },
          {
            "x": -192,
            "y": -944
          },
          {
            "x": -192,
            "y": -832
          },
          {
            "x": -256,
            "y": -832
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-05:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -768,
          "y": -1024
        },
        "vertices": [
          {
            "x": -960,
            "y": -1024
          },
          {
            "x": -576,
            "y": -1024
          },
          {
            "x": -576,
            "y": -992
          },
          {
            "x": -960,
            "y": -992
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
    "legacyStageAlias": "1-5",
    "sector": 1,
    "sourceAreaId": "sector-01-05",
    "stage": 5
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
