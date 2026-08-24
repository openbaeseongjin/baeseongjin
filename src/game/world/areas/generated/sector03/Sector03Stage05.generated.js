// GENERATED FILE - DO NOT EDIT
// Source: 3-5 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "3-5";
export const GENERATED_AREA_ID = "sector-03-05";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-03-05:g1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g1"
        },
        "x": -1110,
        "y": -275
      },
      "target": {
        "id": "sector-03-05:g1-surface",
        "properties": {
          "sourceId": "g1"
        },
        "x": -1110,
        "y": -275
      }
    },
    {
      "landmark": {
        "id": "sector-03-05:g2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G2",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g2"
        },
        "x": -380,
        "y": -390
      },
      "target": {
        "id": "sector-03-05:g2-surface",
        "properties": {
          "sourceId": "g2"
        },
        "x": -380,
        "y": -390
      }
    },
    {
      "landmark": {
        "id": "sector-03-05:g3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G3",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g3"
        },
        "x": -365,
        "y": -880
      },
      "target": {
        "id": "sector-03-05:g3-surface",
        "properties": {
          "sourceId": "g3"
        },
        "x": -365,
        "y": -880
      }
    },
    {
      "landmark": {
        "id": "sector-03-05:g4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G4",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g4"
        },
        "x": 500,
        "y": -725
      },
      "target": {
        "id": "sector-03-05:g4-surface",
        "properties": {
          "sourceId": "g4"
        },
        "x": 500,
        "y": -725
      }
    },
    {
      "landmark": {
        "id": "sector-03-05:g6",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G6",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g6"
        },
        "x": 1195,
        "y": -955
      },
      "target": {
        "id": "sector-03-05:g6-surface",
        "properties": {
          "sourceId": "g6"
        },
        "x": 1195,
        "y": -955
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1408,
      "width": 3008
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "commercial-service-node",
      "rest"
    ],
    "entry": {
      "id": "sector-03-05:entry",
      "x": -1184,
      "y": -32
    },
    "exit": {
      "id": "sector-03-05:exit",
      "x": 1376,
      "y": -1152
    },
    "gate": {
      "id": "sector-03-05:gate",
      "nextAreaId": "sector-03-06",
      "requiredObjectiveIds": [
        "sector-03-05:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 1350,
        "y": -1214
      }
    },
    "id": "sector-03-05",
    "name": "COMMERCIAL OPERATIONS HUB",
    "nextAreaId": "sector-03-06",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 288,
          "x": 1216,
          "y": -1184
        },
        "id": "sector-03-05:final-deck-reached",
        "type": "reach"
      },
      {
        "id": "sector-03-05:augment-selected",
        "sourceObjectId": "sector-03-05:service-calibration-frame",
        "type": "interact-choice"
      },
      {
        "id": "sector-03-05:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-03-05:final-deck-reached",
          "sector-03-05:augment-selected"
        ],
        "sourceObjectId": "sector-03-05:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "center",
        "id": "sector-03-05:service-calibration-frame",
        "interactionRadius": 72,
        "kind": "augment-node",
        "objectiveId": "sector-03-05:augment-selected",
        "offerContract": "generic Augment v1",
        "position": {
          "x": -530,
          "y": -565
        },
        "presentationId": "world-object:augment-node"
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
            "width": 512
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
        "id": "sector-03-05:node-entry-guard",
        "kind": "sentry",
        "position": {
          "x": -825,
          "y": -400
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
        ]
      },
      {
        "accessModuleId": "sector-03:access-module:b",
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 384,
            "width": 512
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "artillery-drone-t1",
            "support-drone-t1",
            "swarm-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-03-05:node-exit-guard",
        "kind": "sentry",
        "position": {
          "x": 785,
          "y": -890
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional-for-stage",
          "kill-required-for-access-module-b",
          "no-rope-cut",
          "activation-band-only"
        ]
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-05:node-id"
        ],
        "id": "sector-03-05:node-id",
        "kind": "story-display",
        "position": {
          "x": 280,
          "y": -570
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-05:access-summary"
        ],
        "id": "sector-03-05:access-summary",
        "kind": "story-display",
        "position": {
          "x": 520,
          "y": -970
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-05:premium-atrium-ahead"
        ],
        "id": "sector-03-05:premium-atrium-ahead",
        "kind": "story-display",
        "position": {
          "x": 1376,
          "y": -1210
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-05:gate",
        "id": "sector-03-05:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-03-05:exit-panel-engaged",
        "position": {
          "x": 1296,
          "y": -1152
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-03-05:final-deck-reached",
          "sector-03-05:augment-selected"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-05:gate",
        "id": "sector-03-05:exit-gate",
        "kind": "gate",
        "position": {
          "x": 1376,
          "y": -1152
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 5,
    "recoveryPoints": [
      {
        "id": "sector-03-05:recovery-recovery-a",
        "sourceId": "recovery-a",
        "x": -256,
        "y": -624
      },
      {
        "id": "sector-03-05:recovery-recovery-b",
        "sourceId": "recovery-b",
        "x": 448,
        "y": -768
      }
    ],
    "routePoints": [
      {
        "id": "sector-03-05:route-entry",
        "sourceId": "entry",
        "x": -1184,
        "y": -64
      },
      {
        "id": "sector-03-05:route-g1",
        "sourceId": "g1",
        "x": -960,
        "y": -224
      },
      {
        "id": "sector-03-05:route-p1-left",
        "sourceId": "p1-left",
        "x": -810,
        "y": -290
      },
      {
        "id": "sector-03-05:route-p1-right",
        "sourceId": "p1-right",
        "x": -544,
        "y": -288
      },
      {
        "id": "sector-03-05:route-g2",
        "sourceId": "g2",
        "x": -640,
        "y": -448
      },
      {
        "id": "sector-03-05:route-p2-left",
        "sourceId": "p2-left",
        "x": -768,
        "y": -544
      },
      {
        "id": "sector-03-05:route-p2-right",
        "sourceId": "p2-right",
        "x": -512,
        "y": -544
      },
      {
        "id": "sector-03-05:route-g3",
        "sourceId": "g3",
        "x": -512,
        "y": -736
      },
      {
        "id": "sector-03-05:route-p3-left",
        "sourceId": "p3-left",
        "x": -384,
        "y": -800
      },
      {
        "id": "sector-03-05:route-p3-right",
        "sourceId": "p3-right",
        "x": 64,
        "y": -800
      },
      {
        "id": "sector-03-05:route-g4",
        "sourceId": "g4",
        "x": 192,
        "y": -928
      },
      {
        "id": "sector-03-05:route-p4-left",
        "sourceId": "p4-left",
        "x": 256,
        "y": -960
      },
      {
        "id": "sector-03-05:route-p4-right",
        "sourceId": "p4-right",
        "x": 576,
        "y": -960
      },
      {
        "id": "sector-03-05:route-g5",
        "sourceId": "g5",
        "x": 768,
        "y": -832
      },
      {
        "id": "sector-03-05:route-p5-left",
        "sourceId": "p5-left",
        "x": 832,
        "y": -864
      },
      {
        "id": "sector-03-05:route-g6",
        "sourceId": "g6",
        "x": 1120,
        "y": -1056
      },
      {
        "id": "sector-03-05:route-exit-left",
        "sourceId": "exit-left",
        "x": 1248,
        "y": -1152
      },
      {
        "id": "sector-03-05:route-exit",
        "sourceId": "exit",
        "x": 1376,
        "y": -1152
      }
    ],
    "routes": [
      "safe",
      "flow",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-03",
    "storyTriggers": [
      "commercial-service-node",
      "augment-available",
      "authority-scope",
      "calibration"
    ],
    "subtitle": "REST / AUGMENT SERVICE",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p0-entry",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1184,
          "y": 0
        },
        "sourceId": "p0-entry",
        "vertices": [
          {
            "x": -1296,
            "y": 0
          },
          {
            "x": -1072,
            "y": 0
          },
          {
            "x": -1072,
            "y": 32
          },
          {
            "x": -1296,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p1-delivery-approach",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -695,
          "y": -195
        },
        "sourceId": "p1-delivery-approach",
        "vertices": [
          {
            "x": -823,
            "y": -195
          },
          {
            "x": -567,
            "y": -195
          },
          {
            "x": -567,
            "y": -169
          },
          {
            "x": -823,
            "y": -169
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p2-tenant-delivery-passage",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -640,
          "y": -544
        },
        "sourceId": "p2-tenant-delivery-passage",
        "vertices": [
          {
            "x": -768,
            "y": -544
          },
          {
            "x": -512,
            "y": -544
          },
          {
            "x": -512,
            "y": -518
          },
          {
            "x": -768,
            "y": -518
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p3-operations-control-balcony",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 65,
          "y": -555
        },
        "sourceId": "p3-operations-control-balcony",
        "vertices": [
          {
            "x": -159,
            "y": -555
          },
          {
            "x": 289,
            "y": -555
          },
          {
            "x": 289,
            "y": -525
          },
          {
            "x": -159,
            "y": -525
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p4-signage-access-catwalk",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 416,
          "y": -960
        },
        "sourceId": "p4-signage-access-catwalk",
        "vertices": [
          {
            "x": 256,
            "y": -960
          },
          {
            "x": 576,
            "y": -960
          },
          {
            "x": 576,
            "y": -932
          },
          {
            "x": 256,
            "y": -932
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p5-tenant-transfer-deck",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 1015,
          "y": -775
        },
        "sourceId": "p5-tenant-transfer-deck",
        "vertices": [
          {
            "x": 887,
            "y": -775
          },
          {
            "x": 1143,
            "y": -775
          },
          {
            "x": 1143,
            "y": -747
          },
          {
            "x": 887,
            "y": -747
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
          "x": 1376,
          "y": -1152
        },
        "sourceId": "exit-deck",
        "vertices": [
          {
            "x": 1248,
            "y": -1152
          },
          {
            "x": 1504,
            "y": -1152
          },
          {
            "x": 1504,
            "y": -1124
          },
          {
            "x": 1248,
            "y": -1124
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
    "id": "3-5",
    "sector": 3,
    "sourceAreaId": "sector-03-05",
    "stage": 5
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
