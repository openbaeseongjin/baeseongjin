// GENERATED FILE - DO NOT EDIT
// Source: 6-8 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "6-8";
export const GENERATED_AREA_ID = "sector-06-08";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-06-08:h1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H1",
          "sourceId": "sector-06-08:h1"
        },
        "x": -415,
        "y": -275
      },
      "target": {
        "id": "sector-06-08:h1-surface",
        "properties": {
          "sourceId": "sector-06-08:h1"
        },
        "x": -415,
        "y": -275
      }
    },
    {
      "landmark": {
        "id": "sector-06-08:h2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H2",
          "sourceId": "sector-06-08:h2"
        },
        "x": -275,
        "y": -545
      },
      "target": {
        "id": "sector-06-08:h2-surface",
        "properties": {
          "sourceId": "sector-06-08:h2"
        },
        "x": -275,
        "y": -545
      }
    },
    {
      "landmark": {
        "id": "sector-06-08:h3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H3",
          "sourceId": "sector-06-08:h3"
        },
        "x": -15,
        "y": -640
      },
      "target": {
        "id": "sector-06-08:h3-surface",
        "properties": {
          "sourceId": "sector-06-08:h3"
        },
        "x": -15,
        "y": -640
      }
    },
    {
      "landmark": {
        "id": "sector-06-08:h5",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H5",
          "sourceId": "sector-06-08:h5"
        },
        "x": 755,
        "y": -705
      },
      "target": {
        "id": "sector-06-08:h5-surface",
        "properties": {
          "sourceId": "sector-06-08:h5"
        },
        "x": 755,
        "y": -705
      }
    },
    {
      "landmark": {
        "id": "sector-06-08:h6",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H6",
          "sourceId": "sector-06-08:h6"
        },
        "x": 650,
        "y": -940
      },
      "target": {
        "id": "sector-06-08:h6-surface",
        "properties": {
          "sourceId": "sector-06-08:h6"
        },
        "x": 650,
        "y": -940
      }
    },
    {
      "landmark": {
        "id": "sector-06-08:p1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P1",
          "sourceId": "sector-06-08:p1"
        },
        "x": 975,
        "y": -920
      },
      "target": {
        "id": "sector-06-08:p1-surface",
        "properties": {
          "sourceId": "sector-06-08:p1"
        },
        "x": 975,
        "y": -920
      }
    },
    {
      "landmark": {
        "id": "sector-06-08:h7",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H7",
          "sourceId": "sector-06-08:h7"
        },
        "x": 1080,
        "y": -1130
      },
      "target": {
        "id": "sector-06-08:h7-surface",
        "properties": {
          "sourceId": "sector-06-08:h7"
        },
        "x": 1080,
        "y": -1130
      }
    },
    {
      "landmark": {
        "id": "sector-06-08:h8",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H8",
          "sourceId": "sector-06-08:h8"
        },
        "x": 1260,
        "y": -1280
      },
      "target": {
        "id": "sector-06-08:h8-surface",
        "properties": {
          "sourceId": "sector-06-08:h8"
        },
        "x": 1260,
        "y": -1280
      }
    },
    {
      "landmark": {
        "id": "sector-06-08:p2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P2",
          "sourceId": "sector-06-08:p2"
        },
        "x": 1450,
        "y": -1370
      },
      "target": {
        "id": "sector-06-08:p2-surface",
        "properties": {
          "sourceId": "sector-06-08:p2"
        },
        "x": 1450,
        "y": -1370
      }
    },
    {
      "landmark": {
        "id": "sector-06-08:h9",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H9",
          "sourceId": "sector-06-08:h9"
        },
        "x": 1600,
        "y": -1520
      },
      "target": {
        "id": "sector-06-08:h9-surface",
        "properties": {
          "sourceId": "sector-06-08:h9"
        },
        "x": 1600,
        "y": -1520
      }
    },
    {
      "landmark": {
        "id": "sector-06-08:p3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P3",
          "sourceId": "sector-06-08:p3"
        },
        "x": 1750,
        "y": -1670
      },
      "target": {
        "id": "sector-06-08:p3-surface",
        "properties": {
          "sourceId": "sector-06-08:p3"
        },
        "x": 1750,
        "y": -1670
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1952,
      "width": 3776
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-06-08:entry",
      "x": -730,
      "y": -150
    },
    "exit": {
      "id": "sector-06-08:exit",
      "x": 1750,
      "y": -1670
    },
    "gate": {
      "completionMode": "content-boundary",
      "id": "sector-06-08:gate",
      "nextAreaId": null,
      "requiredObjectiveIds": [
        "sector-06-08:exit-panel-engaged"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": 1702,
        "y": -1766
      }
    },
    "id": "sector-06-08",
    "name": "ROOFTOP PAD 03",
    "nextAreaId": null,
    "objectives": [
      {
        "id": "sector-06-08:exit-panel-engaged",
        "sourceObjectId": "sector-06-08:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-06-08:gate",
        "id": "sector-06-08:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-06-08:exit-panel-engaged",
        "position": {
          "x": 1750,
          "y": -1705
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-06-08:gate",
        "id": "sector-06-08:exit-gate",
        "kind": "gate",
        "position": {
          "x": 1862,
          "y": -1705
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
            "sentry-t1",
            "patrol-drone-t1",
            "pursuit-drone-t1"
          ]
        },
        "id": "sector-06-08:route-guard-01",
        "kind": "sentry",
        "position": {
          "x": 470,
          "y": -860
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
        "id": "sector-06-08:route-guard-02",
        "kind": "sentry",
        "position": {
          "x": 1000,
          "y": -1210
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
        "id": "sector-06-08:route-guard-03",
        "kind": "sentry",
        "position": {
          "x": -510,
          "y": -600
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
        "id": "sector-06-08:route-guard-04",
        "kind": "sentry",
        "position": {
          "x": -40,
          "y": -640
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
        "id": "sector-06-08:route-guard-05",
        "kind": "sentry",
        "position": {
          "x": 1370,
          "y": -1450
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
        ]
      }
    ],
    "order": 8,
    "recoveryPoints": [
      {
        "id": "sector-06-08:recovery-R1",
        "sourceId": "R1",
        "x": -40,
        "y": -350
      },
      {
        "id": "sector-06-08:recovery-R2",
        "sourceId": "R2",
        "x": 500,
        "y": -600
      },
      {
        "id": "sector-06-08:recovery-R3",
        "sourceId": "R3",
        "x": 1350,
        "y": -950
      }
    ],
    "routePoints": [
      {
        "id": "sector-06-08:route-sector-06-08:p0",
        "sourceId": "sector-06-08:p0",
        "x": -760,
        "y": -100
      },
      {
        "id": "sector-06-08:route-sector-06-08:h1",
        "sourceId": "sector-06-08:h1",
        "x": -540,
        "y": -250
      },
      {
        "id": "sector-06-08:route-sector-06-08:h2",
        "sourceId": "sector-06-08:h2",
        "x": -430,
        "y": -520
      },
      {
        "id": "sector-06-08:route-sector-06-08:h3",
        "sourceId": "sector-06-08:h3",
        "x": -120,
        "y": -560
      },
      {
        "id": "sector-06-08:route-sector-06-08:h4",
        "sourceId": "sector-06-08:h4",
        "x": 100,
        "y": -760
      },
      {
        "id": "sector-06-08:route-sector-06-08:h5",
        "sourceId": "sector-06-08:h5",
        "x": 390,
        "y": -780
      },
      {
        "id": "sector-06-08:route-sector-06-08:h6",
        "sourceId": "sector-06-08:h6",
        "x": 650,
        "y": -940
      },
      {
        "id": "sector-06-08:route-sector-06-08:p1",
        "sourceId": "sector-06-08:p1",
        "x": 900,
        "y": -940
      },
      {
        "id": "sector-06-08:route-sector-06-08:h7",
        "sourceId": "sector-06-08:h7",
        "x": 1080,
        "y": -1130
      },
      {
        "id": "sector-06-08:route-sector-06-08:h8",
        "sourceId": "sector-06-08:h8",
        "x": 1260,
        "y": -1280
      },
      {
        "id": "sector-06-08:route-sector-06-08:p2",
        "sourceId": "sector-06-08:p2",
        "x": 1450,
        "y": -1370
      },
      {
        "id": "sector-06-08:route-sector-06-08:h9",
        "sourceId": "sector-06-08:h9",
        "x": 1600,
        "y": -1520
      },
      {
        "id": "sector-06-08:route-sector-06-08:p3",
        "sourceId": "sector-06-08:p3",
        "x": 1750,
        "y": -1670
      },
      {
        "id": "sector-06-08:route-exit",
        "sourceId": "exit",
        "x": 1686,
        "y": -1670
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-06",
    "storyTriggers": [],
    "subtitle": "FINAL CROWN WEAVE / ARRIVAL / ACCESS DENIAL",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "disconnected": true,
        "grappleable": true,
        "id": "R1",
        "kind": "recovery",
        "landingOnly": true,
        "oneWay": true,
        "position": {
          "x": 5,
          "y": -350
        },
        "retrySecondsTargetMax": 5,
        "sourceId": "R1",
        "vertices": [
          {
            "x": -59,
            "y": -350
          },
          {
            "x": 69,
            "y": -350
          },
          {
            "x": 69,
            "y": -318
          },
          {
            "x": -59,
            "y": -318
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "disconnected": true,
        "grappleable": true,
        "id": "R2",
        "kind": "recovery",
        "landingOnly": true,
        "oneWay": true,
        "position": {
          "x": 605,
          "y": -485
        },
        "retrySecondsTargetMax": 5,
        "sourceId": "R2",
        "vertices": [
          {
            "x": 541,
            "y": -485
          },
          {
            "x": 669,
            "y": -485
          },
          {
            "x": 669,
            "y": -453
          },
          {
            "x": 541,
            "y": -453
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-06-08:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -730,
          "y": -118
        },
        "vertices": [
          {
            "x": -826,
            "y": -118
          },
          {
            "x": -634,
            "y": -118
          },
          {
            "x": -634,
            "y": -86
          },
          {
            "x": -826,
            "y": -86
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "lighting-bridge",
        "kind": "bridge",
        "oneWay": true,
        "position": {
          "x": 60,
          "y": -805
        },
        "vertices": [
          {
            "x": 60,
            "y": -805
          },
          {
            "x": 450,
            "y": -805
          },
          {
            "x": 450,
            "y": -771
          },
          {
            "x": 60,
            "y": -771
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "pad-perimeter",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1385,
          "y": -1035
        },
        "vertices": [
          {
            "x": 1385,
            "y": -1035
          },
          {
            "x": 1645,
            "y": -1035
          },
          {
            "x": 1645,
            "y": -1003
          },
          {
            "x": 1385,
            "y": -1003
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "access-spur",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 1640,
          "y": -1705
        },
        "vertices": [
          {
            "x": 1640,
            "y": -1705
          },
          {
            "x": 1880,
            "y": -1705
          },
          {
            "x": 1880,
            "y": -1673
          },
          {
            "x": 1640,
            "y": -1673
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
    "id": "6-8",
    "sector": 6,
    "sourceAreaId": "sector-06-08",
    "stage": 8
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
