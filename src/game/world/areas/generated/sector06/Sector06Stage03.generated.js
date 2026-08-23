// GENERATED FILE - DO NOT EDIT
// Source: 6-3 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "6-3";
export const GENERATED_AREA_ID = "sector-06-03";
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
        "x": -1100,
        "y": -120
      },
      "target": {
        "id": "h00-surface",
        "properties": {
          "sourceId": "h00"
        },
        "x": -1100,
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
        "x": -850,
        "y": -220
      },
      "target": {
        "id": "h01-surface",
        "properties": {
          "sourceId": "h01"
        },
        "x": -850,
        "y": -220
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
        "x": -600,
        "y": -320
      },
      "target": {
        "id": "h02-surface",
        "properties": {
          "sourceId": "h02"
        },
        "x": -600,
        "y": -320
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
        "x": -420,
        "y": -540
      },
      "target": {
        "id": "h03-surface",
        "properties": {
          "sourceId": "h03"
        },
        "x": -420,
        "y": -540
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
        "x": -120,
        "y": -700
      },
      "target": {
        "id": "h04-surface",
        "properties": {
          "sourceId": "h04"
        },
        "x": -120,
        "y": -700
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
        "x": 180,
        "y": -860
      },
      "target": {
        "id": "h05-surface",
        "properties": {
          "sourceId": "h05"
        },
        "x": 180,
        "y": -860
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
        "x": -20,
        "y": -1060
      },
      "target": {
        "id": "h06-surface",
        "properties": {
          "sourceId": "h06"
        },
        "x": -20,
        "y": -1060
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
        "x": 260,
        "y": -1240
      },
      "target": {
        "id": "h07-surface",
        "properties": {
          "sourceId": "h07"
        },
        "x": 260,
        "y": -1240
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
        "x": 120,
        "y": -1440
      },
      "target": {
        "id": "h08-surface",
        "properties": {
          "sourceId": "h08"
        },
        "x": 120,
        "y": -1440
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
        "x": 120,
        "y": -1640
      },
      "target": {
        "id": "h09-surface",
        "properties": {
          "sourceId": "h09"
        },
        "x": 120,
        "y": -1640
      }
    },
    {
      "landmark": {
        "id": "h10",
        "properties": {
          "coordinateAnchor": "center",
          "label": "h10",
          "sourceId": "h10"
        },
        "x": -120,
        "y": -1810
      },
      "target": {
        "id": "h10-surface",
        "properties": {
          "sourceId": "h10"
        },
        "x": -120,
        "y": -1810
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 2080,
      "width": 2464
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-06-03:entry",
      "x": -1100,
      "y": -120
    },
    "exit": {
      "id": "sector-06-03:exit",
      "x": -120,
      "y": -1810
    },
    "gate": {
      "id": "sector-06-03:gate",
      "nextAreaId": "sector-06-04",
      "requiredObjectiveIds": [
        "exit-reached"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": -168,
        "y": -1890
      }
    },
    "id": "sector-06-03",
    "name": "PERIMETER SIGNAL DECK",
    "nextAreaId": "sector-06-04",
    "objectives": [
      {
        "bounds": {
          "height": 160,
          "width": 96,
          "x": -168,
          "y": -1890
        },
        "id": "exit-reached",
        "type": "reach"
      }
    ],
    "objects": [
      {
        "activation": {
          "height": 860,
          "width": 940,
          "x": -520,
          "y": -1360
        },
        "coordinateAnchor": "center",
        "enemyType": "sentry-t1",
        "id": "sector-06-03:S1",
        "kind": "sentry",
        "position": {
          "x": 40,
          "y": -980
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "kill-optional"
        ]
      }
    ],
    "order": 3,
    "recoveryPoints": [
      {
        "id": "sector-06-03:recovery-R1",
        "maxRetrySeconds": 5,
        "sourceId": "R1",
        "x": -320,
        "y": -420
      },
      {
        "id": "sector-06-03:recovery-R2",
        "maxRetrySeconds": 5,
        "sourceId": "R2",
        "x": 80,
        "y": -820
      },
      {
        "id": "sector-06-03:recovery-R3",
        "maxRetrySeconds": 5,
        "sourceId": "R3",
        "x": 170,
        "y": -1190
      }
    ],
    "routePoints": [
      {
        "id": "sector-06-03:route-h00",
        "sourceId": "h00",
        "x": -1100,
        "y": -120
      },
      {
        "id": "sector-06-03:route-h01",
        "sourceId": "h01",
        "x": -850,
        "y": -220
      },
      {
        "id": "sector-06-03:route-h02",
        "sourceId": "h02",
        "x": -600,
        "y": -320
      },
      {
        "id": "sector-06-03:route-h03",
        "sourceId": "h03",
        "x": -420,
        "y": -540
      },
      {
        "id": "sector-06-03:route-h04",
        "sourceId": "h04",
        "x": -120,
        "y": -700
      },
      {
        "id": "sector-06-03:route-h05",
        "sourceId": "h05",
        "x": 180,
        "y": -860
      },
      {
        "id": "sector-06-03:route-h06",
        "sourceId": "h06",
        "x": -20,
        "y": -1060
      },
      {
        "id": "sector-06-03:route-h07",
        "sourceId": "h07",
        "x": 260,
        "y": -1240
      },
      {
        "id": "sector-06-03:route-h08",
        "sourceId": "h08",
        "x": 120,
        "y": -1440
      },
      {
        "id": "sector-06-03:route-h09",
        "sourceId": "h09",
        "x": 120,
        "y": -1640
      },
      {
        "id": "sector-06-03:route-h10",
        "sourceId": "h10",
        "x": -120,
        "y": -1810
      },
      {
        "id": "sector-06-03:route-exit",
        "sourceId": "exit",
        "x": -184,
        "y": -1810
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-06",
    "storyTriggers": [],
    "subtitle": "CONTINUOUS ASCENT / CENTRAL SIGNAL FRAME / BODY-ARC UNDER FIRE",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-06-03:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1100,
          "y": -88
        },
        "vertices": [
          {
            "x": -1196,
            "y": -88
          },
          {
            "x": -1004,
            "y": -88
          },
          {
            "x": -1004,
            "y": -56
          },
          {
            "x": -1196,
            "y": -56
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "entry-span",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1200,
          "y": -155
        },
        "vertices": [
          {
            "x": -1200,
            "y": -155
          },
          {
            "x": -940,
            "y": -155
          },
          {
            "x": -940,
            "y": -125
          },
          {
            "x": -1200,
            "y": -125
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "safe-sentry-preview",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -720,
          "y": -355
        },
        "vertices": [
          {
            "x": -720,
            "y": -355
          },
          {
            "x": -420,
            "y": -355
          },
          {
            "x": -420,
            "y": -325
          },
          {
            "x": -720,
            "y": -325
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "signal-frame-1",
        "kind": "signal-frame",
        "oneWay": true,
        "position": {
          "x": -500,
          "y": -565
        },
        "vertices": [
          {
            "x": -500,
            "y": -565
          },
          {
            "x": -290,
            "y": -565
          },
          {
            "x": -290,
            "y": -540
          },
          {
            "x": -500,
            "y": -540
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "signal-frame-2",
        "kind": "signal-frame",
        "oneWay": true,
        "position": {
          "x": -210,
          "y": -725
        },
        "vertices": [
          {
            "x": -210,
            "y": -725
          },
          {
            "x": 0,
            "y": -725
          },
          {
            "x": 0,
            "y": -700
          },
          {
            "x": -210,
            "y": -700
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "signal-frame-3",
        "kind": "signal-frame",
        "oneWay": true,
        "position": {
          "x": 80,
          "y": -885
        },
        "vertices": [
          {
            "x": 80,
            "y": -885
          },
          {
            "x": 290,
            "y": -885
          },
          {
            "x": 290,
            "y": -860
          },
          {
            "x": 80,
            "y": -860
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "upper-signal-frame-1",
        "kind": "signal-frame",
        "oneWay": true,
        "position": {
          "x": -110,
          "y": -1085
        },
        "vertices": [
          {
            "x": -110,
            "y": -1085
          },
          {
            "x": 80,
            "y": -1085
          },
          {
            "x": 80,
            "y": -1060
          },
          {
            "x": -110,
            "y": -1060
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "upper-signal-frame-2",
        "kind": "signal-frame",
        "oneWay": true,
        "position": {
          "x": 170,
          "y": -1265
        },
        "vertices": [
          {
            "x": 170,
            "y": -1265
          },
          {
            "x": 360,
            "y": -1265
          },
          {
            "x": 360,
            "y": -1240
          },
          {
            "x": 170,
            "y": -1240
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "upper-safe-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -10,
          "y": -1475
        },
        "vertices": [
          {
            "x": -10,
            "y": -1475
          },
          {
            "x": 290,
            "y": -1475
          },
          {
            "x": 290,
            "y": -1445
          },
          {
            "x": -10,
            "y": -1445
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "signal-exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -250,
          "y": -1840
        },
        "vertices": [
          {
            "x": -250,
            "y": -1840
          },
          {
            "x": 70,
            "y": -1840
          },
          {
            "x": 70,
            "y": -1808
          },
          {
            "x": -250,
            "y": -1808
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
          "x": -430,
          "y": -420
        },
        "vertices": [
          {
            "x": -430,
            "y": -420
          },
          {
            "x": -210,
            "y": -420
          },
          {
            "x": -210,
            "y": -402
          },
          {
            "x": -430,
            "y": -402
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
          "x": -30,
          "y": -820
        },
        "vertices": [
          {
            "x": -30,
            "y": -820
          },
          {
            "x": 190,
            "y": -820
          },
          {
            "x": 190,
            "y": -802
          },
          {
            "x": -30,
            "y": -802
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "R3",
        "kind": "recovery",
        "maxRetrySeconds": 5,
        "oneWay": true,
        "position": {
          "x": 60,
          "y": -1190
        },
        "vertices": [
          {
            "x": 60,
            "y": -1190
          },
          {
            "x": 280,
            "y": -1190
          },
          {
            "x": 280,
            "y": -1172
          },
          {
            "x": 60,
            "y": -1172
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
    "id": "6-3",
    "sector": 6,
    "sourceAreaId": "sector-06-03",
    "stage": 3
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
