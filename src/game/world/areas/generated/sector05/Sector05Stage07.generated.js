// GENERATED FILE - DO NOT EDIT
// Source: 5-7 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "5-7";
export const GENERATED_AREA_ID = "sector-05-07";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "h00",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h00",
          "sourceId": "h00"
        },
        "x": -980,
        "y": -180
      },
      "target": {
        "id": "h00-surface",
        "properties": {
          "sourceId": "h00"
        },
        "x": -980,
        "y": -180
      }
    },
    {
      "landmark": {
        "id": "h01",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h01",
          "sourceId": "h01"
        },
        "x": -660,
        "y": -240
      },
      "target": {
        "id": "h01-surface",
        "properties": {
          "sourceId": "h01"
        },
        "x": -660,
        "y": -240
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
        "x": -320,
        "y": -240
      },
      "target": {
        "id": "h02-surface",
        "properties": {
          "sourceId": "h02"
        },
        "x": -320,
        "y": -240
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
        "x": 20,
        "y": -240
      },
      "target": {
        "id": "h03-surface",
        "properties": {
          "sourceId": "h03"
        },
        "x": 20,
        "y": -240
      }
    },
    {
      "landmark": {
        "id": "h04",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h04",
          "sourceId": "h04"
        },
        "x": 360,
        "y": -300
      },
      "target": {
        "id": "h04-surface",
        "properties": {
          "sourceId": "h04"
        },
        "x": 360,
        "y": -300
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
        "x": 500,
        "y": -820
      },
      "target": {
        "id": "h06-surface",
        "properties": {
          "sourceId": "h06"
        },
        "x": 500,
        "y": -820
      }
    },
    {
      "landmark": {
        "id": "h07",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h07",
          "sourceId": "h07"
        },
        "x": 180,
        "y": -880
      },
      "target": {
        "id": "h07-surface",
        "properties": {
          "sourceId": "h07"
        },
        "x": 180,
        "y": -880
      }
    },
    {
      "landmark": {
        "id": "h08",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h08",
          "sourceId": "h08"
        },
        "x": -160,
        "y": -880
      },
      "target": {
        "id": "h08-surface",
        "properties": {
          "sourceId": "h08"
        },
        "x": -160,
        "y": -880
      }
    },
    {
      "landmark": {
        "id": "h12",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h12",
          "sourceId": "h12"
        },
        "x": -1045,
        "y": -1270
      },
      "target": {
        "id": "h12-surface",
        "properties": {
          "sourceId": "h12"
        },
        "x": -1045,
        "y": -1270
      }
    },
    {
      "landmark": {
        "id": "h13",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h13",
          "sourceId": "h13"
        },
        "x": -965,
        "y": -1530
      },
      "target": {
        "id": "h13-surface",
        "properties": {
          "sourceId": "h13"
        },
        "x": -965,
        "y": -1530
      }
    },
    {
      "landmark": {
        "id": "h17",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h17",
          "sourceId": "h17"
        },
        "x": 100,
        "y": -1775
      },
      "target": {
        "id": "h17-surface",
        "properties": {
          "sourceId": "h17"
        },
        "x": 100,
        "y": -1775
      }
    },
    {
      "landmark": {
        "id": "h18",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h18",
          "sourceId": "h18"
        },
        "x": 325,
        "y": -1970
      },
      "target": {
        "id": "h18-surface",
        "properties": {
          "sourceId": "h18"
        },
        "x": 325,
        "y": -1970
      }
    },
    {
      "landmark": {
        "id": "h19",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h19",
          "sourceId": "h19"
        },
        "x": 50,
        "y": -2075
      },
      "target": {
        "id": "h19-surface",
        "properties": {
          "sourceId": "h19"
        },
        "x": 50,
        "y": -2075
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 2560,
      "width": 2496
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-05-07:entry",
      "x": -980,
      "y": -180
    },
    "exit": {
      "id": "sector-05-07:exit",
      "x": -220,
      "y": -2280
    },
    "gate": {
      "id": "sector-05-07:gate",
      "nextAreaId": "sector-05-08",
      "requiredObjectiveIds": [
        "exit-panel-engaged"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": -268,
        "y": -2376
      }
    },
    "id": "sector-05-07",
    "jammerGroups": [],
    "name": "EVACUATION CONSEQUENCE ARCHIVE",
    "nextAreaId": "sector-05-08",
    "objectives": [
      {
        "bounds": {
          "height": 180,
          "width": 420,
          "x": -430,
          "y": -2428
        },
        "id": "final-deck-reached",
        "type": "reach"
      },
      {
        "id": "exit-panel-engaged",
        "requiredObjectiveIds": [
          "final-deck-reached"
        ],
        "sourceObjectId": "sector-05-07:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "activation": {
          "height": 620,
          "width": 1900,
          "x": -1200,
          "y": -760
        },
        "coordinateAnchor": "center",
        "enemyType": "artillery-drone-t1",
        "id": "sector-05-07:artillery-a",
        "kind": "sentry",
        "position": {
          "x": -260,
          "y": -360
        },
        "presentationId": "world-object:sentry",
        "rules": []
      },
      {
        "activation": {
          "height": 600,
          "width": 1900,
          "x": -1248,
          "y": -1500
        },
        "coordinateAnchor": "center",
        "enemyType": "sentry-t1",
        "id": "sector-05-07:cutter-a",
        "kind": "sentry",
        "position": {
          "x": -760,
          "y": -1080
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "cutter-fire"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-05-07:gate",
        "id": "sector-05-07:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "exit-panel-engaged",
        "position": {
          "x": -332,
          "y": -2240
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-05-07:gate",
        "id": "sector-05-07:exit-gate",
        "kind": "gate",
        "position": {
          "x": -220,
          "y": -2240
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 7,
    "recoveryPoints": [
      {
        "id": "sector-05-07:recovery-1",
        "maxRetrySeconds": 5,
        "x": 360,
        "y": -620
      },
      {
        "id": "sector-05-07:recovery-2",
        "maxRetrySeconds": 5,
        "x": -840,
        "y": -1240
      },
      {
        "id": "sector-05-07:recovery-3",
        "maxRetrySeconds": 5,
        "x": -220,
        "y": -1940
      }
    ],
    "routePoints": [
      {
        "id": "sector-05-07:route-h00",
        "sourceId": "h00",
        "x": -980,
        "y": -180
      },
      {
        "id": "sector-05-07:route-h01",
        "sourceId": "h01",
        "x": -660,
        "y": -240
      },
      {
        "id": "sector-05-07:route-h02",
        "sourceId": "h02",
        "x": -320,
        "y": -240
      },
      {
        "id": "sector-05-07:route-h03",
        "sourceId": "h03",
        "x": 20,
        "y": -240
      },
      {
        "id": "sector-05-07:route-h04",
        "sourceId": "h04",
        "x": 360,
        "y": -300
      },
      {
        "id": "sector-05-07:route-h05",
        "sourceId": "h05",
        "x": 500,
        "y": -560
      },
      {
        "id": "sector-05-07:route-h06",
        "sourceId": "h06",
        "x": 500,
        "y": -820
      },
      {
        "id": "sector-05-07:route-h07",
        "sourceId": "h07",
        "x": 180,
        "y": -880
      },
      {
        "id": "sector-05-07:route-h08",
        "sourceId": "h08",
        "x": -160,
        "y": -880
      },
      {
        "id": "sector-05-07:route-h09",
        "sourceId": "h09",
        "x": -500,
        "y": -920
      },
      {
        "id": "sector-05-07:route-h10",
        "sourceId": "h10",
        "x": -840,
        "y": -980
      },
      {
        "id": "sector-05-07:route-h11",
        "sourceId": "h11",
        "x": -1120,
        "y": -1080
      },
      {
        "id": "sector-05-07:route-h12",
        "sourceId": "h12",
        "x": -1120,
        "y": -1360
      },
      {
        "id": "sector-05-07:route-h13",
        "sourceId": "h13",
        "x": -1120,
        "y": -1600
      },
      {
        "id": "sector-05-07:route-h14",
        "sourceId": "h14",
        "x": -820,
        "y": -1660
      },
      {
        "id": "sector-05-07:route-h15",
        "sourceId": "h15",
        "x": -520,
        "y": -1660
      },
      {
        "id": "sector-05-07:route-h16",
        "sourceId": "h16",
        "x": -220,
        "y": -1660
      },
      {
        "id": "sector-05-07:route-h17",
        "sourceId": "h17",
        "x": 80,
        "y": -1700
      },
      {
        "id": "sector-05-07:route-h18",
        "sourceId": "h18",
        "x": 240,
        "y": -1940
      },
      {
        "id": "sector-05-07:route-h19",
        "sourceId": "h19",
        "x": 80,
        "y": -2140
      },
      {
        "id": "sector-05-07:route-h20",
        "sourceId": "h20",
        "x": -220,
        "y": -2280
      },
      {
        "id": "sector-05-07:route-exit",
        "sourceId": "exit",
        "x": -220,
        "y": -2280
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-05",
    "storyTriggers": [],
    "subtitle": "ASYMMETRIC THREE-TIER SWITCHBACK / ARTILLERY → CUTTER → STORY SAFE",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-07:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -980,
          "y": -148
        },
        "vertices": [
          {
            "x": -1076,
            "y": -148
          },
          {
            "x": -884,
            "y": -148
          },
          {
            "x": -884,
            "y": -116
          },
          {
            "x": -1076,
            "y": -116
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-07:runtime-deck-1",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 850,
          "y": -520
        },
        "vertices": [
          {
            "x": 470,
            "y": -520
          },
          {
            "x": 1230,
            "y": -520
          },
          {
            "x": 1230,
            "y": -496
          },
          {
            "x": 470,
            "y": -496
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-07:runtime-deck-2",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -775,
          "y": -1050
        },
        "vertices": [
          {
            "x": -1155,
            "y": -1050
          },
          {
            "x": -395,
            "y": -1050
          },
          {
            "x": -395,
            "y": -1026
          },
          {
            "x": -1155,
            "y": -1026
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-07:runtime-deck-3",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -430,
          "y": -1635
        },
        "vertices": [
          {
            "x": -810,
            "y": -1635
          },
          {
            "x": -50,
            "y": -1635
          },
          {
            "x": -50,
            "y": -1611
          },
          {
            "x": -810,
            "y": -1611
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-07:runtime-deck-4",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -180,
          "y": -2240
        },
        "vertices": [
          {
            "x": -340,
            "y": -2240
          },
          {
            "x": -20,
            "y": -2240
          },
          {
            "x": -20,
            "y": -2216
          },
          {
            "x": -340,
            "y": -2216
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
    "id": "5-7",
    "sector": 5,
    "sourceAreaId": "sector-05-07",
    "stage": 7
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
