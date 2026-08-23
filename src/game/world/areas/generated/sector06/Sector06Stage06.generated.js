// GENERATED FILE - DO NOT EDIT
// Source: 6-6 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "6-6";
export const GENERATED_AREA_ID = "sector-06-06";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-06-06:p0",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P0",
          "sourceId": "sector-06-06:p0"
        },
        "x": -520,
        "y": -80
      },
      "target": {
        "id": "sector-06-06:p0-surface",
        "properties": {
          "sourceId": "sector-06-06:p0"
        },
        "x": -520,
        "y": -80
      }
    },
    {
      "landmark": {
        "id": "sector-06-06:h1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H1",
          "sourceId": "sector-06-06:h1"
        },
        "x": -520,
        "y": -300
      },
      "target": {
        "id": "sector-06-06:h1-surface",
        "properties": {
          "sourceId": "sector-06-06:h1"
        },
        "x": -520,
        "y": -300
      }
    },
    {
      "landmark": {
        "id": "sector-06-06:p1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P1",
          "sourceId": "sector-06-06:p1"
        },
        "x": -520,
        "y": -500
      },
      "target": {
        "id": "sector-06-06:p1-surface",
        "properties": {
          "sourceId": "sector-06-06:p1"
        },
        "x": -520,
        "y": -500
      }
    },
    {
      "landmark": {
        "id": "sector-06-06:h2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H2",
          "sourceId": "sector-06-06:h2"
        },
        "x": -260,
        "y": -630
      },
      "target": {
        "id": "sector-06-06:h2-surface",
        "properties": {
          "sourceId": "sector-06-06:h2"
        },
        "x": -260,
        "y": -630
      }
    },
    {
      "landmark": {
        "id": "sector-06-06:h3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H3",
          "sourceId": "sector-06-06:h3"
        },
        "x": -40,
        "y": -660
      },
      "target": {
        "id": "sector-06-06:h3-surface",
        "properties": {
          "sourceId": "sector-06-06:h3"
        },
        "x": -40,
        "y": -660
      }
    },
    {
      "landmark": {
        "id": "sector-06-06:h4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H4",
          "sourceId": "sector-06-06:h4"
        },
        "x": 180,
        "y": -700
      },
      "target": {
        "id": "sector-06-06:h4-surface",
        "properties": {
          "sourceId": "sector-06-06:h4"
        },
        "x": 180,
        "y": -700
      }
    },
    {
      "landmark": {
        "id": "sector-06-06:h5",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H5",
          "sourceId": "sector-06-06:h5"
        },
        "x": 400,
        "y": -750
      },
      "target": {
        "id": "sector-06-06:h5-surface",
        "properties": {
          "sourceId": "sector-06-06:h5"
        },
        "x": 400,
        "y": -750
      }
    },
    {
      "landmark": {
        "id": "sector-06-06:h6",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H6",
          "sourceId": "sector-06-06:h6"
        },
        "x": 620,
        "y": -880
      },
      "target": {
        "id": "sector-06-06:h6-surface",
        "properties": {
          "sourceId": "sector-06-06:h6"
        },
        "x": 620,
        "y": -880
      }
    },
    {
      "landmark": {
        "id": "sector-06-06:p2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P2",
          "sourceId": "sector-06-06:p2"
        },
        "x": 620,
        "y": -1160
      },
      "target": {
        "id": "sector-06-06:p2-surface",
        "properties": {
          "sourceId": "sector-06-06:p2"
        },
        "x": 620,
        "y": -1160
      }
    },
    {
      "landmark": {
        "id": "sector-06-06:h7",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H7",
          "sourceId": "sector-06-06:h7"
        },
        "x": 640,
        "y": -1420
      },
      "target": {
        "id": "sector-06-06:h7-surface",
        "properties": {
          "sourceId": "sector-06-06:h7"
        },
        "x": 640,
        "y": -1420
      }
    },
    {
      "landmark": {
        "id": "sector-06-06:p3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P3",
          "sourceId": "sector-06-06:p3"
        },
        "x": 660,
        "y": -1680
      },
      "target": {
        "id": "sector-06-06:p3-surface",
        "properties": {
          "sourceId": "sector-06-06:p3"
        },
        "x": 660,
        "y": -1680
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1952,
      "width": 1600
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-06-06:entry",
      "x": -520,
      "y": -80
    },
    "exit": {
      "id": "sector-06-06:exit",
      "x": 660,
      "y": -1680
    },
    "gate": {
      "id": "sector-06-06:gate",
      "nextAreaId": "sector-06-07",
      "requiredObjectiveIds": [
        "exit-reached"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": 612,
        "y": -1760
      }
    },
    "id": "sector-06-06",
    "name": "BEACON SPAN",
    "nextAreaId": "sector-06-07",
    "objectives": [
      {
        "bounds": {
          "height": 160,
          "width": 96,
          "x": 612,
          "y": -1760
        },
        "id": "exit-reached",
        "type": "reach"
      }
    ],
    "objects": [
      {
        "activation": {
          "height": 400,
          "width": 1010,
          "x": -320,
          "y": -950
        },
        "coordinateAnchor": "center",
        "enemyType": "patrol-drone-t1",
        "id": "sector-06-06:D1",
        "kind": "patrol-drone",
        "patrol": {
          "mode": "pingpong",
          "points": [
            {
              "x": 420,
              "y": -600
            },
            {
              "x": -100,
              "y": -870
            }
          ],
          "speed": 48,
          "waitSeconds": 0.45
        },
        "position": {
          "x": 420,
          "y": -600
        },
        "presentationId": "world-object:patrol-drone",
        "rules": [
          "standard-projectile",
          "no-rope-cut",
          "kill-optional"
        ]
      }
    ],
    "order": 6,
    "recoveryPoints": [
      {
        "id": "sector-06-06:recovery-R0",
        "sourceId": "R0",
        "x": -180,
        "y": -480
      },
      {
        "id": "sector-06-06:recovery-R1",
        "sourceId": "R1",
        "x": 360,
        "y": -500
      }
    ],
    "routePoints": [
      {
        "id": "sector-06-06:route-sector-06-06:p0",
        "sourceId": "sector-06-06:p0",
        "x": -520,
        "y": -80
      },
      {
        "id": "sector-06-06:route-sector-06-06:h1",
        "sourceId": "sector-06-06:h1",
        "x": -520,
        "y": -300
      },
      {
        "id": "sector-06-06:route-sector-06-06:p1",
        "sourceId": "sector-06-06:p1",
        "x": -520,
        "y": -500
      },
      {
        "id": "sector-06-06:route-sector-06-06:h2",
        "sourceId": "sector-06-06:h2",
        "x": -260,
        "y": -630
      },
      {
        "id": "sector-06-06:route-sector-06-06:h3",
        "sourceId": "sector-06-06:h3",
        "x": -40,
        "y": -660
      },
      {
        "id": "sector-06-06:route-sector-06-06:h4",
        "sourceId": "sector-06-06:h4",
        "x": 180,
        "y": -700
      },
      {
        "id": "sector-06-06:route-sector-06-06:h5",
        "sourceId": "sector-06-06:h5",
        "x": 400,
        "y": -750
      },
      {
        "id": "sector-06-06:route-sector-06-06:h6",
        "sourceId": "sector-06-06:h6",
        "x": 620,
        "y": -880
      },
      {
        "id": "sector-06-06:route-sector-06-06:p2",
        "sourceId": "sector-06-06:p2",
        "x": 620,
        "y": -1160
      },
      {
        "id": "sector-06-06:route-sector-06-06:h7",
        "sourceId": "sector-06-06:h7",
        "x": 640,
        "y": -1420
      },
      {
        "id": "sector-06-06:route-sector-06-06:p3",
        "sourceId": "sector-06-06:p3",
        "x": 660,
        "y": -1680
      },
      {
        "id": "sector-06-06:route-exit",
        "sourceId": "exit",
        "x": 596,
        "y": -1680
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-06",
    "storyTriggers": [],
    "subtitle": "BEACON NEEDLE / LONG CANTILEVER / PATROL POSITION READ",
    "surfaces": [
      {
        "activation": "OUT",
        "coordinateAnchor": "top-center",
        "grappleable": false,
        "id": "R0",
        "kind": "recovery",
        "landingOnly": true,
        "oneWay": true,
        "position": {
          "x": -180,
          "y": -480
        },
        "retrySecondsTargetMax": 5,
        "sourceId": "R0",
        "vertices": [
          {
            "x": -244,
            "y": -480
          },
          {
            "x": -116,
            "y": -480
          },
          {
            "x": -116,
            "y": -448
          },
          {
            "x": -244,
            "y": -448
          }
        ]
      },
      {
        "activation": "OUT",
        "coordinateAnchor": "top-center",
        "grappleable": false,
        "id": "R1",
        "kind": "recovery",
        "landingOnly": true,
        "oneWay": true,
        "position": {
          "x": 360,
          "y": -500
        },
        "retrySecondsTargetMax": 5,
        "sourceId": "R1",
        "vertices": [
          {
            "x": 296,
            "y": -500
          },
          {
            "x": 424,
            "y": -500
          },
          {
            "x": 424,
            "y": -468
          },
          {
            "x": 296,
            "y": -468
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-06-06:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -520,
          "y": -48
        },
        "vertices": [
          {
            "x": -616,
            "y": -48
          },
          {
            "x": -424,
            "y": -48
          },
          {
            "x": -424,
            "y": -16
          },
          {
            "x": -616,
            "y": -16
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "beacon-entry",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -650,
          "y": -115
        },
        "vertices": [
          {
            "x": -650,
            "y": -115
          },
          {
            "x": -390,
            "y": -115
          },
          {
            "x": -390,
            "y": -85
          },
          {
            "x": -650,
            "y": -85
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "needle-cantilever",
        "kind": "cantilever",
        "oneWay": true,
        "position": {
          "x": -620,
          "y": -330
        },
        "vertices": [
          {
            "x": -620,
            "y": -330
          },
          {
            "x": -420,
            "y": -330
          },
          {
            "x": -420,
            "y": -304
          },
          {
            "x": -620,
            "y": -304
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "patrol-preview",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -660,
          "y": -535
        },
        "vertices": [
          {
            "x": -660,
            "y": -535
          },
          {
            "x": -380,
            "y": -535
          },
          {
            "x": -380,
            "y": -505
          },
          {
            "x": -660,
            "y": -505
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "span-1",
        "kind": "cantilever",
        "oneWay": true,
        "position": {
          "x": -320,
          "y": -660
        },
        "vertices": [
          {
            "x": -320,
            "y": -660
          },
          {
            "x": -140,
            "y": -660
          },
          {
            "x": -140,
            "y": -632
          },
          {
            "x": -320,
            "y": -632
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "span-2",
        "kind": "cantilever",
        "oneWay": true,
        "position": {
          "x": -100,
          "y": -690
        },
        "vertices": [
          {
            "x": -100,
            "y": -690
          },
          {
            "x": 80,
            "y": -690
          },
          {
            "x": 80,
            "y": -662
          },
          {
            "x": -100,
            "y": -662
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "span-3",
        "kind": "cantilever",
        "oneWay": true,
        "position": {
          "x": 120,
          "y": -730
        },
        "vertices": [
          {
            "x": 120,
            "y": -730
          },
          {
            "x": 300,
            "y": -730
          },
          {
            "x": 300,
            "y": -702
          },
          {
            "x": 120,
            "y": -702
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "span-4",
        "kind": "cantilever",
        "oneWay": true,
        "position": {
          "x": 340,
          "y": -780
        },
        "vertices": [
          {
            "x": 340,
            "y": -780
          },
          {
            "x": 520,
            "y": -780
          },
          {
            "x": 520,
            "y": -752
          },
          {
            "x": 340,
            "y": -752
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "span-5",
        "kind": "cantilever",
        "oneWay": true,
        "position": {
          "x": 540,
          "y": -910
        },
        "vertices": [
          {
            "x": 540,
            "y": -910
          },
          {
            "x": 700,
            "y": -910
          },
          {
            "x": 700,
            "y": -882
          },
          {
            "x": 540,
            "y": -882
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "beacon-full-safe",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 490,
          "y": -1195
        },
        "vertices": [
          {
            "x": 490,
            "y": -1195
          },
          {
            "x": 770,
            "y": -1195
          },
          {
            "x": 770,
            "y": -1165
          },
          {
            "x": 490,
            "y": -1165
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "upper-cantilever",
        "kind": "cantilever",
        "oneWay": true,
        "position": {
          "x": 550,
          "y": -1450
        },
        "vertices": [
          {
            "x": 550,
            "y": -1450
          },
          {
            "x": 770,
            "y": -1450
          },
          {
            "x": 770,
            "y": -1424
          },
          {
            "x": 550,
            "y": -1424
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "beacon-exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 520,
          "y": -1710
        },
        "vertices": [
          {
            "x": 520,
            "y": -1710
          },
          {
            "x": 800,
            "y": -1710
          },
          {
            "x": 800,
            "y": -1680
          },
          {
            "x": 520,
            "y": -1680
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
    "id": "6-6",
    "sector": 6,
    "sourceAreaId": "sector-06-06",
    "stage": 6
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
