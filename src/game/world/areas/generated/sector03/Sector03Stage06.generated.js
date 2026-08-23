// GENERATED FILE - DO NOT EDIT
// Source: 3-6 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "3-6";
export const GENERATED_AREA_ID = "sector-03-06";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-03-06:g1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g1"
        },
        "x": -1280,
        "y": -320
      },
      "target": {
        "id": "sector-03-06:g1-surface",
        "properties": {
          "sourceId": "g1"
        },
        "x": -1280,
        "y": -320
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:c1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "c1"
        },
        "x": -920,
        "y": -448
      },
      "target": {
        "id": "sector-03-06:c1-surface",
        "properties": {
          "scannerControlled": true,
          "sourceId": "c1"
        },
        "x": -920,
        "y": -448
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:g2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G2",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g2"
        },
        "x": -560,
        "y": -576
      },
      "target": {
        "id": "sector-03-06:g2-surface",
        "properties": {
          "sourceId": "g2"
        },
        "x": -560,
        "y": -576
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:g3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G3",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g3"
        },
        "x": -200,
        "y": -704
      },
      "target": {
        "id": "sector-03-06:g3-surface",
        "properties": {
          "sourceId": "g3"
        },
        "x": -200,
        "y": -704
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:g4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G4",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g4"
        },
        "x": 160,
        "y": -832
      },
      "target": {
        "id": "sector-03-06:g4-surface",
        "properties": {
          "sourceId": "g4"
        },
        "x": 160,
        "y": -832
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:g4b",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G4B",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g4b"
        },
        "x": 520,
        "y": -900
      },
      "target": {
        "id": "sector-03-06:g4b-surface",
        "properties": {
          "sourceId": "g4b"
        },
        "x": 520,
        "y": -900
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:g4c",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G4C",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g4c"
        },
        "x": 880,
        "y": -928
      },
      "target": {
        "id": "sector-03-06:g4c-surface",
        "properties": {
          "sourceId": "g4c"
        },
        "x": 880,
        "y": -928
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:v1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "V1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "v1"
        },
        "x": 1480,
        "y": -1120
      },
      "target": {
        "id": "sector-03-06:v1-surface",
        "properties": {
          "sourceId": "v1"
        },
        "x": 1480,
        "y": -1120
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:v2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "V2",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "v2"
        },
        "x": 1440,
        "y": -1320
      },
      "target": {
        "id": "sector-03-06:v2-surface",
        "properties": {
          "sourceId": "v2"
        },
        "x": 1440,
        "y": -1320
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:c2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C2",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "c2"
        },
        "x": 1184,
        "y": -1496
      },
      "target": {
        "id": "sector-03-06:c2-surface",
        "properties": {
          "scannerControlled": true,
          "sourceId": "c2"
        },
        "x": 1184,
        "y": -1496
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:g7",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G7",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g7"
        },
        "x": 832,
        "y": -1536
      },
      "target": {
        "id": "sector-03-06:g7-surface",
        "properties": {
          "sourceId": "g7"
        },
        "x": 832,
        "y": -1536
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:g8",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G8",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g8"
        },
        "x": 480,
        "y": -1576
      },
      "target": {
        "id": "sector-03-06:g8-surface",
        "properties": {
          "sourceId": "g8"
        },
        "x": 480,
        "y": -1576
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:g9",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G9",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g9"
        },
        "x": 128,
        "y": -1616
      },
      "target": {
        "id": "sector-03-06:g9-surface",
        "properties": {
          "sourceId": "g9"
        },
        "x": 128,
        "y": -1616
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:g10",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G10",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g10"
        },
        "x": -224,
        "y": -1656
      },
      "target": {
        "id": "sector-03-06:g10-surface",
        "properties": {
          "sourceId": "g10"
        },
        "x": -224,
        "y": -1656
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:f1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "F1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "f1"
        },
        "x": -320,
        "y": -1800
      },
      "target": {
        "id": "sector-03-06:f1-surface",
        "properties": {
          "sourceId": "f1"
        },
        "x": -320,
        "y": -1800
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:f2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "F2",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "f2"
        },
        "x": 32,
        "y": -1880
      },
      "target": {
        "id": "sector-03-06:f2-surface",
        "properties": {
          "sourceId": "f2"
        },
        "x": 32,
        "y": -1880
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:f3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "F3",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "f3"
        },
        "x": 384,
        "y": -1960
      },
      "target": {
        "id": "sector-03-06:f3-surface",
        "properties": {
          "sourceId": "f3"
        },
        "x": 384,
        "y": -1960
      }
    },
    {
      "landmark": {
        "id": "sector-03-06:f4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "F4",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "f4"
        },
        "x": 736,
        "y": -2040
      },
      "target": {
        "id": "sector-03-06:f4-surface",
        "properties": {
          "sourceId": "f4"
        },
        "x": 736,
        "y": -2040
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 2336,
      "width": 4352
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "premium-atrium",
      "large-movement"
    ],
    "entry": {
      "id": "sector-03-06:entry",
      "x": -1920,
      "y": -32
    },
    "exit": {
      "id": "sector-03-06:exit",
      "x": 1184,
      "y": -2070
    },
    "gate": {
      "id": "sector-03-06:gate",
      "nextAreaId": "sector-03-07",
      "requiredObjectiveIds": [
        "sector-03-06:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 1158,
        "y": -2132
      }
    },
    "id": "sector-03-06",
    "name": "GRAND CENTRAL ATRIUM",
    "nextAreaId": "sector-03-07",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 320,
          "x": 1024,
          "y": -2102
        },
        "id": "sector-03-06:final-deck-reached",
        "type": "reach"
      },
      {
        "id": "sector-03-06:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-03-06:final-deck-reached"
        ],
        "sourceObjectId": "sector-03-06:exit-panel",
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
            "height": 448,
            "width": 960
          }
        },
        "coordinateAnchor": "center",
        "enemyType": "patrol-drone-t1",
        "id": "sector-03-06:drone-1",
        "kind": "patrol-drone",
        "patrol": {
          "mode": "pingpong",
          "points": [
            {
              "x": 960,
              "y": -1512
            },
            {
              "x": 240,
              "y": -1600
            }
          ],
          "speed": 48,
          "waitSeconds": 0.45
        },
        "position": {
          "x": 960,
          "y": -1512
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
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 448,
            "width": 640
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
        "id": "sector-03-06:atrium-lower-guard",
        "kind": "sentry",
        "position": {
          "x": 1280,
          "y": -928
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
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 448,
            "width": 640
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
        "id": "sector-03-06:atrium-upper-guard",
        "kind": "sentry",
        "position": {
          "x": -768,
          "y": -1680
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
        ]
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-06:atrium-id"
        ],
        "id": "sector-03-06:atrium-id",
        "kind": "story-display",
        "position": {
          "x": -1680,
          "y": -218
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-06:power-state"
        ],
        "id": "sector-03-06:power-state",
        "kind": "story-display",
        "position": {
          "x": 1248,
          "y": -954
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-06:upper-concourse"
        ],
        "id": "sector-03-06:upper-concourse",
        "kind": "story-display",
        "position": {
          "x": -768,
          "y": -1706
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-06:access-control-ahead"
        ],
        "id": "sector-03-06:access-control-ahead",
        "kind": "story-display",
        "position": {
          "x": 1184,
          "y": -2128
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-06:gate",
        "id": "sector-03-06:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-03-06:exit-panel-engaged",
        "position": {
          "x": 1104,
          "y": -2070
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-03-06:final-deck-reached"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-06:gate",
        "id": "sector-03-06:exit-gate",
        "kind": "gate",
        "position": {
          "x": 1184,
          "y": -2070
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 6,
    "recoveryPoints": [
      {
        "id": "sector-03-06:recovery-recovery-a",
        "sourceId": "recovery-a",
        "x": -1112,
        "y": -690
      },
      {
        "id": "sector-03-06:recovery-recovery-b",
        "sourceId": "recovery-b",
        "x": 1168,
        "y": -1725
      }
    ],
    "routePoints": [
      {
        "id": "sector-03-06:route-g1",
        "sourceId": "g1",
        "x": -1280,
        "y": -320
      },
      {
        "id": "sector-03-06:route-c1",
        "sourceId": "c1",
        "x": -920,
        "y": -448
      },
      {
        "id": "sector-03-06:route-g2",
        "sourceId": "g2",
        "x": -560,
        "y": -576
      },
      {
        "id": "sector-03-06:route-g3",
        "sourceId": "g3",
        "x": -200,
        "y": -704
      },
      {
        "id": "sector-03-06:route-g4",
        "sourceId": "g4",
        "x": 160,
        "y": -832
      },
      {
        "id": "sector-03-06:route-g4b",
        "sourceId": "g4b",
        "x": 520,
        "y": -900
      },
      {
        "id": "sector-03-06:route-g4c",
        "sourceId": "g4c",
        "x": 880,
        "y": -928
      },
      {
        "id": "sector-03-06:route-v1",
        "sourceId": "v1",
        "x": 1480,
        "y": -1120
      },
      {
        "id": "sector-03-06:route-v2",
        "sourceId": "v2",
        "x": 1440,
        "y": -1320
      },
      {
        "id": "sector-03-06:route-c2",
        "sourceId": "c2",
        "x": 1184,
        "y": -1496
      },
      {
        "id": "sector-03-06:route-g7",
        "sourceId": "g7",
        "x": 832,
        "y": -1536
      },
      {
        "id": "sector-03-06:route-g8",
        "sourceId": "g8",
        "x": 480,
        "y": -1576
      },
      {
        "id": "sector-03-06:route-g9",
        "sourceId": "g9",
        "x": 128,
        "y": -1616
      },
      {
        "id": "sector-03-06:route-g10",
        "sourceId": "g10",
        "x": -224,
        "y": -1656
      },
      {
        "id": "sector-03-06:route-f1",
        "sourceId": "f1",
        "x": -320,
        "y": -1800
      },
      {
        "id": "sector-03-06:route-f2",
        "sourceId": "f2",
        "x": 32,
        "y": -1880
      },
      {
        "id": "sector-03-06:route-f3",
        "sourceId": "f3",
        "x": 384,
        "y": -1960
      },
      {
        "id": "sector-03-06:route-f4",
        "sourceId": "f4",
        "x": 736,
        "y": -2040
      },
      {
        "id": "sector-03-06:route-sector-03-06:entry",
        "sourceId": "sector-03-06:entry",
        "x": -1920,
        "y": -64
      }
    ],
    "routes": [
      "safe",
      "flow",
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
          "sector-03-06:c1-surface",
          "sector-03-06:c2-surface"
        ],
        "cycle": {
          "available": 1.5,
          "locked": 1.1,
          "reset": 0.3,
          "warning": 0.6
        },
        "id": "sector-03-06:scanner-premium-atrium-A",
        "phaseOffsetSeconds": 0
      }
    ],
    "sectorId": "sector-03",
    "storyTriggers": [
      "premium-atrium",
      "local-power",
      "security-timing"
    ],
    "subtitle": "LARGE MOVEMENT",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p0-entry",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1920,
          "y": 0
        },
        "sourceId": "p0-entry",
        "vertices": [
          {
            "x": -2048,
            "y": 0
          },
          {
            "x": -1792,
            "y": 0
          },
          {
            "x": -1792,
            "y": 32
          },
          {
            "x": -2048,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p1-lower-grand-balcony",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1680,
          "y": -192
        },
        "sourceId": "p1-lower-grand-balcony",
        "vertices": [
          {
            "x": -1904,
            "y": -192
          },
          {
            "x": -1456,
            "y": -192
          },
          {
            "x": -1456,
            "y": -162
          },
          {
            "x": -1904,
            "y": -162
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p2-east-event-balcony",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 1248,
          "y": -928
        },
        "sourceId": "p2-east-event-balcony",
        "vertices": [
          {
            "x": 1024,
            "y": -928
          },
          {
            "x": 1472,
            "y": -928
          },
          {
            "x": 1472,
            "y": -898
          },
          {
            "x": 1024,
            "y": -898
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p3-east-sky-lobby",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1408,
          "y": -1408
        },
        "sourceId": "p3-east-sky-lobby",
        "vertices": [
          {
            "x": 1216,
            "y": -1408
          },
          {
            "x": 1600,
            "y": -1408
          },
          {
            "x": 1600,
            "y": -1378
          },
          {
            "x": 1216,
            "y": -1378
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p4-west-upper-gallery",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -768,
          "y": -1680
        },
        "sourceId": "p4-west-upper-gallery",
        "vertices": [
          {
            "x": -960,
            "y": -1680
          },
          {
            "x": -576,
            "y": -1680
          },
          {
            "x": -576,
            "y": -1650
          },
          {
            "x": -960,
            "y": -1650
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p5-exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1184,
          "y": -2070
        },
        "sourceId": "p5-exit-deck",
        "vertices": [
          {
            "x": 1024,
            "y": -2070
          },
          {
            "x": 1344,
            "y": -2070
          },
          {
            "x": 1344,
            "y": -2040
          },
          {
            "x": 1024,
            "y": -2040
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
    "id": "3-6",
    "sector": 3,
    "sourceAreaId": "sector-03-06",
    "stage": 6
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
