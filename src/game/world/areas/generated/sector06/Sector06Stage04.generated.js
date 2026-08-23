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
        "id": "h00",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h00",
          "sourceId": "h00"
        },
        "x": -620,
        "y": -120
      },
      "target": {
        "id": "h00-surface",
        "properties": {
          "sourceId": "h00"
        },
        "x": -620,
        "y": -120
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
        "x": 20,
        "y": -470
      },
      "target": {
        "id": "h03-surface",
        "properties": {
          "sourceId": "h03"
        },
        "x": 20,
        "y": -470
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
        "x": -40,
        "y": -670
      },
      "target": {
        "id": "h04-surface",
        "properties": {
          "sourceId": "h04"
        },
        "x": -40,
        "y": -670
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
        "x": -320,
        "y": -760
      },
      "target": {
        "id": "h05-surface",
        "properties": {
          "sourceId": "h05"
        },
        "x": -320,
        "y": -760
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
        "x": -80,
        "y": -920
      },
      "target": {
        "id": "h06-surface",
        "properties": {
          "sourceId": "h06"
        },
        "x": -80,
        "y": -920
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
      "x": -620,
      "y": -120
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
        "exit-reached"
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
        "bounds": {
          "height": 160,
          "width": 96,
          "x": -128,
          "y": -1000
        },
        "id": "exit-reached",
        "type": "reach"
      }
    ],
    "objects": [],
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
        "id": "sector-06-04:route-h00",
        "sourceId": "h00",
        "x": -620,
        "y": -120
      },
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
          "x": -620,
          "y": -88
        },
        "vertices": [
          {
            "x": -716,
            "y": -88
          },
          {
            "x": -524,
            "y": -88
          },
          {
            "x": -524,
            "y": -56
          },
          {
            "x": -716,
            "y": -56
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "shelter-entry",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -720,
          "y": -150
        },
        "vertices": [
          {
            "x": -720,
            "y": -150
          },
          {
            "x": -470,
            "y": -150
          },
          {
            "x": -470,
            "y": -120
          },
          {
            "x": -720,
            "y": -120
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "shelter-eave",
        "kind": "shelter-eave",
        "oneWay": true,
        "position": {
          "x": -470,
          "y": -215
        },
        "vertices": [
          {
            "x": -470,
            "y": -215
          },
          {
            "x": -260,
            "y": -215
          },
          {
            "x": -260,
            "y": -190
          },
          {
            "x": -470,
            "y": -190
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "quiet-service-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -250,
          "y": -290
        },
        "vertices": [
          {
            "x": -250,
            "y": -290
          },
          {
            "x": 10,
            "y": -290
          },
          {
            "x": 10,
            "y": -260
          },
          {
            "x": -250,
            "y": -260
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "roof-access",
        "kind": "shelter-roof",
        "oneWay": true,
        "position": {
          "x": -25,
          "y": -495
        },
        "vertices": [
          {
            "x": -25,
            "y": -495
          },
          {
            "x": 75,
            "y": -495
          },
          {
            "x": 75,
            "y": -469
          },
          {
            "x": -25,
            "y": -469
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
          "x": -470,
          "y": -790
        },
        "vertices": [
          {
            "x": -470,
            "y": -790
          },
          {
            "x": -170,
            "y": -790
          },
          {
            "x": -170,
            "y": -758
          },
          {
            "x": -470,
            "y": -758
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
        "grappleable": false,
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
