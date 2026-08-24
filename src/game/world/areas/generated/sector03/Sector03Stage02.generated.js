// GENERATED FILE - DO NOT EDIT
// Source: 3-2 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "3-2";
export const GENERATED_AREA_ID = "sector-03-02";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-03-02:c1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "c1"
        },
        "x": -680,
        "y": -325
      },
      "target": {
        "id": "sector-03-02:c1-surface",
        "properties": {
          "scannerControlled": true,
          "sourceId": "c1"
        },
        "x": -680,
        "y": -325
      }
    },
    {
      "landmark": {
        "id": "sector-03-02:c2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C2",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "c2"
        },
        "x": 310,
        "y": -885
      },
      "target": {
        "id": "sector-03-02:c2-surface",
        "properties": {
          "scannerControlled": true,
          "sourceId": "c2"
        },
        "x": 310,
        "y": -885
      }
    },
    {
      "landmark": {
        "id": "sector-03-02:c3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C3",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "c3"
        },
        "x": -130,
        "y": -455
      },
      "target": {
        "id": "sector-03-02:c3-surface",
        "properties": {
          "scannerControlled": true,
          "sourceId": "c3"
        },
        "x": -130,
        "y": -455
      }
    },
    {
      "landmark": {
        "id": "sector-03-02:g2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G2",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g2"
        },
        "x": 755,
        "y": -755
      },
      "target": {
        "id": "sector-03-02:g2-surface",
        "properties": {
          "sourceId": "g2"
        },
        "x": 755,
        "y": -755
      }
    },
    {
      "landmark": {
        "id": "sector-03-02:g3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G3",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g3"
        },
        "x": 345,
        "y": -570
      },
      "target": {
        "id": "sector-03-02:g3-surface",
        "properties": {
          "sourceId": "g3"
        },
        "x": 345,
        "y": -570
      }
    },
    {
      "landmark": {
        "id": "sector-03-02:g5",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G5",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g5"
        },
        "x": 290,
        "y": -1170
      },
      "target": {
        "id": "sector-03-02:g5-surface",
        "properties": {
          "sourceId": "g5"
        },
        "x": 290,
        "y": -1170
      }
    },
    {
      "landmark": {
        "id": "sector-03-02:g6",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G6",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g6"
        },
        "x": 625,
        "y": -1270
      },
      "target": {
        "id": "sector-03-02:g6-surface",
        "properties": {
          "sourceId": "g6"
        },
        "x": 625,
        "y": -1270
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1472,
      "width": 3200
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "scanner-gallery",
      "access-scan-field"
    ],
    "entry": {
      "id": "sector-03-02:entry",
      "x": -1456,
      "y": -32
    },
    "exit": {
      "id": "sector-03-02:exit",
      "x": 1088,
      "y": -1408
    },
    "gate": {
      "id": "sector-03-02:gate",
      "nextAreaId": "sector-03-03",
      "requiredObjectiveIds": [
        "sector-03-02:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 1062,
        "y": -1470
      }
    },
    "id": "sector-03-02",
    "name": "FACADE SERVICE GALLERY",
    "nextAreaId": "sector-03-03",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 320,
          "x": 800,
          "y": -1440
        },
        "id": "sector-03-02:final-deck-reached",
        "type": "reach"
      },
      {
        "id": "sector-03-02:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-03-02:final-deck-reached"
        ],
        "sourceObjectId": "sector-03-02:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-02:access-control"
        ],
        "id": "sector-03-02:access-control",
        "kind": "story-display",
        "position": {
          "x": -955,
          "y": -135
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-02:service-mount"
        ],
        "id": "sector-03-02:service-mount",
        "kind": "story-display",
        "position": {
          "x": -375,
          "y": -175
        },
        "presentationId": "world-object:story-display"
      },
      {
        "activationPolicy": "after-scanner-tutorial",
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 800,
            "width": 1200
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
        "id": "sector-03-02:scanner-lower-guard",
        "kind": "sentry",
        "position": {
          "x": 400,
          "y": -520
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
        ]
      },
      {
        "accessModuleId": "sector-03:access-module:a",
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 800,
            "width": 1200
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "artillery-drone-t1",
            "support-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-03-02:scanner-upper-guard",
        "kind": "sentry",
        "mainlineGateDependency": false,
        "position": {
          "x": 570,
          "y": -1025
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional-for-stage",
          "kill-required-for-module-a",
          "no-rope-cut",
          "activation-band-only"
        ]
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-02:retail-security-ahead"
        ],
        "id": "sector-03-02:retail-security-ahead",
        "kind": "story-display",
        "position": {
          "x": 935,
          "y": -1460
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-02:gate",
        "id": "sector-03-02:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-03-02:exit-panel-engaged",
        "position": {
          "x": 1008,
          "y": -1408
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-02:gate",
        "id": "sector-03-02:exit-gate",
        "kind": "gate",
        "position": {
          "x": 1088,
          "y": -1408
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 2,
    "recoveryPoints": [
      {
        "id": "sector-03-02:recovery-tutorial",
        "sourceId": "tutorial-recovery",
        "x": -492,
        "y": -178
      },
      {
        "id": "sector-03-02:recovery-c",
        "sourceId": "recovery-c",
        "x": 64,
        "y": -818
      }
    ],
    "routePoints": [
      {
        "id": "sector-03-02:route-entry",
        "sourceId": "entry",
        "x": -1456,
        "y": -32
      },
      {
        "id": "sector-03-02:route-g0",
        "sourceId": "g0",
        "x": -1280,
        "y": -128
      },
      {
        "id": "sector-03-02:route-p1-right-edge",
        "sourceId": "p1-right-edge",
        "x": -945,
        "y": -140
      },
      {
        "id": "sector-03-02:route-c2",
        "sourceId": "c2",
        "x": -544,
        "y": -384
      },
      {
        "id": "sector-03-02:route-c3",
        "sourceId": "c3",
        "x": -192,
        "y": -432
      },
      {
        "id": "sector-03-02:route-p2-left-edge",
        "sourceId": "p2-left-edge",
        "x": 128,
        "y": -464
      },
      {
        "id": "sector-03-02:route-p2-right-edge",
        "sourceId": "p2-right-edge",
        "x": 512,
        "y": -464
      },
      {
        "id": "sector-03-02:route-g1",
        "sourceId": "g1",
        "x": 1216,
        "y": -640
      },
      {
        "id": "sector-03-02:route-p3-left-edge",
        "sourceId": "p3-left-edge",
        "x": 1152,
        "y": -704
      },
      {
        "id": "sector-03-02:route-g2",
        "sourceId": "g2",
        "x": 832,
        "y": -800
      },
      {
        "id": "sector-03-02:route-g3",
        "sourceId": "g3",
        "x": 448,
        "y": -896
      },
      {
        "id": "sector-03-02:route-g4",
        "sourceId": "g4",
        "x": 64,
        "y": -960
      },
      {
        "id": "sector-03-02:route-p4",
        "sourceId": "p4",
        "x": -128,
        "y": -992
      },
      {
        "id": "sector-03-02:route-c4",
        "sourceId": "c4",
        "x": -256,
        "y": -1184
      },
      {
        "id": "sector-03-02:route-p5-right-edge",
        "sourceId": "p5-right-edge",
        "x": -128,
        "y": -1248
      },
      {
        "id": "sector-03-02:route-g5",
        "sourceId": "g5",
        "x": 224,
        "y": -1280
      },
      {
        "id": "sector-03-02:route-g6",
        "sourceId": "g6",
        "x": 576,
        "y": -1344
      },
      {
        "id": "sector-03-02:route-exit-left-edge",
        "sourceId": "exit-left-edge",
        "x": 800,
        "y": -1408
      },
      {
        "id": "sector-03-02:route-exit",
        "sourceId": "exit",
        "x": 960,
        "y": -1408
      }
    ],
    "routes": [
      "underframe",
      "backside-return",
      "crown-departure",
      "access-a-optional",
      "recovery"
    ],
    "scannerGroups": [
      {
        "contract": {
          "currentRopePersistsThroughLocked": true,
          "damage": 0,
          "forcedDetach": false,
          "knockback": 0,
          "newAttachAllowed": [
            "AVAILABLE",
            "WARNING"
          ],
          "newAttachDenied": [
            "LOCKED",
            "RESET"
          ],
          "ropeCut": false
        },
        "controlledSurfaceIds": [
          "sector-03-02:c1-surface",
          "sector-03-02:c2-surface",
          "sector-03-02:c3-surface"
        ],
        "cycle": {
          "available": 1.5,
          "locked": 1.1,
          "reset": 0.3,
          "warning": 0.6
        },
        "id": "sector-03-02:scanner-A",
        "phaseOffsetSeconds": 0
      }
    ],
    "sectorId": "sector-03",
    "storyTriggers": [
      "scanner-gallery-entry",
      "access-denied",
      "scanner-learned"
    ],
    "subtitle": "FIRST ACCESS SCAN",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p0-entry",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -1456,
          "y": 0
        },
        "sourceId": "p0-entry",
        "vertices": [
          {
            "x": -1568,
            "y": 0
          },
          {
            "x": -1344,
            "y": 0
          },
          {
            "x": -1344,
            "y": 32
          },
          {
            "x": -1568,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p1-access-control",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1110,
          "y": -130
        },
        "sourceId": "p1-access-control",
        "vertices": [
          {
            "x": -1270,
            "y": -130
          },
          {
            "x": -950,
            "y": -130
          },
          {
            "x": -950,
            "y": -104
          },
          {
            "x": -1270,
            "y": -104
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "tutorial-recovery",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -335,
          "y": -110
        },
        "sourceId": "tutorial-recovery",
        "vertices": [
          {
            "x": -463,
            "y": -110
          },
          {
            "x": -207,
            "y": -110
          },
          {
            "x": -207,
            "y": -92
          },
          {
            "x": -463,
            "y": -92
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p2-right-service-cradle",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 380,
          "y": -130
        },
        "sourceId": "p2-right-service-cradle",
        "vertices": [
          {
            "x": 188,
            "y": -130
          },
          {
            "x": 572,
            "y": -130
          },
          {
            "x": 572,
            "y": -104
          },
          {
            "x": 188,
            "y": -104
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "lower-security-shelf",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 840,
          "y": -470
        },
        "sourceId": "lower-security-shelf",
        "vertices": [
          {
            "x": 680,
            "y": -470
          },
          {
            "x": 1000,
            "y": -470
          },
          {
            "x": 1000,
            "y": -444
          },
          {
            "x": 680,
            "y": -444
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p4-backside-safe-gallery",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -130,
          "y": -995
        },
        "sourceId": "p4-backside-safe-gallery",
        "vertices": [
          {
            "x": -322,
            "y": -995
          },
          {
            "x": 62,
            "y": -995
          },
          {
            "x": 62,
            "y": -967
          },
          {
            "x": -322,
            "y": -967
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 960,
          "y": -1408
        },
        "sourceId": "exit-deck",
        "vertices": [
          {
            "x": 800,
            "y": -1408
          },
          {
            "x": 1120,
            "y": -1408
          },
          {
            "x": 1120,
            "y": -1380
          },
          {
            "x": 800,
            "y": -1380
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
    "id": "3-2",
    "sector": 3,
    "sourceAreaId": "sector-03-02",
    "stage": 2
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
