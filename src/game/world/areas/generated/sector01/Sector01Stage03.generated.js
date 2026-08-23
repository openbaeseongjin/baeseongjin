// GENERATED FILE - DO NOT EDIT
// Source: 1-3 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "1-3";
export const GENERATED_AREA_ID = "sector-01-03";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-01-03:anchor-a",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 64,
        "y": -224
      },
      "objectIndex": 0,
      "surfaceIndex": 14,
      "target": {
        "id": "sector-01-03:anchor-a-surface",
        "properties": {},
        "x": 64,
        "y": -224
      }
    },
    {
      "landmark": {
        "id": "sector-01-03:anchor-c",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -192,
        "y": -752
      },
      "objectIndex": 1,
      "surfaceIndex": 15,
      "target": {
        "id": "sector-01-03:anchor-c-surface",
        "properties": {},
        "x": -192,
        "y": -752
      }
    },
    {
      "landmark": {
        "id": "sector-01-03:access-anchor-a",
        "properties": {
          "coordinateAnchor": "center",
          "label": "ACCESS A",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 512,
        "y": -496
      },
      "objectIndex": 3,
      "surfaceIndex": 16,
      "target": {
        "id": "sector-01-03:access-anchor-a-surface",
        "properties": {},
        "x": 512,
        "y": -496
      }
    },
    {
      "landmark": {
        "id": "sector-01-03:access-anchor-b",
        "properties": {
          "coordinateAnchor": "center",
          "label": "ACCESS B",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 960,
        "y": -608
      },
      "objectIndex": 4,
      "surfaceIndex": 17,
      "target": {
        "id": "sector-01-03:access-anchor-b-surface",
        "properties": {},
        "x": 960,
        "y": -608
      }
    }
  ],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1152,
      "width": 3840
    },
    "cameraZones": [
      {
        "desktopZoom": 1.15,
        "id": "identification",
        "maxY": 0,
        "minY": -224,
        "mobileZoom": 0.78,
        "verticalPlayerRatio": 0.5
      },
      {
        "desktopZoom": 1,
        "id": "warning",
        "maxY": -224,
        "minY": -416,
        "mobileZoom": 0.72,
        "verticalPlayerRatio": 0.6
      },
      {
        "desktopZoom": 0.94,
        "id": "turret-reveal",
        "maxY": -416,
        "minY": -544,
        "mobileZoom": 0.7,
        "verticalPlayerRatio": 0.68
      },
      {
        "desktopZoom": 0.86,
        "id": "annex-combat",
        "maxY": -544,
        "minY": -800,
        "mobileZoom": 0.66,
        "verticalPlayerRatio": 0.62
      },
      {
        "desktopZoom": 1,
        "id": "relief",
        "maxY": -800,
        "minY": -944,
        "mobileZoom": 0.72,
        "verticalPlayerRatio": 0.6
      },
      {
        "desktopZoom": 1.15,
        "id": "exit",
        "maxY": -944,
        "minY": -1152,
        "mobileZoom": 0.78,
        "verticalPlayerRatio": 0.68
      }
    ],
    "checkpoints": [],
    "cueIds": [
      "security-scanner",
      "sentry-telegraph",
      "maintenance-override",
      "violation-logged"
    ],
    "entry": {
      "id": "sector-01-03:entry",
      "x": -320,
      "y": -32
    },
    "exit": {
      "id": "sector-01-03:exit",
      "x": 320,
      "y": -1059
    },
    "gate": {
      "id": "sector-01-03:gate",
      "nextAreaId": "sector-01-04",
      "requiredObjectiveIds": [
        "sector-01-03:maintenance-override"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 294,
        "y": -1089
      }
    },
    "id": "sector-01-03",
    "name": "SECURITY CHECK",
    "nextAreaId": "sector-01-04",
    "objectives": [
      {
        "id": "sector-01-03:maintenance-override",
        "sourceObjectId": "sector-01-03:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-01-03:employee-verified"
        ],
        "id": "sector-01-03:employee-scanner",
        "kind": "trigger",
        "position": {
          "x": -96,
          "y": -64
        },
        "presentationId": "world-object:trigger",
        "trigger": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 128,
            "width": 96
          }
        }
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [],
        "gameplay": false,
        "id": "sector-01-03:annex-cover-security-console-visual",
        "kind": "background-prop",
        "position": {
          "x": 1328,
          "y": -584
        },
        "presentationId": "world-object:background-prop"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [],
        "gameplay": false,
        "id": "sector-01-03:annex-cover-power-rack-visual",
        "kind": "background-prop",
        "position": {
          "x": 1600,
          "y": -560
        },
        "presentationId": "world-object:background-prop"
      },
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 544,
            "width": 1100
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "sentry-t1",
            "pursuit-drone-t1",
            "shield-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-01-03:access-guard-approach",
        "kind": "sentry",
        "position": {
          "x": 960,
          "y": -576
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut",
          "cover-ends-los"
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
            "height": 384,
            "width": 480
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "sentry-t1",
            "pursuit-drone-t1",
            "shield-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-01-03:access-guard-upper",
        "kind": "sentry",
        "position": {
          "x": 1512,
          "y": -768
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut",
          "cover-ends-los"
        ]
      },
      {
        "accessModuleId": "sector-01:access-module:a",
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": -240,
            "y": -16
          },
          "size": {
            "height": 384,
            "width": 720
          }
        },
        "coordinateAnchor": "center",
        "enemyType": "sentry-t1",
        "id": "sector-01-03:access-carrier-a",
        "kind": "sentry",
        "position": {
          "x": 1760,
          "y": -640
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut",
          "cover-ends-los"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-03:gate",
        "id": "sector-01-03:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-01-03:maintenance-override",
        "position": {
          "x": 208,
          "y": -1027
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-03:gate",
        "id": "sector-01-03:exit-gate",
        "kind": "gate",
        "position": {
          "x": 320,
          "y": -1027
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 3,
    "recoveryPoints": [
      {
        "id": "sector-01-03:recovery-r1",
        "x": 80,
        "y": -616
      },
      {
        "id": "sector-01-03:recovery-safe-ledge",
        "x": -240,
        "y": -680
      }
    ],
    "routePoints": [
      {
        "id": "sector-01-03:route-entry",
        "x": -320,
        "y": -32
      },
      {
        "id": "sector-01-03:route-a",
        "landmark": "A",
        "x": 64,
        "y": -224
      },
      {
        "id": "sector-01-03:route-p1-warning",
        "x": 256,
        "y": -320
      },
      {
        "id": "sector-01-03:route-security-junction",
        "x": 288,
        "y": -480
      },
      {
        "id": "sector-01-03:route-c",
        "landmark": "C",
        "x": -192,
        "y": -752
      },
      {
        "id": "sector-01-03:route-upper-relief",
        "x": 64,
        "y": -896
      },
      {
        "id": "sector-01-03:route-final-deck",
        "x": 192,
        "y": -1027
      }
    ],
    "routes": [
      "safe",
      "flow",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-01",
    "storyTriggers": [
      "employee-scan",
      "return-warning",
      "unauthorized-transit",
      "turret-activate",
      "access-denied",
      "maintenance-override",
      "violation-logged"
    ],
    "subtitle": "",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-03:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -144,
          "y": 0
        },
        "vertices": [
          {
            "x": -416,
            "y": 0
          },
          {
            "x": 128,
            "y": 0
          },
          {
            "x": 128,
            "y": 32
          },
          {
            "x": -416,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-03:p1-warning",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 256,
          "y": -320
        },
        "vertices": [
          {
            "x": 128,
            "y": -320
          },
          {
            "x": 384,
            "y": -320
          },
          {
            "x": 384,
            "y": -304
          },
          {
            "x": 128,
            "y": -304
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-03:security-junction",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 288,
          "y": -480
        },
        "vertices": [
          {
            "x": 160,
            "y": -480
          },
          {
            "x": 416,
            "y": -480
          },
          {
            "x": 416,
            "y": -460
          },
          {
            "x": 160,
            "y": -460
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-03:r1",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 80,
          "y": -592
        },
        "vertices": [
          {
            "x": -48,
            "y": -592
          },
          {
            "x": 208,
            "y": -592
          },
          {
            "x": 208,
            "y": -576
          },
          {
            "x": -48,
            "y": -576
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-03:safe-ledge",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -240,
          "y": -656
        },
        "vertices": [
          {
            "x": -360,
            "y": -656
          },
          {
            "x": -120,
            "y": -656
          },
          {
            "x": -120,
            "y": -640
          },
          {
            "x": -360,
            "y": -640
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-01-03:upper-cover",
        "kind": "cover",
        "oneWay": false,
        "position": {
          "x": -32,
          "y": -688
        },
        "vertices": [
          {
            "x": -64,
            "y": -848
          },
          {
            "x": 0,
            "y": -848
          },
          {
            "x": 0,
            "y": -688
          },
          {
            "x": -64,
            "y": -688
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-03:upper-relief",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 64,
          "y": -896
        },
        "vertices": [
          {
            "x": -96,
            "y": -896
          },
          {
            "x": 224,
            "y": -896
          },
          {
            "x": 224,
            "y": -876
          },
          {
            "x": -96,
            "y": -876
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-03:annex-mid-gantry",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 736,
          "y": -560
        },
        "vertices": [
          {
            "x": 640,
            "y": -560
          },
          {
            "x": 832,
            "y": -560
          },
          {
            "x": 832,
            "y": -544
          },
          {
            "x": 640,
            "y": -544
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-03:annex-entry",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 1168,
          "y": -640
        },
        "vertices": [
          {
            "x": 1056,
            "y": -640
          },
          {
            "x": 1280,
            "y": -640
          },
          {
            "x": 1280,
            "y": -622
          },
          {
            "x": 1056,
            "y": -622
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-03:annex-arena",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1536,
          "y": -640
        },
        "vertices": [
          {
            "x": 1168,
            "y": -640
          },
          {
            "x": 1904,
            "y": -640
          },
          {
            "x": 1904,
            "y": -608
          },
          {
            "x": 1168,
            "y": -608
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-03:annex-upper-balcony",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 1512,
          "y": -768
        },
        "vertices": [
          {
            "x": 1352,
            "y": -768
          },
          {
            "x": 1672,
            "y": -768
          },
          {
            "x": 1672,
            "y": -748
          },
          {
            "x": 1352,
            "y": -748
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-01-03:annex-cover-security-console",
        "kind": "cover",
        "oneWay": false,
        "position": {
          "x": 1328,
          "y": -528
        },
        "vertices": [
          {
            "x": 1292,
            "y": -640
          },
          {
            "x": 1364,
            "y": -640
          },
          {
            "x": 1364,
            "y": -528
          },
          {
            "x": 1292,
            "y": -528
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-01-03:annex-cover-power-rack",
        "kind": "cover",
        "oneWay": false,
        "position": {
          "x": 1600,
          "y": -480
        },
        "vertices": [
          {
            "x": 1556,
            "y": -640
          },
          {
            "x": 1644,
            "y": -640
          },
          {
            "x": 1644,
            "y": -480
          },
          {
            "x": 1556,
            "y": -480
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-03:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 192,
          "y": -1027
        },
        "vertices": [
          {
            "x": 32,
            "y": -1027
          },
          {
            "x": 352,
            "y": -1027
          },
          {
            "x": 352,
            "y": -995
          },
          {
            "x": 32,
            "y": -995
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
    "id": "1-3",
    "sector": 1,
    "sourceAreaId": "sector-01-03",
    "stage": 3
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
