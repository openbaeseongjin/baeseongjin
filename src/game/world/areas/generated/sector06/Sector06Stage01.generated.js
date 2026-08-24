// GENERATED FILE - DO NOT EDIT
// Source: 6-1 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "6-1";
export const GENERATED_AREA_ID = "sector-06-01";
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
        "x": 550,
        "y": -2225
      },
      "target": {
        "id": "h00-surface",
        "properties": {
          "sourceId": "h00"
        },
        "x": 550,
        "y": -2225
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
        "x": 420,
        "y": -1910
      },
      "target": {
        "id": "h01-surface",
        "properties": {
          "sourceId": "h01"
        },
        "x": 420,
        "y": -1910
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
        "x": 170,
        "y": -1730
      },
      "target": {
        "id": "h02-surface",
        "properties": {
          "sourceId": "h02"
        },
        "x": 170,
        "y": -1730
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
        "x": -90,
        "y": -1540
      },
      "target": {
        "id": "h03-surface",
        "properties": {
          "sourceId": "h03"
        },
        "x": -90,
        "y": -1540
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
        "x": -350,
        "y": -1360
      },
      "target": {
        "id": "h04-surface",
        "properties": {
          "sourceId": "h04"
        },
        "x": -350,
        "y": -1360
      }
    },
    {
      "landmark": {
        "id": "h05",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h05",
          "sourceId": "h05"
        },
        "x": -515,
        "y": -1165
      },
      "target": {
        "id": "h05-surface",
        "properties": {
          "sourceId": "h05"
        },
        "x": -515,
        "y": -1165
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
        "x": -815,
        "y": -1145
      },
      "target": {
        "id": "h07-surface",
        "properties": {
          "sourceId": "h07"
        },
        "x": -815,
        "y": -1145
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
        "x": -760,
        "y": -1460
      },
      "target": {
        "id": "h08-surface",
        "properties": {
          "sourceId": "h08"
        },
        "x": -760,
        "y": -1460
      }
    },
    {
      "landmark": {
        "id": "h09",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h09",
          "sourceId": "h09"
        },
        "x": -735,
        "y": -1800
      },
      "target": {
        "id": "h09-surface",
        "properties": {
          "sourceId": "h09"
        },
        "x": -735,
        "y": -1800
      }
    },
    {
      "landmark": {
        "id": "h11",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h11",
          "sourceId": "h11"
        },
        "x": -520,
        "y": -2240
      },
      "target": {
        "id": "h11-surface",
        "properties": {
          "sourceId": "h11"
        },
        "x": -520,
        "y": -2240
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
        "x": -240,
        "y": -2330
      },
      "target": {
        "id": "h12-surface",
        "properties": {
          "sourceId": "h12"
        },
        "x": -240,
        "y": -2330
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
        "x": 60,
        "y": -2370
      },
      "target": {
        "id": "h13-surface",
        "properties": {
          "sourceId": "h13"
        },
        "x": 60,
        "y": -2370
      }
    },
    {
      "landmark": {
        "id": "h14",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h14",
          "sourceId": "h14"
        },
        "x": 330,
        "y": -2310
      },
      "target": {
        "id": "h14-surface",
        "properties": {
          "sourceId": "h14"
        },
        "x": 330,
        "y": -2310
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 2720,
      "width": 2100
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-06-01:entry",
      "x": -820,
      "y": -1000
    },
    "exit": {
      "id": "sector-06-01:exit",
      "x": 570,
      "y": -2440
    },
    "gate": {
      "id": "sector-06-01:gate",
      "nextAreaId": "sector-06-02",
      "requiredObjectiveIds": [
        "exit-reached"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": 522,
        "y": -2520
      }
    },
    "id": "sector-06-01",
    "name": "SKYBREAK ACCESS",
    "nextAreaId": "sector-06-02",
    "objectives": [
      {
        "bounds": {
          "height": 160,
          "width": 96,
          "x": 522,
          "y": -2520
        },
        "id": "exit-reached",
        "type": "reach"
      }
    ],
    "objects": [],
    "order": 1,
    "recoveryPoints": [
      {
        "id": "sector-06-01:recovery-R2",
        "maxRetrySeconds": 5,
        "sourceId": "R2",
        "x": -860,
        "y": -1320
      },
      {
        "id": "sector-06-01:recovery-R3",
        "maxRetrySeconds": 5,
        "sourceId": "R3",
        "x": -890,
        "y": -1600
      },
      {
        "id": "sector-06-01:recovery-R4",
        "maxRetrySeconds": 5,
        "sourceId": "R4",
        "x": -870,
        "y": -1900
      },
      {
        "id": "sector-06-01:recovery-R5",
        "maxRetrySeconds": 5,
        "sourceId": "R5",
        "x": -30,
        "y": -2190
      }
    ],
    "routePoints": [
      {
        "id": "sector-06-01:route-h06",
        "sourceId": "h06",
        "x": -830,
        "y": -980
      },
      {
        "id": "sector-06-01:route-h07",
        "sourceId": "h07",
        "x": -760,
        "y": -1180
      },
      {
        "id": "sector-06-01:route-h08",
        "sourceId": "h08",
        "x": -760,
        "y": -1460
      },
      {
        "id": "sector-06-01:route-h09",
        "sourceId": "h09",
        "x": -650,
        "y": -1720
      },
      {
        "id": "sector-06-01:route-h10",
        "sourceId": "h10",
        "x": -650,
        "y": -2000
      },
      {
        "id": "sector-06-01:route-h11",
        "sourceId": "h11",
        "x": -520,
        "y": -2240
      },
      {
        "id": "sector-06-01:route-h12",
        "sourceId": "h12",
        "x": -240,
        "y": -2330
      },
      {
        "id": "sector-06-01:route-h13",
        "sourceId": "h13",
        "x": 60,
        "y": -2370
      },
      {
        "id": "sector-06-01:route-h14",
        "sourceId": "h14",
        "x": 330,
        "y": -2310
      },
      {
        "id": "sector-06-01:route-h15",
        "sourceId": "h15",
        "x": 570,
        "y": -2440
      },
      {
        "id": "sector-06-01:route-exit",
        "sourceId": "exit",
        "x": 506,
        "y": -2440
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-06",
    "storyTriggers": [],
    "subtitle": "HIGH ROOF HATCH → SKYBREAK DROP → LOWER SKY ISLAND → FREESTANDING MAST → CROWN",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-06-01:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -820,
          "y": -968
        },
        "vertices": [
          {
            "x": -916,
            "y": -968
          },
          {
            "x": -724,
            "y": -968
          },
          {
            "x": -724,
            "y": -936
          },
          {
            "x": -916,
            "y": -936
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "lower-sky-island",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 550,
          "y": -2085
        },
        "vertices": [
          {
            "x": 550,
            "y": -2085
          },
          {
            "x": 980,
            "y": -2085
          },
          {
            "x": 980,
            "y": -2047
          },
          {
            "x": 550,
            "y": -2047
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "crown-island-1",
        "kind": "structural-island",
        "oneWay": true,
        "position": {
          "x": -800,
          "y": -2080
        },
        "vertices": [
          {
            "x": -800,
            "y": -2080
          },
          {
            "x": -570,
            "y": -2080
          },
          {
            "x": -570,
            "y": -2025
          },
          {
            "x": -800,
            "y": -2025
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "crown-exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 390,
          "y": -2490
        },
        "vertices": [
          {
            "x": 390,
            "y": -2490
          },
          {
            "x": 820,
            "y": -2490
          },
          {
            "x": 820,
            "y": -2458
          },
          {
            "x": 390,
            "y": -2458
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "R2",
        "kind": "recovery",
        "maxRetrySeconds": 5,
        "oneWay": true,
        "position": {
          "x": -970,
          "y": -1300
        },
        "vertices": [
          {
            "x": -970,
            "y": -1300
          },
          {
            "x": -650,
            "y": -1300
          },
          {
            "x": -650,
            "y": -1280
          },
          {
            "x": -970,
            "y": -1280
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "R5",
        "kind": "recovery",
        "maxRetrySeconds": 5,
        "oneWay": true,
        "position": {
          "x": -230,
          "y": -1955
        },
        "vertices": [
          {
            "x": -230,
            "y": -1955
          },
          {
            "x": 130,
            "y": -1955
          },
          {
            "x": 130,
            "y": -1937
          },
          {
            "x": -230,
            "y": -1937
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
    "id": "6-1",
    "sector": 6,
    "sourceAreaId": "sector-06-01",
    "stage": 1
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
