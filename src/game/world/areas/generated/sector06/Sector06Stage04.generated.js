// GENERATED FILE - DO NOT EDIT
// Source: 6-4 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "6-4";
export const GENERATED_AREA_ID = "sector-06-04";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "h01",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h01",
          "sourceId": "h01"
        },
        "x": -380,
        "y": -200
      },
      "target": {
        "id": "h01-surface",
        "properties": {
          "sourceId": "h01"
        },
        "x": -380,
        "y": -200
      }
    },
    {
      "landmark": {
        "id": "h02",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h02",
          "sourceId": "h02"
        },
        "x": -120,
        "y": -260
      },
      "target": {
        "id": "h02-surface",
        "properties": {
          "sourceId": "h02"
        },
        "x": -120,
        "y": -260
      }
    },
    {
      "landmark": {
        "id": "h03",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h03",
          "sourceId": "h03"
        },
        "x": -10,
        "y": -530
      },
      "target": {
        "id": "h03-surface",
        "properties": {
          "sourceId": "h03"
        },
        "x": -10,
        "y": -530
      }
    },
    {
      "landmark": {
        "id": "h06",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h06",
          "sourceId": "h06"
        },
        "x": -255,
        "y": -790
      },
      "target": {
        "id": "h06-surface",
        "properties": {
          "sourceId": "h06"
        },
        "x": -255,
        "y": -790
      }
    },
    {
      "landmark": {
        "id": "sector-06-04:editor-anchor-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "NEW"
        },
        "x": -345,
        "y": -1020
      },
      "target": {
        "id": "sector-06-04:editor-anchor-1-surface",
        "properties": {},
        "x": -345,
        "y": -1020
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1184,
      "width": 1504
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-06-04:entry",
      "x": -570,
      "y": -140
    },
    "exit": {
      "id": "sector-06-04:exit",
      "x": -80,
      "y": -920
    },
    "gate": {
      "id": "sector-06-04:gate",
      "nextAreaId": "sector-06-05",
      "requiredObjectiveIds": [
        "sector-06-04:exit-panel-engaged"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": -128,
        "y": -1000
      }
    },
    "id": "sector-06-04",
    "name": "ROOFTOP SERVICE SHELTER",
    "nextAreaId": "sector-06-05",
    "objectives": [
      {
        "id": "sector-06-04:exit-panel-engaged",
        "sourceObjectId": "sector-06-04:exit-panel",
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
            "height": 480,
            "width": 640
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "sentry-t1",
            "patrol-drone-t1",
            "pursuit-drone-t1"
          ]
        },
        "id": "sector-06-04:route-guard-01",
        "kind": "sentry",
        "position": {
          "x": -200,
          "y": -340
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
            "shield-drone-t1",
            "artillery-drone-t1",
            "support-drone-t1"
          ]
        },
        "id": "sector-06-04:route-guard-02",
        "kind": "sentry",
        "position": {
          "x": 100,
          "y": -550
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
            "patrol-drone-t1",
            "pursuit-drone-t1"
          ]
        },
        "id": "sector-06-04:route-guard-03",
        "kind": "sentry",
        "position": {
          "x": -240,
          "y": -840
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
            "shield-drone-t1",
            "artillery-drone-t1",
            "support-drone-t1"
          ]
        },
        "id": "sector-06-04:route-guard-04",
        "kind": "sentry",
        "position": {
          "x": -120,
          "y": -750
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
            "patrol-drone-t1",
            "pursuit-drone-t1"
          ]
        },
        "id": "sector-06-04:route-guard-05",
        "kind": "sentry",
        "position": {
          "x": -300,
          "y": -280
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
        "gateId": "sector-06-04:gate",
        "id": "sector-06-04:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-06-04:exit-panel-engaged",
        "position": {
          "x": -80,
          "y": -950
        },
        "presentationId": "world-object:gate-panel"
      }
    ],
    "order": 4,
    "recoveryPoints": [
      {
        "id": "sector-06-04:recovery-R1",
        "maxRetrySeconds": 5,
        "sourceId": "R1",
        "x": -35,
        "y": -405
      }
    ],
    "routePoints": [
      {
        "id": "sector-06-04:route-h01",
        "sourceId": "h01",
        "x": -380,
        "y": -200
      },
      {
        "id": "sector-06-04:route-h02",
        "sourceId": "h02",
        "x": -120,
        "y": -260
      },
      {
        "id": "sector-06-04:route-h03",
        "sourceId": "h03",
        "x": 20,
        "y": -470
      },
      {
        "id": "sector-06-04:route-h04",
        "sourceId": "h04",
        "x": -40,
        "y": -670
      },
      {
        "id": "sector-06-04:route-h05",
        "sourceId": "h05",
        "x": -320,
        "y": -760
      },
      {
        "id": "sector-06-04:route-h06",
        "sourceId": "h06",
        "x": -80,
        "y": -920
      },
      {
        "id": "sector-06-04:route-exit",
        "sourceId": "exit",
        "x": -144,
        "y": -920
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-06",
    "storyTriggers": [],
    "subtitle": "COMPACT REST / SHELTER WRAP / GOAL REVEAL",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-06-04:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -570,
          "y": -108
        },
        "vertices": [
          {
            "x": -666,
            "y": -108
          },
          {
            "x": -474,
            "y": -108
          },
          {
            "x": -474,
            "y": -76
          },
          {
            "x": -666,
            "y": -76
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "shelter-upper-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -170,
          "y": -700
        },
        "vertices": [
          {
            "x": -170,
            "y": -700
          },
          {
            "x": 150,
            "y": -700
          },
          {
            "x": 150,
            "y": -668
          },
          {
            "x": -170,
            "y": -668
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "pad-view-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -675,
          "y": -875
        },
        "vertices": [
          {
            "x": -675,
            "y": -875
          },
          {
            "x": -375,
            "y": -875
          },
          {
            "x": -375,
            "y": -843
          },
          {
            "x": -675,
            "y": -843
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "shelter-exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -210,
          "y": -950
        },
        "vertices": [
          {
            "x": -210,
            "y": -950
          },
          {
            "x": 100,
            "y": -950
          },
          {
            "x": 100,
            "y": -918
          },
          {
            "x": -210,
            "y": -918
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "R1",
        "kind": "recovery",
        "maxRetrySeconds": 5,
        "oneWay": true,
        "position": {
          "x": -160,
          "y": -405
        },
        "vertices": [
          {
            "x": -160,
            "y": -405
          },
          {
            "x": 90,
            "y": -405
          },
          {
            "x": 90,
            "y": -387
          },
          {
            "x": -160,
            "y": -387
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
    "id": "6-4",
    "sector": 6,
    "sourceAreaId": "sector-06-04",
    "stage": 4
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
