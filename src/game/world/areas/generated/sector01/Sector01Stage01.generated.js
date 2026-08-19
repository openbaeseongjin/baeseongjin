// GENERATED FILE - DO NOT EDIT
// Source: 1-1 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "1-1";
export const GENERATED_AREA_ID = "sector-01-01";
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-01-01:anchor-a",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -128,
        "y": -192
      },
      "objectIndex": 0,
      "surfaceIndex": 11,
      "target": {
        "id": "sector-01-01:anchor-a-surface",
        "properties": {},
        "x": -128,
        "y": -192
      }
    },
    {
      "landmark": {
        "id": "sector-01-01:anchor-c",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -96,
        "y": -736
      },
      "objectIndex": 1,
      "surfaceIndex": 12,
      "target": {
        "id": "sector-01-01:anchor-c-surface",
        "properties": {},
        "x": -96,
        "y": -736
      }
    }
  ],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1024,
      "width": 1280
    },
    "cameraZones": [
      {
        "desktopZoom": 1.25,
        "id": "intro",
        "maxY": 0,
        "minY": -192,
        "mobileZoom": 0.82,
        "verticalPlayerRatio": 0.46
      },
      {
        "desktopZoom": 1.16,
        "id": "first-hook",
        "maxY": -192,
        "minY": -384,
        "mobileZoom": 0.79
      },
      {
        "desktopZoom": 1.06,
        "id": "cross-back",
        "maxY": -384,
        "minY": -640,
        "mobileZoom": 0.75
      },
      {
        "desktopZoom": 0.96,
        "id": "open-swing",
        "maxY": -640,
        "minY": -896,
        "mobileZoom": 0.7
      },
      {
        "desktopZoom": 1.12,
        "id": "terminal",
        "maxY": -896,
        "minY": -1024,
        "mobileZoom": 0.77
      }
    ],
    "checkpoints": [],
    "cueIds": [
      "service-shaft",
      "sealed-ground-access",
      "cyan-grapple",
      "service-gate-02"
    ],
    "entry": {
      "id": "sector-01-01:entry",
      "x": -416,
      "y": -32
    },
    "exit": {
      "id": "sector-01-01:exit",
      "x": 480,
      "y": -979
    },
    "gate": {
      "id": "sector-01-01:gate",
      "nextAreaId": "sector-01-02",
      "requiredObjectiveIds": [
        "sector-01-01:terminal-read"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 454,
        "y": -1009
      }
    },
    "id": "sector-01-01",
    "name": "SERVICE SHAFT",
    "nextAreaId": "sector-01-02",
    "objectives": [
      {
        "completionDelaySeconds": 2.7,
        "id": "sector-01-01:terminal-read",
        "sourceObjectId": "sector-01-01:exit-panel",
        "storySequenceId": "sector-01-01:terminal-read",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-01-01:fan-inactive"
        ],
        "gameplay": false,
        "id": "sector-01-01:cooling-fan",
        "kind": "background-prop",
        "position": {
          "x": -288,
          "y": -672
        },
        "presentationId": "world-object:background-prop"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-01:gate",
        "id": "sector-01-01:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-01-01:terminal-read",
        "position": {
          "x": 368,
          "y": -947
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-01-01:gate",
        "id": "sector-01-01:exit-gate",
        "kind": "gate",
        "position": {
          "x": 480,
          "y": -947
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 1,
    "recoveryPoints": [
      {
        "id": "sector-01-01:recovery-r1",
        "x": -304,
        "y": -264
      },
      {
        "id": "sector-01-01:recovery-r3",
        "x": -272,
        "y": -792
      }
    ],
    "routePoints": [
      {
        "id": "sector-01-01:route-entry",
        "x": -416,
        "y": -32
      },
      {
        "id": "sector-01-01:route-a",
        "landmark": "A",
        "x": -128,
        "y": -192
      },
      {
        "id": "sector-01-01:route-c",
        "landmark": "C",
        "x": -96,
        "y": -736
      },
      {
        "id": "sector-01-01:route-exit",
        "x": 416,
        "y": -979
      }
    ],
    "routes": [
      "safe",
      "flow",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-01",
    "storyTriggers": [
      "lockdown",
      "terminal-read",
      "gate-open"
    ],
    "subtitle": "VERTICAL GRID CASCADE FAILURE",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-01:p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 0,
          "y": 0
        },
        "presentationId": "terrain:ground-foundation",
        "vertices": [
          {
            "x": -592,
            "y": 0
          },
          {
            "x": 592,
            "y": 0
          },
          {
            "x": 592,
            "y": 32
          },
          {
            "x": -592,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-01:r1",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -304,
          "y": -240
        },
        "vertices": [
          {
            "x": -400,
            "y": -240
          },
          {
            "x": -208,
            "y": -240
          },
          {
            "x": -208,
            "y": -224
          },
          {
            "x": -400,
            "y": -224
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-01:p1",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 224,
          "y": -320
        },
        "vertices": [
          {
            "x": 112,
            "y": -320
          },
          {
            "x": 336,
            "y": -320
          },
          {
            "x": 336,
            "y": -304
          },
          {
            "x": 112,
            "y": -304
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-01:p2",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -144,
          "y": -560
        },
        "vertices": [
          {
            "x": -256,
            "y": -560
          },
          {
            "x": -32,
            "y": -560
          },
          {
            "x": -32,
            "y": -544
          },
          {
            "x": -256,
            "y": -544
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-01:cable-overhang",
        "kind": "overhang",
        "oneWay": false,
        "position": {
          "x": 240,
          "y": -608
        },
        "vertices": [
          {
            "x": 112,
            "y": -608
          },
          {
            "x": 368,
            "y": -608
          },
          {
            "x": 368,
            "y": -576
          },
          {
            "x": 112,
            "y": -576
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-01:r3",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -272,
          "y": -768
        },
        "vertices": [
          {
            "x": -368,
            "y": -768
          },
          {
            "x": -176,
            "y": -768
          },
          {
            "x": -176,
            "y": -752
          },
          {
            "x": -368,
            "y": -752
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-01:p3",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 256,
          "y": -864
        },
        "vertices": [
          {
            "x": 128,
            "y": -864
          },
          {
            "x": 384,
            "y": -864
          },
          {
            "x": 384,
            "y": -840
          },
          {
            "x": 128,
            "y": -840
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-01-01:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 320,
          "y": -947
        },
        "vertices": [
          {
            "x": 128,
            "y": -947
          },
          {
            "x": 512,
            "y": -947
          },
          {
            "x": 512,
            "y": -915
          },
          {
            "x": 128,
            "y": -915
          }
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "grappleable": true,
        "id": "sector-01-01:ground-shutter",
        "kind": "sealed-door",
        "oneWay": false,
        "position": {
          "x": -560,
          "y": 0
        },
        "vertices": [
          {
            "x": -624,
            "y": -128
          },
          {
            "x": -496,
            "y": -128
          },
          {
            "x": -496,
            "y": 0
          },
          {
            "x": -624,
            "y": 0
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": false,
        "id": "sector-01-01:shaft-shell-left",
        "kind": "shaft-shell",
        "oneWay": false,
        "position": {
          "x": -624,
          "y": -1024
        },
        "vertices": [
          {
            "x": -640,
            "y": -1024
          },
          {
            "x": -608,
            "y": -1024
          },
          {
            "x": -608,
            "y": 0
          },
          {
            "x": -640,
            "y": 0
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": false,
        "id": "sector-01-01:shaft-shell-right",
        "kind": "shaft-shell",
        "oneWay": false,
        "position": {
          "x": 624,
          "y": -1024
        },
        "vertices": [
          {
            "x": 608,
            "y": -1024
          },
          {
            "x": 640,
            "y": -1024
          },
          {
            "x": 640,
            "y": 0
          },
          {
            "x": 608,
            "y": 0
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
    "legacyStageAlias": "1-1",
    "sector": 1,
    "sourceAreaId": "sector-01-01",
    "stage": 1
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
