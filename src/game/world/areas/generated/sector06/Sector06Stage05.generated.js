// GENERATED FILE - DO NOT EDIT
// Source: 6-5 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "6-5";
export const GENERATED_AREA_ID = "sector-06-05";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-06-05:p0",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P0",
          "sourceId": "sector-06-05:p0"
        },
        "x": 520,
        "y": -80
      },
      "target": {
        "id": "sector-06-05:p0-surface",
        "properties": {
          "sourceId": "sector-06-05:p0"
        },
        "x": 520,
        "y": -80
      }
    },
    {
      "landmark": {
        "id": "sector-06-05:h1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H1",
          "sourceId": "sector-06-05:h1"
        },
        "x": 340,
        "y": -220
      },
      "target": {
        "id": "sector-06-05:h1-surface",
        "properties": {
          "sourceId": "sector-06-05:h1"
        },
        "x": 340,
        "y": -220
      }
    },
    {
      "landmark": {
        "id": "sector-06-05:p1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P1",
          "sourceId": "sector-06-05:p1"
        },
        "x": 420,
        "y": -360
      },
      "target": {
        "id": "sector-06-05:p1-surface",
        "properties": {
          "sourceId": "sector-06-05:p1"
        },
        "x": 420,
        "y": -360
      }
    },
    {
      "landmark": {
        "id": "sector-06-05:c1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C1",
          "sourceId": "sector-06-05:c1"
        },
        "x": 130,
        "y": -500
      },
      "target": {
        "id": "sector-06-05:c1-surface",
        "properties": {
          "sourceId": "sector-06-05:c1"
        },
        "x": 130,
        "y": -500
      }
    },
    {
      "landmark": {
        "id": "sector-06-05:c2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C2",
          "sourceId": "sector-06-05:c2"
        },
        "x": -120,
        "y": -720
      },
      "target": {
        "id": "sector-06-05:c2-surface",
        "properties": {
          "sourceId": "sector-06-05:c2"
        },
        "x": -120,
        "y": -720
      }
    },
    {
      "landmark": {
        "id": "sector-06-05:c3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C3",
          "sourceId": "sector-06-05:c3"
        },
        "x": 140,
        "y": -940
      },
      "target": {
        "id": "sector-06-05:c3-surface",
        "properties": {
          "sourceId": "sector-06-05:c3"
        },
        "x": 140,
        "y": -940
      }
    },
    {
      "landmark": {
        "id": "sector-06-05:p2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P2",
          "sourceId": "sector-06-05:p2"
        },
        "x": -160,
        "y": -1160
      },
      "target": {
        "id": "sector-06-05:p2-surface",
        "properties": {
          "sourceId": "sector-06-05:p2"
        },
        "x": -160,
        "y": -1160
      }
    },
    {
      "landmark": {
        "id": "sector-06-05:h4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "H4",
          "sourceId": "sector-06-05:h4"
        },
        "x": 60,
        "y": -1380
      },
      "target": {
        "id": "sector-06-05:h4-surface",
        "properties": {
          "sourceId": "sector-06-05:h4"
        },
        "x": 60,
        "y": -1380
      }
    },
    {
      "landmark": {
        "id": "sector-06-05:p4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "P4",
          "sourceId": "sector-06-05:p4"
        },
        "x": -100,
        "y": -1560
      },
      "target": {
        "id": "sector-06-05:p4-surface",
        "properties": {
          "sourceId": "sector-06-05:p4"
        },
        "x": -100,
        "y": -1560
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1824,
      "width": 1312
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-06-05:entry",
      "x": 520,
      "y": -80
    },
    "exit": {
      "id": "sector-06-05:exit",
      "x": -100,
      "y": -1560
    },
    "gate": {
      "id": "sector-06-05:gate",
      "nextAreaId": "sector-06-06",
      "requiredObjectiveIds": [
        "exit-reached"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": -148,
        "y": -1640
      }
    },
    "id": "sector-06-05",
    "name": "PAD ACCESS ARRAY",
    "nextAreaId": "sector-06-06",
    "objectives": [
      {
        "bounds": {
          "height": 160,
          "width": 96,
          "x": -148,
          "y": -1640
        },
        "id": "exit-reached",
        "type": "reach"
      }
    ],
    "objects": [],
    "order": 5,
    "recoveryPoints": [
      {
        "id": "sector-06-05:recovery-recovery-r1",
        "sourceId": "recovery-r1",
        "x": -240,
        "y": -590
      }
    ],
    "routePoints": [
      {
        "id": "sector-06-05:route-sector-06-05:p0",
        "sourceId": "sector-06-05:p0",
        "x": 520,
        "y": -80
      },
      {
        "id": "sector-06-05:route-sector-06-05:h1",
        "sourceId": "sector-06-05:h1",
        "x": 340,
        "y": -220
      },
      {
        "id": "sector-06-05:route-sector-06-05:p1",
        "sourceId": "sector-06-05:p1",
        "x": 420,
        "y": -360
      },
      {
        "id": "sector-06-05:route-sector-06-05:c1",
        "sourceId": "sector-06-05:c1",
        "x": 130,
        "y": -500
      },
      {
        "id": "sector-06-05:route-sector-06-05:c2",
        "sourceId": "sector-06-05:c2",
        "x": -120,
        "y": -720
      },
      {
        "id": "sector-06-05:route-sector-06-05:c3",
        "sourceId": "sector-06-05:c3",
        "x": 140,
        "y": -940
      },
      {
        "id": "sector-06-05:route-sector-06-05:p2",
        "sourceId": "sector-06-05:p2",
        "x": -160,
        "y": -1160
      },
      {
        "id": "sector-06-05:route-sector-06-05:h4",
        "sourceId": "sector-06-05:h4",
        "x": 60,
        "y": -1380
      },
      {
        "id": "sector-06-05:route-sector-06-05:p4",
        "sourceId": "sector-06-05:p4",
        "x": -100,
        "y": -1560
      },
      {
        "id": "sector-06-05:route-exit",
        "sourceId": "exit",
        "x": -164,
        "y": -1560
      }
    ],
    "routes": [],
    "scannerGroups": [
      {
        "contract": {
          "currentRopePersistsThroughLocked": true,
          "damage": 0,
          "forcedDetach": false,
          "knockback": 0,
          "newAttachAllowed": [
            "AVAILABLE",
            "WARNING"
          ],
          "newAttachDenied": [
            "LOCKED",
            "RESET"
          ],
          "ropeCut": false
        },
        "controlledSurfaceIds": [
          "sector-06-05:c1-surface",
          "sector-06-05:c2-surface",
          "sector-06-05:c3-surface"
        ],
        "cycle": {
          "available": 1.5,
          "locked": 1.1,
          "reset": 0.3,
          "warning": 0.6
        },
        "id": "sector-06-05:scanner-A",
        "phaseOffsetSeconds": 0
      }
    ],
    "sectorId": "sector-06",
    "storyTriggers": [],
    "subtitle": "STACKED ACCESS TERRACES / THREE CONTROLLED MOUNTS",
    "surfaces": [
      {
        "cannotBypass": [
          "C2",
          "C3"
        ],
        "coordinateAnchor": "top-center",
        "grappleable": false,
        "id": "recovery-r1",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -240,
          "y": -590
        },
        "retrySecondsTargetMax": 5,
        "role": "landing-only",
        "sourceId": "recovery-r1",
        "vertices": [
          {
            "x": -350,
            "y": -590
          },
          {
            "x": -130,
            "y": -590
          },
          {
            "x": -130,
            "y": -572
          },
          {
            "x": -350,
            "y": -572
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-06-05:entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 520,
          "y": -48
        },
        "vertices": [
          {
            "x": 424,
            "y": -48
          },
          {
            "x": 616,
            "y": -48
          },
          {
            "x": 616,
            "y": -16
          },
          {
            "x": 424,
            "y": -16
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "array-entry",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 390,
          "y": -115
        },
        "vertices": [
          {
            "x": 390,
            "y": -115
          },
          {
            "x": 630,
            "y": -115
          },
          {
            "x": 630,
            "y": -85
          },
          {
            "x": 390,
            "y": -85
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": false,
        "id": "preview-terrace",
        "kind": "access-terrace",
        "oneWay": true,
        "position": {
          "x": 270,
          "y": -250
        },
        "vertices": [
          {
            "x": 270,
            "y": -250
          },
          {
            "x": 530,
            "y": -250
          },
          {
            "x": 530,
            "y": -222
          },
          {
            "x": 270,
            "y": -222
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "safe-preview",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 300,
          "y": -390
        },
        "vertices": [
          {
            "x": 300,
            "y": -390
          },
          {
            "x": 560,
            "y": -390
          },
          {
            "x": 560,
            "y": -360
          },
          {
            "x": 300,
            "y": -360
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": false,
        "id": "terrace-c1",
        "kind": "access-terrace",
        "oneWay": true,
        "position": {
          "x": -30,
          "y": -540
        },
        "vertices": [
          {
            "x": -30,
            "y": -540
          },
          {
            "x": 300,
            "y": -540
          },
          {
            "x": 300,
            "y": -510
          },
          {
            "x": -30,
            "y": -510
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": false,
        "id": "terrace-c2",
        "kind": "access-terrace",
        "oneWay": true,
        "position": {
          "x": -320,
          "y": -760
        },
        "vertices": [
          {
            "x": -320,
            "y": -760
          },
          {
            "x": 10,
            "y": -760
          },
          {
            "x": 10,
            "y": -730
          },
          {
            "x": -320,
            "y": -730
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": false,
        "id": "terrace-c3",
        "kind": "access-terrace",
        "oneWay": true,
        "position": {
          "x": 0,
          "y": -980
        },
        "vertices": [
          {
            "x": 0,
            "y": -980
          },
          {
            "x": 330,
            "y": -980
          },
          {
            "x": 330,
            "y": -950
          },
          {
            "x": 0,
            "y": -950
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "array-full-safe",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -300,
          "y": -1190
        },
        "vertices": [
          {
            "x": -300,
            "y": -1190
          },
          {
            "x": 0,
            "y": -1190
          },
          {
            "x": 0,
            "y": -1160
          },
          {
            "x": -300,
            "y": -1160
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": false,
        "id": "upper-terrace",
        "kind": "access-terrace",
        "oneWay": true,
        "position": {
          "x": -40,
          "y": -1410
        },
        "vertices": [
          {
            "x": -40,
            "y": -1410
          },
          {
            "x": 210,
            "y": -1410
          },
          {
            "x": 210,
            "y": -1382
          },
          {
            "x": -40,
            "y": -1382
          }
        ]
      },
      {
        "coordinateAnchor": "top-left",
        "grappleable": true,
        "id": "array-exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -240,
          "y": -1590
        },
        "vertices": [
          {
            "x": -240,
            "y": -1590
          },
          {
            "x": 60,
            "y": -1590
          },
          {
            "x": 60,
            "y": -1560
          },
          {
            "x": -240,
            "y": -1560
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
    "id": "6-5",
    "sector": 6,
    "sourceAreaId": "sector-06-05",
    "stage": 5
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
