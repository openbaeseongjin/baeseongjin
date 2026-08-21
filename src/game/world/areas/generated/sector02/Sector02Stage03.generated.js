// GENERATED FILE - DO NOT EDIT
// Source: 2-3 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "2-3";
export const GENERATED_AREA_ID = "sector-02-03";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-02-03:g1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G1",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -160,
        "y": -352
      },
      "objectIndex": 0,
      "surfaceIndex": 5,
      "target": {
        "id": "sector-02-03:g1-surface",
        "properties": {},
        "x": -160,
        "y": -352
      }
    }
  ],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 576,
      "width": 1344
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "residential-service-node",
      "second-generic-augment-source"
    ],
    "entry": {
      "id": "sector-02-03:entry",
      "x": -576,
      "y": -32
    },
    "exit": {
      "id": "sector-02-03:exit",
      "x": 640,
      "y": -320
    },
    "gate": {
      "id": "sector-02-03:gate",
      "nextAreaId": "sector-02-04",
      "requiredObjectiveIds": [
        "sector-02-03:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 614,
        "y": -350
      }
    },
    "id": "sector-02-03",
    "name": "RESIDENTIAL SERVICE NODE",
    "nextAreaId": "sector-02-04",
    "objectives": [
      {
        "id": "sector-02-03:specialization-selected",
        "sourceObjectId": "sector-02-03:specialization-node",
        "type": "interact-choice"
      },
      {
        "id": "sector-02-03:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-02-03:specialization-selected"
        ],
        "sourceObjectId": "sector-02-03:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "grapple-device-detected",
          "emergency-configuration-active"
        ],
        "id": "sector-02-03:specialization-node",
        "interactionRadius": 72,
        "kind": "augment-node",
        "objectiveId": "sector-02-03:specialization-selected",
        "position": {
          "x": 256,
          "y": -256
        },
        "presentationId": "world-object:augment-node",
        "stableSourceId": "sector-02-03:specialization-node"
      },
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 224,
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
        "id": "sector-02-03:node-approach-guard",
        "kind": "sentry",
        "position": {
          "x": -384,
          "y": -128
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
        "gateId": "sector-02-03:gate",
        "id": "sector-02-03:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-02-03:exit-panel-engaged",
        "position": {
          "x": 528,
          "y": -288
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-02-03:specialization-selected"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-03:gate",
        "id": "sector-02-03:exit-gate",
        "kind": "gate",
        "position": {
          "x": 640,
          "y": -288
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 3,
    "recoveryPoints": [
      {
        "id": "sector-02-03:recovery-threshold-fallback",
        "x": 96,
        "y": -272
      }
    ],
    "routePoints": [
      {
        "id": "sector-02-03:route-entry",
        "x": -576,
        "y": -32
      },
      {
        "id": "sector-02-03:route-approach",
        "x": -416,
        "y": -128
      },
      {
        "id": "sector-02-03:route-g1",
        "landmark": "G1",
        "x": -160,
        "y": -352
      },
      {
        "id": "sector-02-03:route-safe-hall-landing",
        "x": 96,
        "y": -256
      },
      {
        "id": "sector-02-03:route-node",
        "x": 256,
        "y": -256
      },
      {
        "id": "sector-02-03:route-exit",
        "x": 576,
        "y": -320
      }
    ],
    "routes": [
      "safe",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-02",
    "storyTriggers": [
      "augment-service-node",
      "grapple-device-detected",
      "emergency-configuration-active"
    ],
    "subtitle": "AUGMENT SERVICE",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-03:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -544,
          "y": 0
        },
        "vertices": [
          {
            "x": -672,
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
            "x": -672,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-03:approach-deck",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -416,
          "y": -128
        },
        "vertices": [
          {
            "x": -544,
            "y": -128
          },
          {
            "x": -288,
            "y": -128
          },
          {
            "x": -288,
            "y": -106
          },
          {
            "x": -544,
            "y": -106
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-02-03:service-core",
        "kind": "solid",
        "losBlocker": true,
        "oneWay": false,
        "position": {
          "x": -64,
          "y": -64
        },
        "vertices": [
          {
            "x": -96,
            "y": -352
          },
          {
            "x": -32,
            "y": -352
          },
          {
            "x": -32,
            "y": -64
          },
          {
            "x": -96,
            "y": -64
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-03:choice-floor",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 288,
          "y": -256
        },
        "vertices": [
          {
            "x": -32,
            "y": -256
          },
          {
            "x": 608,
            "y": -256
          },
          {
            "x": 608,
            "y": -230
          },
          {
            "x": -32,
            "y": -230
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-03:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 560,
          "y": -288
        },
        "vertices": [
          {
            "x": 448,
            "y": -288
          },
          {
            "x": 672,
            "y": -288
          },
          {
            "x": 672,
            "y": -256
          },
          {
            "x": 448,
            "y": -256
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
    "legacyStageAlias": "2-3",
    "sector": 2,
    "sourceAreaId": "sector-02-03",
    "stage": 3
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
