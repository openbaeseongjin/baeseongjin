// GENERATED FILE - DO NOT EDIT
// Source: 1-4 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "1-4";
export const GENERATED_AREA_ID = "sector-01-04";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 832,
      "width": 1152
    },
    "cameraZones": [
      {
        "desktopZoom": 1.1,
        "id": "vestibule",
        "maxY": 0,
        "minY": -192,
        "mobileZoom": 0.76,
        "verticalPlayerRatio": 0.55
      },
      {
        "desktopZoom": 1.12,
        "id": "node",
        "maxY": -192,
        "minY": -384,
        "mobileZoom": 0.77,
        "verticalPlayerRatio": 0.58
      },
      {
        "desktopZoom": 0.98,
        "id": "calibration",
        "maxY": -384,
        "minY": -672,
        "mobileZoom": 0.7,
        "verticalPlayerRatio": 0.62
      },
      {
        "desktopZoom": 1.12,
        "id": "exit",
        "maxY": -672,
        "minY": -832,
        "mobileZoom": 0.77,
        "verticalPlayerRatio": 0.68
      }
    ],
    "checkpoints": [],
    "cueIds": [
      "maintenance-node",
      "foundation-augment-choice",
      "calibration-frame",
      "calibration-verified"
    ],
    "entry": {
      "id": "sector-01-04:entry",
      "x": 224,
      "y": -32
    },
    "exit": {
      "id": "sector-01-04:exit",
      "x": -128,
      "y": -800
    },
    "gate": {
      "id": "sector-01-04:gate",
      "nextAreaId": "sector-01-05",
      "requiredObjectiveIds": [
        "sector-01-04:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": -154,
        "y": -830
      }
    },
    "id": "sector-01-04",
    "name": "MAINTENANCE NODE",
    "nextAreaId": "sector-01-05",
    "objectives": [
      {
        "id": "sector-01-04:augment-selected",
        "sourceObjectId": "sector-01-04:maintenance-node",
        "type": "interact-choice"
      },
      {
        "id": "sector-01-04:augment-calibrated",
        "requiredObjectiveIds": [
          "sector-01-04:augment-selected"
        ],
        "sourceObjectId": "sector-01-04:universal-calibration-frame",
        "type": "augment-calibration"
      },
      {
        "id": "sector-01-04:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-01-04:augment-selected",
          "sector-01-04:augment-calibrated"
        ],
        "sourceObjectId": "sector-01-04:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "bottom-center",
        "id": "sector-01-04:maintenance-node",
        "interactionRadius": 80,
        "kind": "augment-node",
        "objectiveId": "sector-01-04:augment-selected",
        "position": {
          "x": -96,
          "y": -288
        },
        "presentationId": "world-object:augment-node"
      },
      {
        "coordinateAnchor": "center",
        "id": "sector-01-04:universal-calibration-frame",
        "interactionRadius": 400,
        "kind": "calibration-frame",
        "objectiveId": "sector-01-04:augment-calibrated",
        "position": {
          "x": 32,
          "y": -512
        },
        "presentationId": "world-object:calibration-frame"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [],
        "gameplay": false,
        "id": "sector-01-04:calibration-far-sensor",
        "kind": "background-prop",
        "position": {
          "x": 264,
          "y": -608
        },
        "presentationId": "world-object:background-prop"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [],
        "gameplay": false,
        "id": "sector-01-04:calibration-receiver",
        "kind": "background-prop",
        "position": {
          "x": 224,
          "y": -512
        },
        "presentationId": "world-object:background-prop"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [],
        "gameplay": false,
        "id": "sector-01-04:calibration-pulse-emitter",
        "kind": "background-prop",
        "position": {
          "x": -208,
          "y": -576
        },
        "presentationId": "world-object:background-prop"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [],
        "gameplay": false,
        "id": "sector-01-04:calibration-scan-field",
        "kind": "background-prop",
        "position": {
          "x": -256,
          "y": -608
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
            "height": 320,
            "width": 224
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
        "id": "sector-01-04:node-approach-guard",
        "kind": "sentry",
        "position": {
          "x": 432,
          "y": -160
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "no-rope-cut"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-04:gate",
        "id": "sector-01-04:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-01-04:exit-panel-engaged",
        "position": {
          "x": -240,
          "y": -768
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-01-04:augment-selected",
          "sector-01-04:augment-calibrated"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-04:gate",
        "id": "sector-01-04:exit-gate",
        "kind": "gate",
        "position": {
          "x": -128,
          "y": -768
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 4,
    "recoveryPoints": [],
    "routePoints": [
      {
        "id": "sector-01-04:route-entry",
        "x": 224,
        "y": -32
      },
      {
        "id": "sector-01-04:route-vestibule",
        "x": 320,
        "y": -160
      },
      {
        "id": "sector-01-04:route-baffle-approach",
        "x": 96,
        "y": -250
      },
      {
        "id": "sector-01-04:route-node",
        "x": -96,
        "y": -335
      },
      {
        "id": "sector-01-04:route-calibration",
        "x": 32,
        "y": -512
      },
      {
        "id": "sector-01-04:route-exit-transfer",
        "x": -256,
        "y": -704
      },
      {
        "id": "sector-01-04:route-final-deck",
        "x": -256,
        "y": -768
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
      "grapple-detected",
      "telemetry-analyzed",
      "override-available",
      "augment-selected",
      "calibration-profile-loaded",
      "calibration-verified",
      "firmware-applied"
    ],
    "subtitle": "EMERGENCY CALIBRATION",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-04:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 256,
          "y": 0
        },
        "vertices": [
          {
            "x": 0,
            "y": 0
          },
          {
            "x": 512,
            "y": 0
          },
          {
            "x": 512,
            "y": 32
          },
          {
            "x": 0,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-04:vestibule-deck",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 320,
          "y": -160
        },
        "vertices": [
          {
            "x": 160,
            "y": -160
          },
          {
            "x": 480,
            "y": -160
          },
          {
            "x": 480,
            "y": -144
          },
          {
            "x": 160,
            "y": -144
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": false,
        "id": "sector-01-04:service-baffle",
        "kind": "solid",
        "oneWay": false,
        "position": {
          "x": 96,
          "y": -160
        },
        "vertices": [
          {
            "x": 64,
            "y": -416
          },
          {
            "x": 128,
            "y": -416
          },
          {
            "x": 128,
            "y": -160
          },
          {
            "x": 64,
            "y": -160
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-04:node-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -96,
          "y": -288
        },
        "vertices": [
          {
            "x": -320,
            "y": -288
          },
          {
            "x": 128,
            "y": -288
          },
          {
            "x": 128,
            "y": -256
          },
          {
            "x": -320,
            "y": -256
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-04:calibration-floor",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 32,
          "y": -512
        },
        "vertices": [
          {
            "x": -320,
            "y": -512
          },
          {
            "x": 384,
            "y": -512
          },
          {
            "x": 384,
            "y": -480
          },
          {
            "x": -320,
            "y": -480
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-04:calibration-upper-lip",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -256,
          "y": -640
        },
        "vertices": [
          {
            "x": -384,
            "y": -640
          },
          {
            "x": -128,
            "y": -640
          },
          {
            "x": -128,
            "y": -624
          },
          {
            "x": -384,
            "y": -624
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-04:exit-transfer",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -256,
          "y": -704
        },
        "vertices": [
          {
            "x": -416,
            "y": -704
          },
          {
            "x": -96,
            "y": -704
          },
          {
            "x": -96,
            "y": -680
          },
          {
            "x": -416,
            "y": -680
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": false,
        "id": "sector-01-04:room-casing-left",
        "kind": "room-casing",
        "oneWay": false,
        "position": {
          "x": -560,
          "y": -832
        },
        "vertices": [
          {
            "x": -576,
            "y": -832
          },
          {
            "x": -544,
            "y": -832
          },
          {
            "x": -544,
            "y": 0
          },
          {
            "x": -576,
            "y": 0
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": false,
        "id": "sector-01-04:room-casing-right",
        "kind": "room-casing",
        "oneWay": false,
        "position": {
          "x": 560,
          "y": -832
        },
        "vertices": [
          {
            "x": 544,
            "y": -832
          },
          {
            "x": 576,
            "y": -832
          },
          {
            "x": 576,
            "y": 0
          },
          {
            "x": 544,
            "y": 0
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-04:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -256,
          "y": -768
        },
        "vertices": [
          {
            "x": -416,
            "y": -768
          },
          {
            "x": -96,
            "y": -768
          },
          {
            "x": -96,
            "y": -736
          },
          {
            "x": -416,
            "y": -736
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
    "legacyStageAlias": "1-4",
    "sector": 1,
    "sourceAreaId": "sector-01-04",
    "stage": 4
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
