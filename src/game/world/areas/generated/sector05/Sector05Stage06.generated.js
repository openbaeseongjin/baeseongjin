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
        "x": 470,
        "y": -1160
      },
      "target": {
        "id": "jam-a1-surface",
        "properties": {
          "sourceId": "jam-a1"
        },
        "x": 470,
        "y": -1160
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
        "x": 225,
        "y": -1080
      },
      "target": {
        "id": "merge-a-surface",
        "properties": {
          "sourceId": "merge-a"
        },
        "x": 225,
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
        "x": -145,
        "y": -995
      },
      "target": {
        "id": "drop-1-surface",
        "properties": {
          "sourceId": "drop-1"
        },
        "x": -145,
        "y": -995
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
        "x": 75,
        "y": -755
      },
      "target": {
        "id": "drop-2-surface",
        "properties": {
          "sourceId": "drop-2"
        },
        "x": 75,
        "y": -755
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
        "x": -260,
        "y": -610
      },
      "target": {
        "id": "trench-entry-surface",
        "properties": {
          "sourceId": "trench-entry"
        },
        "x": -260,
        "y": -610
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
        "x": 250,
        "y": -265
      },
      "target": {
        "id": "trench-1-surface",
        "properties": {
          "sourceId": "trench-1"
        },
        "x": 250,
        "y": -265
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
        "x": 515,
        "y": -160
      },
      "target": {
        "id": "trench-2-surface",
        "properties": {
          "sourceId": "trench-2"
        },
        "x": 515,
        "y": -160
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
        "id": "aegis-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "aegis-1",
          "sourceId": "aegis-1"
        },
        "x": 535,
        "y": -1455
      },
      "target": {
        "id": "aegis-1-surface",
        "properties": {
          "sourceId": "aegis-1"
        },
        "x": 535,
        "y": -1455
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
        "x": 255,
        "y": -1525
      },
      "target": {
        "id": "aegis-2-surface",
        "properties": {
          "sourceId": "aegis-2"
        },
        "x": 255,
        "y": -1525
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
        "y": -1875
      },
      "target": {
        "id": "record-1-surface",
        "properties": {
          "sourceId": "record-1"
        },
        "x": -260,
        "y": -1875
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
        "x": -40,
        "y": -2085
      },
      "target": {
        "id": "record-2-surface",
        "properties": {
          "sourceId": "record-2"
        },
        "x": -40,
        "y": -2085
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
    "jammerGroups": [],
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
          "x": -350,
          "y": -620
        },
        "coordinateAnchor": "center",
        "enemyType": "sentry-t1",
        "id": "sector-05-06:cutter-a",
        "kind": "sentry",
        "position": {
          "x": 300,
          "y": -220
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
          "x": -110,
          "y": -1765
        },
        "coordinateAnchor": "center",
        "enemyType": "shield-drone-t1",
        "id": "sector-05-06:aegis-a",
        "kind": "sentry",
        "position": {
          "x": 350,
          "y": -1505
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
          "x": 950,
          "y": -1315
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
      },
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 480,
            "width": 640
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "shield-drone-t1",
            "artillery-drone-t1",
            "support-drone-t1"
          ]
        },
        "id": "sector-05-06:route-guard-01",
        "kind": "sentry",
        "position": {
          "x": -160,
          "y": -980
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
            "height": 480,
            "width": 640
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "sentry-t1",
            "shield-drone-t1",
            "artillery-drone-t1"
          ]
        },
        "id": "sector-05-06:route-guard-02",
        "kind": "sentry",
        "position": {
          "x": -180,
          "y": -1920
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
        ]
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
          "x": -115,
          "y": -365
        },
        "vertices": [
          {
            "x": -325,
            "y": -365
          },
          {
            "x": 95,
            "y": -365
          },
          {
            "x": 95,
            "y": -341
          },
          {
            "x": -325,
            "y": -341
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
          "x": 795,
          "y": -1315
        },
        "vertices": [
          {
            "x": 635,
            "y": -1315
          },
          {
            "x": 955,
            "y": -1315
          },
          {
            "x": 955,
            "y": -1291
          },
          {
            "x": 635,
            "y": -1291
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
          "x": 10,
          "y": -1670
        },
        "vertices": [
          {
            "x": -170,
            "y": -1670
          },
          {
            "x": 190,
            "y": -1670
          },
          {
            "x": 190,
            "y": -1646
          },
          {
            "x": -170,
            "y": -1646
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
    "id": "5-6",
    "sector": 5,
    "sourceAreaId": "sector-05-06",
    "stage": 6
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
