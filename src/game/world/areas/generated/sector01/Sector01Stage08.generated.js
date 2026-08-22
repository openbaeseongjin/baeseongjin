// GENERATED FILE - DO NOT EDIT
// Source: 1-8 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "1-8";
export const GENERATED_AREA_ID = "sector-01-08";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-01-08:anchor-a",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -480,
        "y": -224
      },
      "objectIndex": 0,
      "surfaceIndex": 10,
      "target": {
        "id": "sector-01-08:anchor-a-surface",
        "properties": {},
        "x": -480,
        "y": -224
      }
    },
    {
      "landmark": {
        "id": "sector-01-08:anchor-d",
        "properties": {
          "coordinateAnchor": "center",
          "label": "D",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 384,
        "y": -704
      },
      "objectIndex": 1,
      "surfaceIndex": 11,
      "target": {
        "id": "sector-01-08:anchor-d-surface",
        "properties": {},
        "x": 384,
        "y": -704
      }
    },
    {
      "landmark": {
        "id": "sector-01-08:anchor-e",
        "properties": {
          "coordinateAnchor": "center",
          "label": "E",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 416,
        "y": -960
      },
      "objectIndex": 2,
      "surfaceIndex": 12,
      "target": {
        "id": "sector-01-08:anchor-e-surface",
        "properties": {},
        "x": 416,
        "y": -960
      }
    },
    {
      "landmark": {
        "id": "sector-01-08:anchor-f",
        "properties": {
          "coordinateAnchor": "center",
          "label": "F",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 64,
        "y": -1056
      },
      "objectIndex": 3,
      "surfaceIndex": 13,
      "target": {
        "id": "sector-01-08:anchor-f-surface",
        "properties": {},
        "x": 64,
        "y": -1056
      }
    },
    {
      "landmark": {
        "id": "sector-01-08:anchor-h",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -96,
        "y": -1344
      },
      "objectIndex": 4,
      "surfaceIndex": 14,
      "target": {
        "id": "sector-01-08:anchor-h-surface",
        "properties": {},
        "x": -96,
        "y": -1344
      }
    },
    {
      "landmark": {
        "id": "sector-01-08:grip-b",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": -96,
        "y": -320
      },
      "objectIndex": 5,
      "surfaceIndex": 15,
      "target": {
        "id": "sector-01-08:grip-b-surface",
        "properties": {},
        "x": -96,
        "y": -320
      }
    },
    {
      "landmark": {
        "id": "sector-01-08:grip-c",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 352,
        "y": -416
      },
      "objectIndex": 6,
      "surfaceIndex": 16,
      "target": {
        "id": "sector-01-08:grip-c-surface",
        "properties": {},
        "x": 352,
        "y": -416
      }
    },
    {
      "landmark": {
        "id": "sector-01-08:grip-g",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": -384,
        "y": -1152
      },
      "objectIndex": 7,
      "surfaceIndex": 17,
      "target": {
        "id": "sector-01-08:grip-g-surface",
        "properties": {},
        "x": -384,
        "y": -1152
      }
    },
    {
      "landmark": {
        "id": "sector-01-08:grip-i",
        "properties": {
          "coordinateAnchor": "center",
          "presentationId": "world-object:structural-grapple-joint"
        },
        "x": 352,
        "y": -1432
      },
      "objectIndex": 8,
      "surfaceIndex": 18,
      "target": {
        "id": "sector-01-08:grip-i-surface",
        "properties": {},
        "x": 352,
        "y": -1432
      }
    }
  ],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1792,
      "width": 1664
    },
    "cameraZones": [
      {
        "desktopZoom": 1.08,
        "id": "intro",
        "maxY": 0,
        "minY": -192,
        "mobileZoom": 0.76
      },
      {
        "desktopZoom": 0.88,
        "id": "lower-security",
        "maxY": -192,
        "minY": -512,
        "mobileZoom": 0.66,
        "verticalPlayerRatio": 0.64
      },
      {
        "desktopZoom": 1.08,
        "id": "mid-relief",
        "maxY": -512,
        "minY": -832,
        "mobileZoom": 0.75
      },
      {
        "desktopZoom": 0.86,
        "id": "upper-security",
        "maxY": -832,
        "minY": -1152,
        "mobileZoom": 0.65,
        "verticalPlayerRatio": 0.64
      },
      {
        "desktopZoom": 0.94,
        "id": "final-preview",
        "maxY": -1152,
        "minY": -1344,
        "mobileZoom": 0.68
      },
      {
        "desktopZoom": 0.84,
        "id": "final-crossing",
        "maxY": -1344,
        "minY": -1536,
        "mobileZoom": 0.64,
        "verticalPlayerRatio": 0.66
      },
      {
        "desktopZoom": 1.1,
        "id": "override",
        "maxY": -1536,
        "minY": -1664,
        "mobileZoom": 0.76
      },
      {
        "desktopZoom": 1.02,
        "id": "gate-open",
        "maxY": -1664,
        "minY": -1728,
        "mobileZoom": 0.73
      },
      {
        "desktopZoom": 1.12,
        "id": "worker-reveal",
        "maxY": -1728,
        "minY": -1792,
        "mobileZoom": 0.78
      }
    ],
    "checkpoints": [
      {
        "id": "checkpoint:sector-01-08:end",
        "radius": 38,
        "sourceObjectId": "sector-01-08:sector-checkpoint",
        "x": 0,
        "y": -1728
      }
    ],
    "cueIds": [
      "containment-gate",
      "no-crossfire",
      "final-vent",
      "lower-grid-shutdown",
      "worker-district-reveal",
      "sector-checkpoint"
    ],
    "entry": {
      "id": "sector-01-08:entry",
      "x": -640,
      "y": -32
    },
    "exit": {
      "id": "sector-01-08:exit",
      "x": 288,
      "y": -1696
    },
    "gate": {
      "barrier": {
        "height": 96,
        "width": 64,
        "x": 288,
        "y": -1824
      },
      "id": "sector-01-08:gate",
      "nextAreaId": null,
      "requiredObjectiveIds": [
        "sector-01-08:maintenance-override"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": 272,
        "y": -1856
      }
    },
    "id": "sector-01-08",
    "name": "CONTAINMENT GATE",
    "nextAreaId": null,
    "objectives": [
      {
        "id": "sector-01-08:maintenance-override",
        "sourceObjectId": "sector-01-08:exit-panel",
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
            "width": 384
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "artillery-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-01-08:lower-grid-guard",
        "kind": "sentry",
        "position": {
          "x": -64,
          "y": -384
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut",
          "sequential-activation",
          "no-crossfire"
        ]
      },
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": -16
          },
          "size": {
            "height": 320,
            "width": 384
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "artillery-drone-t1"
          ]
        },
        "id": "sector-01-08:lower-turret",
        "kind": "sentry",
        "position": {
          "x": 544,
          "y": -512
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "sequential-activation",
          "no-crossfire",
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
            "width": 384
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "artillery-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-01-08:upper-grid-guard",
        "kind": "sentry",
        "position": {
          "x": 192,
          "y": -1056
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut",
          "sequential-activation",
          "no-crossfire"
        ]
      },
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": -16
          },
          "size": {
            "height": 320,
            "width": 384
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "artillery-drone-t1"
          ]
        },
        "id": "sector-01-08:upper-turret",
        "kind": "sentry",
        "position": {
          "x": -544,
          "y": -1184
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "sequential-activation",
          "no-crossfire",
          "standard-projectile",
          "no-rope-cut"
        ]
      },
      {
        "coordinateAnchor": "center",
        "damage": false,
        "id": "sector-01-08:final-vent",
        "kind": "wind-source",
        "position": {
          "x": -704,
          "y": -1392
        },
        "presentationId": "world-object:wind-source",
        "windZoneId": "sector-01-08:final-pulsed-vent"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-08:gate",
        "id": "sector-01-08:exit-gate",
        "kind": "gate",
        "position": {
          "x": 288,
          "y": -1664
        },
        "presentationId": "world-object:gate"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-08:gate",
        "id": "sector-01-08:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-01-08:maintenance-override",
        "position": {
          "x": 176,
          "y": -1664
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-01-08:worker-district-reveal",
          "sector-01-08:sector-checkpoint"
        ],
        "id": "sector-01-08:sector-checkpoint",
        "kind": "checkpoint",
        "position": {
          "x": 0,
          "y": -1728
        },
        "presentationId": "world-object:checkpoint"
      }
    ],
    "order": 8,
    "recoveryPoints": [
      {
        "id": "sector-01-08:recovery-lower-r1",
        "x": -128,
        "y": -200
      },
      {
        "id": "sector-01-08:recovery-lower-r2",
        "x": 256,
        "y": -376
      },
      {
        "id": "sector-01-08:recovery-upper-r1",
        "x": 160,
        "y": -920
      },
      {
        "id": "sector-01-08:recovery-upper-r2",
        "x": -256,
        "y": -1112
      }
    ],
    "routePoints": [
      {
        "id": "sector-01-08:route-entry",
        "x": -640,
        "y": -32
      },
      {
        "id": "sector-01-08:route-a",
        "landmark": "A",
        "x": -480,
        "y": -224
      },
      {
        "id": "sector-01-08:route-b",
        "x": -96,
        "y": -320
      },
      {
        "id": "sector-01-08:route-c",
        "x": 352,
        "y": -416
      },
      {
        "id": "sector-01-08:route-lower-transfer",
        "x": 480,
        "y": -512
      },
      {
        "id": "sector-01-08:route-d",
        "landmark": "D",
        "x": 384,
        "y": -704
      },
      {
        "id": "sector-01-08:route-mid-relief",
        "x": 0,
        "y": -832
      },
      {
        "id": "sector-01-08:route-e",
        "landmark": "E",
        "x": 416,
        "y": -960
      },
      {
        "id": "sector-01-08:route-f",
        "landmark": "F",
        "x": 64,
        "y": -1056
      },
      {
        "id": "sector-01-08:route-g",
        "x": -384,
        "y": -1152
      },
      {
        "id": "sector-01-08:route-upper-transfer",
        "x": -480,
        "y": -1248
      },
      {
        "id": "sector-01-08:route-h",
        "landmark": "H",
        "x": -96,
        "y": -1344
      },
      {
        "id": "sector-01-08:route-i",
        "x": 352,
        "y": -1432
      },
      {
        "id": "sector-01-08:route-override",
        "x": 480,
        "y": -1536
      },
      {
        "id": "sector-01-08:route-gate-passage",
        "x": 0,
        "y": -1664
      },
      {
        "id": "sector-01-08:route-checkpoint",
        "x": 0,
        "y": -1728
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
      "final-warning",
      "return-to-lower-maintenance",
      "closure-in-progress",
      "lockdown-87-percent",
      "override-lock-confirm",
      "lower-grid-terminating",
      "worker-district-access-open",
      "worker-district-block-12",
      "sector-checkpoint"
    ],
    "subtitle": "FINAL MAINTENANCE ACCESS",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-08:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -608,
          "y": 0
        },
        "vertices": [
          {
            "x": -800,
            "y": 0
          },
          {
            "x": -416,
            "y": 0
          },
          {
            "x": -416,
            "y": 32
          },
          {
            "x": -800,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-08:lower-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -128,
          "y": -176
        },
        "vertices": [
          {
            "x": -272,
            "y": -176
          },
          {
            "x": 16,
            "y": -176
          },
          {
            "x": 16,
            "y": -158
          },
          {
            "x": -272,
            "y": -158
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-08:lower-local-catch",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 256,
          "y": -352
        },
        "vertices": [
          {
            "x": 144,
            "y": -352
          },
          {
            "x": 368,
            "y": -352
          },
          {
            "x": 368,
            "y": -334
          },
          {
            "x": 144,
            "y": -334
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-08:lower-transfer",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 480,
          "y": -512
        },
        "vertices": [
          {
            "x": 320,
            "y": -512
          },
          {
            "x": 640,
            "y": -512
          },
          {
            "x": 640,
            "y": -488
          },
          {
            "x": 320,
            "y": -488
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-08:mid-relief",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 0,
          "y": -832
        },
        "vertices": [
          {
            "x": -256,
            "y": -832
          },
          {
            "x": 256,
            "y": -832
          },
          {
            "x": 256,
            "y": -802
          },
          {
            "x": -256,
            "y": -802
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-08:upper-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 160,
          "y": -896
        },
        "vertices": [
          {
            "x": 32,
            "y": -896
          },
          {
            "x": 288,
            "y": -896
          },
          {
            "x": 288,
            "y": -878
          },
          {
            "x": 32,
            "y": -878
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-08:upper-catch",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -256,
          "y": -1088
        },
        "vertices": [
          {
            "x": -368,
            "y": -1088
          },
          {
            "x": -144,
            "y": -1088
          },
          {
            "x": -144,
            "y": -1070
          },
          {
            "x": -368,
            "y": -1070
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-08:upper-transfer",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -480,
          "y": -1248
        },
        "vertices": [
          {
            "x": -640,
            "y": -1248
          },
          {
            "x": -320,
            "y": -1248
          },
          {
            "x": -320,
            "y": -1224
          },
          {
            "x": -640,
            "y": -1224
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-08:override-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 480,
          "y": -1536
        },
        "vertices": [
          {
            "x": 304,
            "y": -1536
          },
          {
            "x": 656,
            "y": -1536
          },
          {
            "x": 656,
            "y": -1508
          },
          {
            "x": 304,
            "y": -1508
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-08:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 0,
          "y": -1664
        },
        "vertices": [
          {
            "x": -320,
            "y": -1664
          },
          {
            "x": 320,
            "y": -1664
          },
          {
            "x": 320,
            "y": -1632
          },
          {
            "x": -320,
            "y": -1632
          }
        ]
      }
    ],
    "windZones": [
      {
        "bounds": {
          "height": 288,
          "width": 1152,
          "x": -672,
          "y": -1504
        },
        "cycle": {
          "active": 1.4,
          "decay": 0.3,
          "lull": 1.75,
          "warning": 0.7
        },
        "direction": {
          "x": 1,
          "y": 0
        },
        "falloff": 80,
        "id": "sector-01-08:final-pulsed-vent",
        "mode": "pulsed",
        "strength": 800
      }
    ]
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
    "legacyStageAlias": "1-8",
    "sector": 1,
    "sourceAreaId": "sector-01-08",
    "stage": 8
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
