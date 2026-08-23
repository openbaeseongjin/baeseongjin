// GENERATED FILE - DO NOT EDIT
// Source: 5-5 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "5-5";
export const GENERATED_AREA_ID = "sector-05-05";
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
        "x": 0,
        "y": -100
      },
      "target": {
        "id": "entry-surface",
        "properties": {
          "sourceId": "entry"
        },
        "x": 0,
        "y": -100
      }
    },
    {
      "landmark": {
        "id": "hub",
        "properties": {
          "coordinateAnchor": "center",
          "label": "hub",
          "sourceId": "hub"
        },
        "x": 0,
        "y": -380
      },
      "target": {
        "id": "hub-surface",
        "properties": {
          "sourceId": "hub"
        },
        "x": 0,
        "y": -380
      }
    },
    {
      "landmark": {
        "id": "c1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "c1",
          "sourceId": "c1"
        },
        "x": -300,
        "y": -500
      },
      "target": {
        "id": "c1-surface",
        "properties": {
          "sourceId": "c1"
        },
        "x": -300,
        "y": -500
      }
    },
    {
      "landmark": {
        "id": "c2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "c2",
          "sourceId": "c2"
        },
        "x": -620,
        "y": -500
      },
      "target": {
        "id": "c2-surface",
        "properties": {
          "sourceId": "c2"
        },
        "x": -620,
        "y": -500
      }
    },
    {
      "landmark": {
        "id": "c3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "c3",
          "sourceId": "c3"
        },
        "x": -900,
        "y": -650
      },
      "target": {
        "id": "c3-surface",
        "properties": {
          "sourceId": "c3"
        },
        "x": -900,
        "y": -650
      }
    },
    {
      "landmark": {
        "id": "c4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "c4",
          "sourceId": "c4"
        },
        "x": -1020,
        "y": -900
      },
      "target": {
        "id": "c4-surface",
        "properties": {
          "sourceId": "c4"
        },
        "x": -1020,
        "y": -900
      }
    },
    {
      "landmark": {
        "id": "p1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "p1",
          "sourceId": "p1"
        },
        "x": -900,
        "y": -1150
      },
      "target": {
        "id": "p1-surface",
        "properties": {
          "sourceId": "p1"
        },
        "x": -900,
        "y": -1150
      }
    },
    {
      "landmark": {
        "id": "upper-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "upper-1",
          "sourceId": "upper-1"
        },
        "x": -650,
        "y": -1300
      },
      "target": {
        "id": "upper-1-surface",
        "properties": {
          "sourceId": "upper-1"
        },
        "x": -650,
        "y": -1300
      }
    },
    {
      "landmark": {
        "id": "upper-2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "upper-2",
          "sourceId": "upper-2"
        },
        "x": -400,
        "y": -1500
      },
      "target": {
        "id": "upper-2-surface",
        "properties": {
          "sourceId": "upper-2"
        },
        "x": -400,
        "y": -1500
      }
    },
    {
      "landmark": {
        "id": "lower-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "lower-1",
          "sourceId": "lower-1"
        },
        "x": -760,
        "y": -1450
      },
      "target": {
        "id": "lower-1-surface",
        "properties": {
          "sourceId": "lower-1"
        },
        "x": -760,
        "y": -1450
      }
    },
    {
      "landmark": {
        "id": "lower-2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "lower-2",
          "sourceId": "lower-2"
        },
        "x": -500,
        "y": -1600
      },
      "target": {
        "id": "lower-2-surface",
        "properties": {
          "sourceId": "lower-2"
        },
        "x": -500,
        "y": -1600
      }
    },
    {
      "landmark": {
        "id": "directive",
        "properties": {
          "coordinateAnchor": "center",
          "label": "directive",
          "sourceId": "directive"
        },
        "x": -150,
        "y": -1650
      },
      "target": {
        "id": "directive-surface",
        "properties": {
          "sourceId": "directive"
        },
        "x": -150,
        "y": -1650
      }
    },
    {
      "landmark": {
        "id": "bridge-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "bridge-1",
          "sourceId": "bridge-1"
        },
        "x": 160,
        "y": -1650
      },
      "target": {
        "id": "bridge-1-surface",
        "properties": {
          "sourceId": "bridge-1"
        },
        "x": 160,
        "y": -1650
      }
    },
    {
      "landmark": {
        "id": "bridge-2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "bridge-2",
          "sourceId": "bridge-2"
        },
        "x": 420,
        "y": -1550
      },
      "target": {
        "id": "bridge-2-surface",
        "properties": {
          "sourceId": "bridge-2"
        },
        "x": 420,
        "y": -1550
      }
    },
    {
      "landmark": {
        "id": "ascent-entry",
        "properties": {
          "coordinateAnchor": "center",
          "label": "ascent-entry",
          "sourceId": "ascent-entry"
        },
        "x": 650,
        "y": -1450
      },
      "target": {
        "id": "ascent-entry-surface",
        "properties": {
          "sourceId": "ascent-entry"
        },
        "x": 650,
        "y": -1450
      }
    },
    {
      "landmark": {
        "id": "ascent-1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "ascent-1",
          "sourceId": "ascent-1"
        },
        "x": 650,
        "y": -1750
      },
      "target": {
        "id": "ascent-1-surface",
        "properties": {
          "sourceId": "ascent-1"
        },
        "x": 650,
        "y": -1750
      }
    },
    {
      "landmark": {
        "id": "ascent-2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "ascent-2",
          "sourceId": "ascent-2"
        },
        "x": 500,
        "y": -1950
      },
      "target": {
        "id": "ascent-2-surface",
        "properties": {
          "sourceId": "ascent-2"
        },
        "x": 500,
        "y": -1950
      }
    },
    {
      "landmark": {
        "id": "ascent-3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "ascent-3",
          "sourceId": "ascent-3"
        },
        "x": 650,
        "y": -2200
      },
      "target": {
        "id": "ascent-3-surface",
        "properties": {
          "sourceId": "ascent-3"
        },
        "x": 650,
        "y": -2200
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
        "x": 400,
        "y": -2400
      },
      "target": {
        "id": "exit-surface",
        "properties": {
          "sourceId": "exit"
        },
        "x": 400,
        "y": -2400
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 2688,
      "width": 2600
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-05-05:entry",
      "x": 0,
      "y": -100
    },
    "exit": {
      "id": "sector-05-05:exit",
      "x": 400,
      "y": -2400
    },
    "gate": {
      "id": "sector-05-05:gate",
      "nextAreaId": "sector-05-06",
      "requiredObjectiveIds": [
        "exit-panel-engaged"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": 352,
        "y": -2558
      }
    },
    "id": "sector-05-05",
    "jammerGroups": [
      {
        "eligibleSurfaceIds": [
          "upper-1-surface",
          "lower-1-surface"
        ],
        "id": "sector-05-05:jammer-a:field",
        "sourceObjectId": "sector-05-05:jammer-a"
      }
    ],
    "name": "PRIORITY ROUTING HALL",
    "nextAreaId": "sector-05-06",
    "objectives": [
      {
        "bounds": {
          "height": 180,
          "width": 420,
          "x": -530,
          "y": -1870
        },
        "id": "priority-directive",
        "sourceObjectId": "sector-05-05:priority-proof-02-of-03:terminal",
        "type": "interact"
      },
      {
        "bounds": {
          "height": 180,
          "width": 420,
          "x": 50,
          "y": -2610
        },
        "id": "final-deck-reached",
        "requiredObjectiveIds": [
          "priority-directive"
        ],
        "type": "reach"
      },
      {
        "id": "exit-panel-engaged",
        "requiredObjectiveIds": [
          "final-deck-reached"
        ],
        "sourceObjectId": "sector-05-05:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "activation": {
          "height": 680,
          "width": 950,
          "x": -980,
          "y": -1730
        },
        "coordinateAnchor": "center",
        "enemyType": "hardpoint-jammer-v1",
        "id": "sector-05-05:jammer-a",
        "jammer": {
          "groupId": "sector-05-05:jammer-a:field"
        },
        "kind": "sentry",
        "position": {
          "x": -945,
          "y": -1435
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "no-projectile-attack"
        ]
      },
      {
        "activation": {
          "height": 620,
          "width": 900,
          "x": -820,
          "y": -1760
        },
        "coordinateAnchor": "center",
        "enemyType": "shield-drone-t1",
        "id": "sector-05-05:aegis-a",
        "kind": "sentry",
        "position": {
          "x": -365,
          "y": -1460
        },
        "presentationId": "world-object:sentry",
        "rules": []
      },
      {
        "coordinateAnchor": "bottom-center",
        "id": "sector-05-05:priority-proof-02-of-03:terminal",
        "interactionRadius": 84,
        "kind": "story-display",
        "label": "PRIORITY ROUTING DIRECTIVE · 02 / 03",
        "objectiveId": "priority-directive",
        "position": {
          "x": -320,
          "y": -1690
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-05-05:gate",
        "id": "sector-05-05:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "exit-panel-engaged",
        "position": {
          "x": 288,
          "y": -2430
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-05-05:gate",
        "id": "sector-05-05:exit-gate",
        "kind": "gate",
        "position": {
          "x": 400,
          "y": -2430
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 5,
    "recoveryPoints": [
      {
        "id": "sector-05-05:recovery-1",
        "maxRetrySeconds": 5,
        "x": -900,
        "y": -1180
      },
      {
        "id": "sector-05-05:recovery-2",
        "maxRetrySeconds": 5,
        "x": 420,
        "y": -1760
      }
    ],
    "routePoints": [
      {
        "id": "sector-05-05:route-entry",
        "sourceId": "entry",
        "x": 0,
        "y": -100
      },
      {
        "id": "sector-05-05:route-hub",
        "sourceId": "hub",
        "x": 0,
        "y": -380
      },
      {
        "id": "sector-05-05:route-c1",
        "sourceId": "c1",
        "x": -300,
        "y": -500
      },
      {
        "id": "sector-05-05:route-c2",
        "sourceId": "c2",
        "x": -620,
        "y": -500
      },
      {
        "id": "sector-05-05:route-c3",
        "sourceId": "c3",
        "x": -900,
        "y": -650
      },
      {
        "id": "sector-05-05:route-c4",
        "sourceId": "c4",
        "x": -1020,
        "y": -900
      },
      {
        "id": "sector-05-05:route-p1",
        "sourceId": "p1",
        "x": -900,
        "y": -1150
      },
      {
        "id": "sector-05-05:route-upper-1",
        "sourceId": "upper-1",
        "x": -650,
        "y": -1300
      },
      {
        "id": "sector-05-05:route-upper-2",
        "sourceId": "upper-2",
        "x": -400,
        "y": -1500
      },
      {
        "id": "sector-05-05:route-directive",
        "sourceId": "directive",
        "x": -150,
        "y": -1650
      },
      {
        "id": "sector-05-05:route-lower-1",
        "sourceId": "lower-1",
        "x": -760,
        "y": -1450
      },
      {
        "id": "sector-05-05:route-lower-2",
        "sourceId": "lower-2",
        "x": -500,
        "y": -1600
      },
      {
        "id": "sector-05-05:route-bridge-1",
        "sourceId": "bridge-1",
        "x": 160,
        "y": -1650
      },
      {
        "id": "sector-05-05:route-bridge-2",
        "sourceId": "bridge-2",
        "x": 420,
        "y": -1550
      },
      {
        "id": "sector-05-05:route-ascent-entry",
        "sourceId": "ascent-entry",
        "x": 650,
        "y": -1450
      },
      {
        "id": "sector-05-05:route-ascent-1",
        "sourceId": "ascent-1",
        "x": 650,
        "y": -1750
      },
      {
        "id": "sector-05-05:route-ascent-2",
        "sourceId": "ascent-2",
        "x": 500,
        "y": -1950
      },
      {
        "id": "sector-05-05:route-ascent-3",
        "sourceId": "ascent-3",
        "x": 650,
        "y": -2200
      },
      {
        "id": "sector-05-05:route-exit",
        "sourceId": "exit",
        "x": 400,
        "y": -2400
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-05",
    "storyTriggers": [],
    "subtitle": "VISIBLE LOCKED ASCENT / LEFT CONTROL BYPASS / PRIORITY DIRECTIVE 02 OF 03",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "authored-entry-deck",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": -180,
          "y": -120
        },
        "sourceId": "entry-deck",
        "vertices": [
          {
            "x": -360,
            "y": -120
          },
          {
            "x": 0,
            "y": -120
          },
          {
            "x": 0,
            "y": -92
          },
          {
            "x": -360,
            "y": -92
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "hub-deck",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": -220,
          "y": -420
        },
        "sourceId": "hub-deck",
        "vertices": [
          {
            "x": -440,
            "y": -420
          },
          {
            "x": 0,
            "y": -420
          },
          {
            "x": 0,
            "y": -388
          },
          {
            "x": -440,
            "y": -388
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": false,
        "id": "authorized-ascent-front-lock",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": 360,
          "y": -720
        },
        "sourceId": "authorized-ascent-front-lock",
        "vertices": [
          {
            "x": 110,
            "y": -720
          },
          {
            "x": 610,
            "y": -720
          },
          {
            "x": 610,
            "y": -390
          },
          {
            "x": 110,
            "y": -390
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": false,
        "id": "priority-routing-matrix",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": -1020,
          "y": -1180
        },
        "sourceId": "priority-routing-matrix",
        "vertices": [
          {
            "x": -1270,
            "y": -1180
          },
          {
            "x": -770,
            "y": -1180
          },
          {
            "x": -770,
            "y": -640
          },
          {
            "x": -1270,
            "y": -640
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "directive-deck",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": -320,
          "y": -1690
        },
        "sourceId": "directive-deck",
        "vertices": [
          {
            "x": -500,
            "y": -1690
          },
          {
            "x": -140,
            "y": -1690
          },
          {
            "x": -140,
            "y": -1662
          },
          {
            "x": -500,
            "y": -1662
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "backside-service-bridge",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": -80,
          "y": -1735
        },
        "sourceId": "backside-service-bridge",
        "vertices": [
          {
            "x": -475,
            "y": -1735
          },
          {
            "x": 315,
            "y": -1735
          },
          {
            "x": 315,
            "y": -1575
          },
          {
            "x": -475,
            "y": -1575
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "ascent-shelf-0",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": 560,
          "y": -1490
        },
        "sourceId": "ascent-shelf-0",
        "vertices": [
          {
            "x": 430,
            "y": -1490
          },
          {
            "x": 690,
            "y": -1490
          },
          {
            "x": 690,
            "y": -1466
          },
          {
            "x": 430,
            "y": -1466
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "ascent-shelf-1",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": 540,
          "y": -1800
        },
        "sourceId": "ascent-shelf-1",
        "vertices": [
          {
            "x": 400,
            "y": -1800
          },
          {
            "x": 680,
            "y": -1800
          },
          {
            "x": 680,
            "y": -1776
          },
          {
            "x": 400,
            "y": -1776
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "ascent-shelf-2",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": 410,
          "y": -2020
        },
        "sourceId": "ascent-shelf-2",
        "vertices": [
          {
            "x": 280,
            "y": -2020
          },
          {
            "x": 540,
            "y": -2020
          },
          {
            "x": 540,
            "y": -1996
          },
          {
            "x": 280,
            "y": -1996
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "ascent-shelf-3",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": 540,
          "y": -2260
        },
        "sourceId": "ascent-shelf-3",
        "vertices": [
          {
            "x": 400,
            "y": -2260
          },
          {
            "x": 680,
            "y": -2260
          },
          {
            "x": 680,
            "y": -2236
          },
          {
            "x": 400,
            "y": -2236
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "exit-deck",
        "kind": "scenario-surface",
        "oneWay": true,
        "position": {
          "x": 260,
          "y": -2430
        },
        "sourceId": "exit-deck",
        "vertices": [
          {
            "x": 100,
            "y": -2430
          },
          {
            "x": 420,
            "y": -2430
          },
          {
            "x": 420,
            "y": -2402
          },
          {
            "x": 100,
            "y": -2402
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-05-05:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 0,
          "y": -68
        },
        "vertices": [
          {
            "x": -96,
            "y": -68
          },
          {
            "x": 96,
            "y": -68
          },
          {
            "x": 96,
            "y": -36
          },
          {
            "x": -96,
            "y": -36
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
    "id": "5-5",
    "sector": 5,
    "sourceAreaId": "sector-05-05",
    "stage": 5
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
