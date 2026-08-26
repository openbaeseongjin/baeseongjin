// GENERATED FILE - DO NOT EDIT
// Source: 6-7 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "6-7";
export const GENERATED_AREA_ID = "sector-06-07";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-06-07:h1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H1",
          "sourceId": "sector-06-07:h1"
        },
        "x": -420,
        "y": -300
      },
      "target": {
        "id": "sector-06-07:h1-surface",
        "properties": {
          "sourceId": "sector-06-07:h1"
        },
        "x": -420,
        "y": -300
      }
    },
    {
      "landmark": {
        "id": "sector-06-07:h2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H2",
          "sourceId": "sector-06-07:h2"
        },
        "x": -180,
        "y": -680
      },
      "target": {
        "id": "sector-06-07:h2-surface",
        "properties": {
          "sourceId": "sector-06-07:h2"
        },
        "x": -180,
        "y": -680
      }
    },
    {
      "landmark": {
        "id": "sector-06-07:h3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H3",
          "sourceId": "sector-06-07:h3"
        },
        "x": 80,
        "y": -820
      },
      "target": {
        "id": "sector-06-07:h3-surface",
        "properties": {
          "sourceId": "sector-06-07:h3"
        },
        "x": 80,
        "y": -820
      }
    },
    {
      "landmark": {
        "id": "sector-06-07:h4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H4",
          "sourceId": "sector-06-07:h4"
        },
        "x": 80,
        "y": -1050
      },
      "target": {
        "id": "sector-06-07:h4-surface",
        "properties": {
          "sourceId": "sector-06-07:h4"
        },
        "x": 80,
        "y": -1050
      }
    },
    {
      "landmark": {
        "id": "sector-06-07:h5",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H5",
          "sourceId": "sector-06-07:h5"
        },
        "x": -160,
        "y": -1210
      },
      "target": {
        "id": "sector-06-07:h5-surface",
        "properties": {
          "sourceId": "sector-06-07:h5"
        },
        "x": -160,
        "y": -1210
      }
    },
    {
      "landmark": {
        "id": "sector-06-07:h6",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H6",
          "sourceId": "sector-06-07:h6"
        },
        "x": -160,
        "y": -1440
      },
      "target": {
        "id": "sector-06-07:h6-surface",
        "properties": {
          "sourceId": "sector-06-07:h6"
        },
        "x": -160,
        "y": -1440
      }
    },
    {
      "landmark": {
        "id": "sector-06-07:h7",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H7",
          "sourceId": "sector-06-07:h7"
        },
        "x": 120,
        "y": -1600
      },
      "target": {
        "id": "sector-06-07:h7-surface",
        "properties": {
          "sourceId": "sector-06-07:h7"
        },
        "x": 120,
        "y": -1600
      }
    },
    {
      "landmark": {
        "id": "sector-06-07:p2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P2",
          "sourceId": "sector-06-07:p2"
        },
        "x": 400,
        "y": -1740
      },
      "target": {
        "id": "sector-06-07:p2-surface",
        "properties": {
          "sourceId": "sector-06-07:p2"
        },
        "x": 400,
        "y": -1740
      }
    },
    {
      "landmark": {
        "id": "sector-06-07:h8",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H8",
          "sourceId": "sector-06-07:h8"
        },
        "x": 325,
        "y": -2000
      },
      "target": {
        "id": "sector-06-07:h8-surface",
        "properties": {
          "sourceId": "sector-06-07:h8"
        },
        "x": 325,
        "y": -2000
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 2400,
      "width": 1500
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-06-07:entry",
      "x": -425,
      "y": -125
    },
    "exit": {
      "id": "sector-06-07:exit",
      "x": 500,
      "y": -2140
    },
    "gate": {
      "id": "sector-06-07:gate",
      "nextAreaId": "sector-06-08",
      "requiredObjectiveIds": [
        "sector-06-07:exit-panel-engaged"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": 452,
        "y": -2220
      }
    },
    "id": "sector-06-07",
    "name": "CONTAINMENT LATTICE",
    "nextAreaId": "sector-06-08",
    "objectives": [
      {
        "id": "sector-06-07:exit-panel-engaged",
        "sourceObjectId": "sector-06-07:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "activation": {
          "height": 1030,
          "width": 600,
          "x": -300,
          "y": -1680
        },
        "coordinateAnchor": "center",
        "enemyType": "sentry-t1",
        "id": "sector-06-07:S1",
        "kind": "sentry",
        "position": {
          "x": 360,
          "y": -1160
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "standard-projectile",
          "cutter-fire",
          "kill-optional"
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
        "id": "sector-06-07:route-guard-01",
        "kind": "sentry",
        "position": {
          "x": -240,
          "y": -1290
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
        "id": "sector-06-07:route-guard-02",
        "kind": "sentry",
        "position": {
          "x": -100,
          "y": -760
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
        "id": "sector-06-07:route-guard-03",
        "kind": "sentry",
        "position": {
          "x": 40,
          "y": -1680
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
            "x": 70,
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
        "id": "sector-06-07:route-guard-04",
        "kind": "sentry",
        "position": {
          "x": -500,
          "y": -580
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
        "gateId": "sector-06-07:gate",
        "id": "sector-06-07:exit-panel",
        "interactionSpec": {
          "anchor": "bottom-center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 144,
            "width": 96
          }
        },
        "kind": "gate-panel",
        "objectiveId": "sector-06-07:exit-panel-engaged",
        "position": {
          "x": 388,
          "y": -2175
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-06-07:gate",
        "id": "sector-06-07:exit-gate",
        "kind": "gate",
        "position": {
          "x": 500,
          "y": -2175
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 7,
    "recoveryPoints": [
      {
        "id": "sector-06-07:recovery-R0",
        "sourceId": "R0",
        "x": -330,
        "y": -600
      },
      {
        "id": "sector-06-07:recovery-R1",
        "sourceId": "R1",
        "x": 330,
        "y": -1000
      },
      {
        "id": "sector-06-07:recovery-R2",
        "sourceId": "R2",
        "x": -330,
        "y": -1420
      }
    ],
    "routePoints": [
      {
        "id": "sector-06-07:route-sector-06-07:p0",
        "sourceId": "sector-06-07:p0",
        "x": -420,
        "y": -80
      },
      {
        "id": "sector-06-07:route-sector-06-07:h1",
        "sourceId": "sector-06-07:h1",
        "x": -420,
        "y": -300
      },
      {
        "id": "sector-06-07:route-sector-06-07:p1",
        "sourceId": "sector-06-07:p1",
        "x": -420,
        "y": -500
      },
      {
        "id": "sector-06-07:route-sector-06-07:h2",
        "sourceId": "sector-06-07:h2",
        "x": -180,
        "y": -680
      },
      {
        "id": "sector-06-07:route-sector-06-07:h3",
        "sourceId": "sector-06-07:h3",
        "x": 80,
        "y": -820
      },
      {
        "id": "sector-06-07:route-sector-06-07:h4",
        "sourceId": "sector-06-07:h4",
        "x": 80,
        "y": -1050
      },
      {
        "id": "sector-06-07:route-sector-06-07:h5",
        "sourceId": "sector-06-07:h5",
        "x": -160,
        "y": -1210
      },
      {
        "id": "sector-06-07:route-sector-06-07:h6",
        "sourceId": "sector-06-07:h6",
        "x": -160,
        "y": -1440
      },
      {
        "id": "sector-06-07:route-sector-06-07:h7",
        "sourceId": "sector-06-07:h7",
        "x": 120,
        "y": -1600
      },
      {
        "id": "sector-06-07:route-sector-06-07:p2",
        "sourceId": "sector-06-07:p2",
        "x": 120,
        "y": -1810
      },
      {
        "id": "sector-06-07:route-sector-06-07:h8",
        "sourceId": "sector-06-07:h8",
        "x": 340,
        "y": -1970
      },
      {
        "id": "sector-06-07:route-sector-06-07:p3",
        "sourceId": "sector-06-07:p3",
        "x": 500,
        "y": -2140
      },
      {
        "id": "sector-06-07:route-exit",
        "sourceId": "exit",
        "x": 436,
        "y": -2140
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-06",
    "storyTriggers": [],
    "subtitle": "RISING LATTICE / CUTTER / OFFSET RECOVERY",
    "surfaces": [
      {
        "activation": "OUT",
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "R1",
        "kind": "recovery",
        "landingOnly": true,
        "oneWay": true,
        "position": {
          "x": 330,
          "y": -1000
        },
        "retrySecondsTargetMax": 5,
        "sourceId": "R1",
        "vertices": [
          {
            "x": 266,
            "y": -1000
          },
          {
            "x": 394,
            "y": -1000
          },
          {
            "x": 394,
            "y": -968
          },
          {
            "x": 266,
            "y": -968
          }
        ]
      },
      {
        "activation": "OUT",
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "R2",
        "kind": "recovery",
        "landingOnly": true,
        "oneWay": true,
        "position": {
          "x": -330,
          "y": -1420
        },
        "retrySecondsTargetMax": 5,
        "sourceId": "R2",
        "vertices": [
          {
            "x": -394,
            "y": -1420
          },
          {
            "x": -266,
            "y": -1420
          },
          {
            "x": -266,
            "y": -1388
          },
          {
            "x": -394,
            "y": -1388
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-06-07:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -425,
          "y": -93
        },
        "vertices": [
          {
            "x": -521,
            "y": -93
          },
          {
            "x": -329,
            "y": -93
          },
          {
            "x": -329,
            "y": -61
          },
          {
            "x": -521,
            "y": -61
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "cutter-preview",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -570,
          "y": -535
        },
        "vertices": [
          {
            "x": -570,
            "y": -535
          },
          {
            "x": -270,
            "y": -535
          },
          {
            "x": -270,
            "y": -505
          },
          {
            "x": -570,
            "y": -505
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "lattice-full-safe",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -20,
          "y": -1845
        },
        "vertices": [
          {
            "x": -20,
            "y": -1845
          },
          {
            "x": 280,
            "y": -1845
          },
          {
            "x": 280,
            "y": -1815
          },
          {
            "x": -20,
            "y": -1815
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "lattice-exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 360,
          "y": -2175
        },
        "vertices": [
          {
            "x": 360,
            "y": -2175
          },
          {
            "x": 660,
            "y": -2175
          },
          {
            "x": 660,
            "y": -2145
          },
          {
            "x": 360,
            "y": -2145
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
    "id": "6-7",
    "sector": 6,
    "sourceAreaId": "sector-06-07",
    "stage": 7
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
