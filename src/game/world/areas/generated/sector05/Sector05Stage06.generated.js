// GENERATED FILE - DO NOT EDIT
// Source: 5-6 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "5-6";
export const GENERATED_AREA_ID = "sector-05-06";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "entry",
        "properties": {
          "coordinateAnchor": "center",
          "label": "entry",
          "sourceId": "entry"
        },
        "x": 720,
        "y": -100
      },
      "target": {
        "id": "entry-surface",
        "properties": {
          "sourceId": "entry"
        },
        "x": 720,
        "y": -100
      }
    },
    {
      "landmark": {
        "id": "r0",
        "properties": {
          "coordinateAnchor": "center",
          "label": "r0",
          "sourceId": "r0"
        },
        "x": 720,
        "y": -400
      },
      "target": {
        "id": "r0-surface",
        "properties": {
          "sourceId": "r0"
        },
        "x": 720,
        "y": -400
      }
    },
    {
      "landmark": {
        "id": "r1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "r1",
          "sourceId": "r1"
        },
        "x": 720,
        "y": -700
      },
      "target": {
        "id": "r1-surface",
        "properties": {
          "sourceId": "r1"
        },
        "x": 720,
        "y": -700
      }
    },
    {
      "landmark": {
        "id": "p0",
        "properties": {
          "coordinateAnchor": "center",
          "label": "p0",
          "sourceId": "p0"
        },
        "x": 720,
        "y": -980
      },
      "target": {
        "id": "p0-surface",
        "properties": {
          "sourceId": "p0"
        },
        "x": 720,
        "y": -980
      }
    },
    {
      "landmark": {
        "id": "jam-a1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "jam-a1",
          "sourceId": "jam-a1"
        },
        "x": 430,
        "y": -1120
      },
      "target": {
        "id": "jam-a1-surface",
        "properties": {
          "sourceId": "jam-a1"
        },
        "x": 430,
        "y": -1120
      }
    },
    {
      "landmark": {
        "id": "jam-b1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "jam-b1",
          "sourceId": "jam-b1"
        },
        "x": 500,
        "y": -1230
      },
      "target": {
        "id": "jam-b1-surface",
        "properties": {
          "sourceId": "jam-b1"
        },
        "x": 500,
        "y": -1230
      }
    },
    {
      "landmark": {
        "id": "merge-a",
        "properties": {
          "coordinateAnchor": "center",
          "label": "merge-a",
          "sourceId": "merge-a"
        },
        "x": 160,
        "y": -1080
      },
      "target": {
        "id": "merge-a-surface",
        "properties": {
          "sourceId": "merge-a"
        },
        "x": 160,
        "y": -1080
      }
    },
    {
      "landmark": {
        "id": "drop-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "drop-1",
          "sourceId": "drop-1"
        },
        "x": -80,
        "y": -900
      },
      "target": {
        "id": "drop-1-surface",
        "properties": {
          "sourceId": "drop-1"
        },
        "x": -80,
        "y": -900
      }
    },
    {
      "landmark": {
        "id": "drop-2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "drop-2",
          "sourceId": "drop-2"
        },
        "x": -160,
        "y": -650
      },
      "target": {
        "id": "drop-2-surface",
        "properties": {
          "sourceId": "drop-2"
        },
        "x": -160,
        "y": -650
      }
    },
    {
      "landmark": {
        "id": "trench-entry",
        "properties": {
          "coordinateAnchor": "center",
          "label": "trench-entry",
          "sourceId": "trench-entry"
        },
        "x": -120,
        "y": -420
      },
      "target": {
        "id": "trench-entry-surface",
        "properties": {
          "sourceId": "trench-entry"
        },
        "x": -120,
        "y": -420
      }
    },
    {
      "landmark": {
        "id": "trench-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "trench-1",
          "sourceId": "trench-1"
        },
        "x": 180,
        "y": -360
      },
      "target": {
        "id": "trench-1-surface",
        "properties": {
          "sourceId": "trench-1"
        },
        "x": 180,
        "y": -360
      }
    },
    {
      "landmark": {
        "id": "trench-2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "trench-2",
          "sourceId": "trench-2"
        },
        "x": 500,
        "y": -360
      },
      "target": {
        "id": "trench-2-surface",
        "properties": {
          "sourceId": "trench-2"
        },
        "x": 500,
        "y": -360
      }
    },
    {
      "landmark": {
        "id": "trench-exit",
        "properties": {
          "coordinateAnchor": "center",
          "label": "trench-exit",
          "sourceId": "trench-exit"
        },
        "x": 800,
        "y": -420
      },
      "target": {
        "id": "trench-exit-surface",
        "properties": {
          "sourceId": "trench-exit"
        },
        "x": 800,
        "y": -420
      }
    },
    {
      "landmark": {
        "id": "riser-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "riser-1",
          "sourceId": "riser-1"
        },
        "x": 800,
        "y": -720
      },
      "target": {
        "id": "riser-1-surface",
        "properties": {
          "sourceId": "riser-1"
        },
        "x": 800,
        "y": -720
      }
    },
    {
      "landmark": {
        "id": "riser-2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "riser-2",
          "sourceId": "riser-2"
        },
        "x": 800,
        "y": -1020
      },
      "target": {
        "id": "riser-2-surface",
        "properties": {
          "sourceId": "riser-2"
        },
        "x": 800,
        "y": -1020
      }
    },
    {
      "landmark": {
        "id": "riser-top",
        "properties": {
          "coordinateAnchor": "center",
          "label": "riser-top",
          "sourceId": "riser-top"
        },
        "x": 800,
        "y": -1320
      },
      "target": {
        "id": "riser-top-surface",
        "properties": {
          "sourceId": "riser-top"
        },
        "x": 800,
        "y": -1320
      }
    },
    {
      "landmark": {
        "id": "aegis-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "aegis-1",
          "sourceId": "aegis-1"
        },
        "x": 520,
        "y": -1480
      },
      "target": {
        "id": "aegis-1-surface",
        "properties": {
          "sourceId": "aegis-1"
        },
        "x": 520,
        "y": -1480
      }
    },
    {
      "landmark": {
        "id": "aegis-2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "aegis-2",
          "sourceId": "aegis-2"
        },
        "x": 240,
        "y": -1580
      },
      "target": {
        "id": "aegis-2-surface",
        "properties": {
          "sourceId": "aegis-2"
        },
        "x": 240,
        "y": -1580
      }
    },
    {
      "landmark": {
        "id": "aegis-safe",
        "properties": {
          "coordinateAnchor": "center",
          "label": "aegis-safe",
          "sourceId": "aegis-safe"
        },
        "x": 0,
        "y": -1700
      },
      "target": {
        "id": "aegis-safe-surface",
        "properties": {
          "sourceId": "aegis-safe"
        },
        "x": 0,
        "y": -1700
      }
    },
    {
      "landmark": {
        "id": "record-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "record-1",
          "sourceId": "record-1"
        },
        "x": -260,
        "y": -1840
      },
      "target": {
        "id": "record-1-surface",
        "properties": {
          "sourceId": "record-1"
        },
        "x": -260,
        "y": -1840
      }
    },
    {
      "landmark": {
        "id": "record-2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "record-2",
          "sourceId": "record-2"
        },
        "x": -260,
        "y": -2080
      },
      "target": {
        "id": "record-2-surface",
        "properties": {
          "sourceId": "record-2"
        },
        "x": -260,
        "y": -2080
      }
    },
    {
      "landmark": {
        "id": "exit",
        "properties": {
          "coordinateAnchor": "center",
          "label": "exit",
          "sourceId": "exit"
        },
        "x": -520,
        "y": -2200
      },
      "target": {
        "id": "exit-surface",
        "properties": {
          "sourceId": "exit"
        },
        "x": -520,
        "y": -2200
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 2464,
      "width": 1950
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-05-06:entry",
      "x": 720,
      "y": -100
    },
    "exit": {
      "id": "sector-05-06:exit",
      "x": -520,
      "y": -2200
    },
    "gate": {
      "id": "sector-05-06:gate",
      "nextAreaId": "sector-05-07",
      "requiredObjectiveIds": [
        "exit-panel-engaged"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": -568,
        "y": -2296
      }
    },
    "id": "sector-05-06",
    "jammerGroups": [
      {
        "eligibleSurfaceIds": [
          "jam-a1-surface",
          "jam-b1-surface"
        ],
        "id": "sector-05-06:jammer-a:field",
        "sourceObjectId": "sector-05-06:jammer-a"
      }
    ],
    "name": "INCIDENT AUTHORIZATION ANNEX",
    "nextAreaId": "sector-05-07",
    "objectives": [
      {
        "bounds": {
          "height": 180,
          "width": 420,
          "x": -470,
          "y": -2260
        },
        "id": "routing-authorization",
        "sourceObjectId": "sector-05-06:routing-proof-03-of-03:terminal",
        "type": "interact"
      },
      {
        "bounds": {
          "height": 180,
          "width": 420,
          "x": -730,
          "y": -2348
        },
        "id": "final-deck-reached",
        "requiredObjectiveIds": [
          "routing-authorization"
        ],
        "type": "reach"
      },
      {
        "id": "exit-panel-engaged",
        "requiredObjectiveIds": [
          "final-deck-reached"
        ],
        "sourceObjectId": "sector-05-06:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "activation": {
          "height": 420,
          "width": 780,
          "x": 175,
          "y": -1320
        },
        "coordinateAnchor": "center",
        "enemyType": "hardpoint-jammer-v1",
        "id": "sector-05-06:jammer-a",
        "jammer": {
          "groupId": "sector-05-06:jammer-a:field"
        },
        "kind": "sentry",
        "position": {
          "x": 650,
          "y": -1120
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "no-projectile-attack"
        ]
      },
      {
        "activation": {
          "height": 520,
          "width": 1150,
          "x": -220,
          "y": -820
        },
        "coordinateAnchor": "center",
        "enemyType": "sentry-t1",
        "id": "sector-05-06:cutter-a",
        "kind": "sentry",
        "position": {
          "x": 430,
          "y": -420
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "cutter-fire"
        ]
      },
      {
        "activation": {
          "height": 440,
          "width": 1000,
          "x": -100,
          "y": -1800
        },
        "coordinateAnchor": "center",
        "enemyType": "shield-drone-t1",
        "id": "sector-05-06:aegis-a",
        "kind": "sentry",
        "position": {
          "x": 360,
          "y": -1540
        },
        "presentationId": "world-object:sentry",
        "rules": []
      },
      {
        "coordinateAnchor": "bottom-center",
        "id": "sector-05-06:routing-proof-03-of-03:terminal",
        "interactionRadius": 84,
        "kind": "story-display",
        "label": "ROUTING AUTHORIZATION · 03 / 03",
        "objectiveId": "routing-authorization",
        "position": {
          "x": -260,
          "y": -2080
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-05-06:gate",
        "id": "sector-05-06:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "exit-panel-engaged",
        "position": {
          "x": -632,
          "y": -2168
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-05-06:gate",
        "id": "sector-05-06:exit-gate",
        "kind": "gate",
        "position": {
          "x": -520,
          "y": -2168
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 6,
    "recoveryPoints": [
      {
        "id": "sector-05-06:recovery-1",
        "maxRetrySeconds": 5,
        "x": -120,
        "y": -500
      },
      {
        "id": "sector-05-06:recovery-2",
        "maxRetrySeconds": 5,
        "x": 500,
        "y": -820
      },
      {
        "id": "sector-05-06:recovery-3",
        "maxRetrySeconds": 5,
        "x": 520,
        "y": -1540
      }
    ],
    "routePoints": [
      {
        "id": "sector-05-06:route-entry",
        "sourceId": "entry",
        "x": 720,
        "y": -100
      },
      {
        "id": "sector-05-06:route-r0",
        "sourceId": "r0",
        "x": 720,
        "y": -400
      },
      {
        "id": "sector-05-06:route-r1",
        "sourceId": "r1",
        "x": 720,
        "y": -700
      },
      {
        "id": "sector-05-06:route-p0",
        "sourceId": "p0",
        "x": 720,
        "y": -980
      },
      {
        "id": "sector-05-06:route-jam-a1",
        "sourceId": "jam-a1",
        "x": 430,
        "y": -1120
      },
      {
        "id": "sector-05-06:route-merge-a",
        "sourceId": "merge-a",
        "x": 160,
        "y": -1080
      },
      {
        "id": "sector-05-06:route-jam-b1",
        "sourceId": "jam-b1",
        "x": 500,
        "y": -1230
      },
      {
        "id": "sector-05-06:route-drop-1",
        "sourceId": "drop-1",
        "x": -80,
        "y": -900
      },
      {
        "id": "sector-05-06:route-drop-2",
        "sourceId": "drop-2",
        "x": -160,
        "y": -650
      },
      {
        "id": "sector-05-06:route-trench-entry",
        "sourceId": "trench-entry",
        "x": -120,
        "y": -420
      },
      {
        "id": "sector-05-06:route-trench-1",
        "sourceId": "trench-1",
        "x": 180,
        "y": -360
      },
      {
        "id": "sector-05-06:route-trench-2",
        "sourceId": "trench-2",
        "x": 500,
        "y": -360
      },
      {
        "id": "sector-05-06:route-trench-exit",
        "sourceId": "trench-exit",
        "x": 800,
        "y": -420
      },
      {
        "id": "sector-05-06:route-riser-1",
        "sourceId": "riser-1",
        "x": 800,
        "y": -720
      },
      {
        "id": "sector-05-06:route-riser-2",
        "sourceId": "riser-2",
        "x": 800,
        "y": -1020
      },
      {
        "id": "sector-05-06:route-riser-top",
        "sourceId": "riser-top",
        "x": 800,
        "y": -1320
      },
      {
        "id": "sector-05-06:route-aegis-1",
        "sourceId": "aegis-1",
        "x": 520,
        "y": -1480
      },
      {
        "id": "sector-05-06:route-aegis-2",
        "sourceId": "aegis-2",
        "x": 240,
        "y": -1580
      },
      {
        "id": "sector-05-06:route-aegis-safe",
        "sourceId": "aegis-safe",
        "x": 0,
        "y": -1700
      },
      {
        "id": "sector-05-06:route-record-1",
        "sourceId": "record-1",
        "x": -260,
        "y": -1840
      },
      {
        "id": "sector-05-06:route-record-2",
        "sourceId": "record-2",
        "x": -260,
        "y": -2080
      },
      {
        "id": "sector-05-06:route-exit",
        "sourceId": "exit",
        "x": -520,
        "y": -2200
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-05",
    "storyTriggers": [],
    "subtitle": "ACTUAL RISE → DROP → LOWER TRENCH → RE-ASCENT → SIGN-OFF",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-06:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 720,
          "y": -68
        },
        "vertices": [
          {
            "x": 624,
            "y": -68
          },
          {
            "x": 816,
            "y": -68
          },
          {
            "x": 816,
            "y": -36
          },
          {
            "x": 624,
            "y": -36
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-06:runtime-deck-1",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 720,
          "y": -980
        },
        "vertices": [
          {
            "x": 540,
            "y": -980
          },
          {
            "x": 900,
            "y": -980
          },
          {
            "x": 900,
            "y": -956
          },
          {
            "x": 540,
            "y": -956
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-06:runtime-deck-2",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -120,
          "y": -420
        },
        "vertices": [
          {
            "x": -330,
            "y": -420
          },
          {
            "x": 90,
            "y": -420
          },
          {
            "x": 90,
            "y": -396
          },
          {
            "x": -330,
            "y": -396
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-06:runtime-deck-3",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 800,
          "y": -1320
        },
        "vertices": [
          {
            "x": 640,
            "y": -1320
          },
          {
            "x": 960,
            "y": -1320
          },
          {
            "x": 960,
            "y": -1296
          },
          {
            "x": 640,
            "y": -1296
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-06:runtime-deck-4",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 0,
          "y": -1700
        },
        "vertices": [
          {
            "x": -180,
            "y": -1700
          },
          {
            "x": 180,
            "y": -1700
          },
          {
            "x": 180,
            "y": -1676
          },
          {
            "x": -180,
            "y": -1676
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-06:runtime-deck-5",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -520,
          "y": -2168
        },
        "vertices": [
          {
            "x": -680,
            "y": -2168
          },
          {
            "x": -360,
            "y": -2168
          },
          {
            "x": -360,
            "y": -2144
          },
          {
            "x": -680,
            "y": -2144
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
    "id": "5-6",
    "sector": 5,
    "sourceAreaId": "sector-05-06",
    "stage": 6
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
