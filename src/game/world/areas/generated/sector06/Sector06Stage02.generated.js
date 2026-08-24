// GENERATED FILE - DO NOT EDIT
// Source: 6-2 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "6-2";
export const GENERATED_AREA_ID = "sector-06-02";
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
        "x": 1250,
        "y": -300
      },
      "target": {
        "id": "h00-surface",
        "properties": {
          "sourceId": "h00"
        },
        "x": 1250,
        "y": -300
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
        "x": 760,
        "y": -500
      },
      "target": {
        "id": "h02-surface",
        "properties": {
          "sourceId": "h02"
        },
        "x": 760,
        "y": -500
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
        "x": 150,
        "y": -560
      },
      "target": {
        "id": "h04-surface",
        "properties": {
          "sourceId": "h04"
        },
        "x": 150,
        "y": -560
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
        "x": -350,
        "y": -290
      },
      "target": {
        "id": "h06-surface",
        "properties": {
          "sourceId": "h06"
        },
        "x": -350,
        "y": -290
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
        "x": -70,
        "y": -510
      },
      "target": {
        "id": "h08-surface",
        "properties": {
          "sourceId": "h08"
        },
        "x": -70,
        "y": -510
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
        "x": -510,
        "y": -495
      },
      "target": {
        "id": "h09-surface",
        "properties": {
          "sourceId": "h09"
        },
        "x": -510,
        "y": -495
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
        "x": -1030,
        "y": -520
      },
      "target": {
        "id": "h11-surface",
        "properties": {
          "sourceId": "h11"
        },
        "x": -1030,
        "y": -520
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 940,
      "width": 2800
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-06-02:entry",
      "x": 1250,
      "y": -285
    },
    "exit": {
      "id": "sector-06-02:exit",
      "x": -1260,
      "y": -620
    },
    "gate": {
      "id": "sector-06-02:gate",
      "nextAreaId": "sector-06-03",
      "requiredObjectiveIds": [
        "exit-reached"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": -1308,
        "y": -700
      }
    },
    "id": "sector-06-02",
    "name": "CROSSWIND MASTS",
    "nextAreaId": "sector-06-03",
    "objectives": [
      {
        "bounds": {
          "height": 160,
          "width": 96,
          "x": -1308,
          "y": -700
        },
        "id": "exit-reached",
        "type": "reach"
      }
    ],
    "objects": [],
    "order": 2,
    "recoveryPoints": [],
    "routePoints": [
      {
        "id": "sector-06-02:route-h00",
        "sourceId": "h00",
        "x": 1250,
        "y": -300
      },
      {
        "id": "sector-06-02:route-h01",
        "sourceId": "h01",
        "x": 1050,
        "y": -420
      },
      {
        "id": "sector-06-02:route-h02",
        "sourceId": "h02",
        "x": 760,
        "y": -500
      },
      {
        "id": "sector-06-02:route-h03",
        "sourceId": "h03",
        "x": 470,
        "y": -430
      },
      {
        "id": "sector-06-02:route-h04",
        "sourceId": "h04",
        "x": 150,
        "y": -560
      },
      {
        "id": "sector-06-02:route-h05",
        "sourceId": "h05",
        "x": -160,
        "y": -500
      },
      {
        "id": "sector-06-02:route-h06",
        "sourceId": "h06",
        "x": -350,
        "y": -290
      },
      {
        "id": "sector-06-02:route-h07",
        "sourceId": "h07",
        "x": -180,
        "y": -410
      },
      {
        "id": "sector-06-02:route-h08",
        "sourceId": "h08",
        "x": -70,
        "y": -510
      },
      {
        "id": "sector-06-02:route-h09",
        "sourceId": "h09",
        "x": -390,
        "y": -470
      },
      {
        "id": "sector-06-02:route-h10",
        "sourceId": "h10",
        "x": -700,
        "y": -600
      },
      {
        "id": "sector-06-02:route-h11",
        "sourceId": "h11",
        "x": -1030,
        "y": -520
      },
      {
        "id": "sector-06-02:route-h12",
        "sourceId": "h12",
        "x": -1260,
        "y": -620
      },
      {
        "id": "sector-06-02:route-exit",
        "sourceId": "exit",
        "x": -1324,
        "y": -620
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-06",
    "storyTriggers": [],
    "subtitle": "HORIZONTAL CROSSWIND GANTRY / VARIED-HEIGHT MAST RHYTHM",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-06-02:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1250,
          "y": -253
        },
        "vertices": [
          {
            "x": 1154,
            "y": -253
          },
          {
            "x": 1346,
            "y": -253
          },
          {
            "x": 1346,
            "y": -221
          },
          {
            "x": 1154,
            "y": -221
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "entry-safe",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1120,
          "y": -330
        },
        "vertices": [
          {
            "x": 1120,
            "y": -330
          },
          {
            "x": 1400,
            "y": -330
          },
          {
            "x": 1400,
            "y": -302
          },
          {
            "x": 1120,
            "y": -302
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "wind-preview",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 930,
          "y": -450
        },
        "vertices": [
          {
            "x": 930,
            "y": -450
          },
          {
            "x": 1210,
            "y": -450
          },
          {
            "x": 1210,
            "y": -422
          },
          {
            "x": 930,
            "y": -422
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "mast-b-gantry",
        "kind": "mast-platform",
        "oneWay": true,
        "position": {
          "x": 370,
          "y": -455
        },
        "vertices": [
          {
            "x": 370,
            "y": -455
          },
          {
            "x": 590,
            "y": -455
          },
          {
            "x": 590,
            "y": -429
          },
          {
            "x": 370,
            "y": -429
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "lee-pocket",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -500,
          "y": -315
        },
        "vertices": [
          {
            "x": -500,
            "y": -315
          },
          {
            "x": -190,
            "y": -315
          },
          {
            "x": -190,
            "y": -285
          },
          {
            "x": -500,
            "y": -285
          }
        ],
        "windSheltered": true
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "hook-back-low",
        "kind": "gantry",
        "oneWay": true,
        "position": {
          "x": -245,
          "y": -440
        },
        "vertices": [
          {
            "x": -245,
            "y": -440
          },
          {
            "x": -95,
            "y": -440
          },
          {
            "x": -95,
            "y": -418
          },
          {
            "x": -245,
            "y": -418
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "final-b-gantry",
        "kind": "mast-platform",
        "oneWay": true,
        "position": {
          "x": -810,
          "y": -625
        },
        "vertices": [
          {
            "x": -810,
            "y": -625
          },
          {
            "x": -590,
            "y": -625
          },
          {
            "x": -590,
            "y": -601
          },
          {
            "x": -810,
            "y": -601
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "crosswind-exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1380,
          "y": -650
        },
        "vertices": [
          {
            "x": -1380,
            "y": -650
          },
          {
            "x": -1140,
            "y": -650
          },
          {
            "x": -1140,
            "y": -620
          },
          {
            "x": -1380,
            "y": -620
          }
        ]
      }
    ],
    "windZones": [
      {
        "bounds": {
          "height": 450,
          "width": 2040,
          "x": -1120,
          "y": -900
        },
        "direction": {
          "x": -1,
          "y": 0
        },
        "falloff": 80,
        "id": "sector-06-02:scenario-wind-1",
        "mode": "continuous",
        "sourceId": "wind",
        "strength": 500
      }
    ]
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
    "id": "6-2",
    "sector": 6,
    "sourceAreaId": "sector-06-02",
    "stage": 2
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
