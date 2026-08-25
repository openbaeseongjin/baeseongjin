// GENERATED FILE - DO NOT EDIT
// Source: 3-8 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "3-8";
export const GENERATED_AREA_ID = "sector-03-08";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-03-08:g0",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G0",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g0"
        },
        "x": -1555,
        "y": -250
      },
      "target": {
        "id": "sector-03-08:g0-surface",
        "properties": {
          "sourceId": "g0"
        },
        "x": -1555,
        "y": -250
      }
    },
    {
      "landmark": {
        "id": "sector-03-08:c1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "c1"
        },
        "x": -1165,
        "y": -415
      },
      "target": {
        "id": "sector-03-08:c1-surface",
        "properties": {
          "scannerControlled": true,
          "sourceId": "c1"
        },
        "x": -1165,
        "y": -415
      }
    },
    {
      "landmark": {
        "id": "sector-03-08:c2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C2",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "c2"
        },
        "x": -400,
        "y": -800
      },
      "target": {
        "id": "sector-03-08:c2-surface",
        "properties": {
          "scannerControlled": true,
          "sourceId": "c2"
        },
        "x": -400,
        "y": -800
      }
    },
    {
      "landmark": {
        "id": "sector-03-08:central-lower",
        "properties": {
          "coordinateAnchor": "center",
          "label": "CENTRAL-LOWER",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "central-lower"
        },
        "x": -65,
        "y": -905
      },
      "target": {
        "id": "sector-03-08:central-lower-surface",
        "properties": {
          "sourceId": "central-lower"
        },
        "x": -65,
        "y": -905
      }
    },
    {
      "landmark": {
        "id": "sector-03-08:c3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C3",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "c3"
        },
        "x": 128,
        "y": -1304
      },
      "target": {
        "id": "sector-03-08:c3-surface",
        "properties": {
          "scannerControlled": true,
          "sourceId": "c3"
        },
        "x": 128,
        "y": -1304
      }
    },
    {
      "landmark": {
        "id": "sector-03-08:west-m1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "WEST-M1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "west-m1"
        },
        "x": -375,
        "y": -1230
      },
      "target": {
        "id": "sector-03-08:west-m1-surface",
        "properties": {
          "sourceId": "west-m1"
        },
        "x": -375,
        "y": -1230
      }
    },
    {
      "landmark": {
        "id": "sector-03-08:c4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C4",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "c4"
        },
        "x": 85,
        "y": -1610
      },
      "target": {
        "id": "sector-03-08:c4-surface",
        "properties": {
          "scannerControlled": true,
          "sourceId": "c4"
        },
        "x": 85,
        "y": -1610
      }
    },
    {
      "landmark": {
        "id": "sector-03-08:east-f3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "EAST-F3",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "east-f3"
        },
        "x": 765,
        "y": -1730
      },
      "target": {
        "id": "sector-03-08:east-f3-surface",
        "properties": {
          "sourceId": "east-f3"
        },
        "x": 765,
        "y": -1730
      }
    },
    {
      "landmark": {
        "id": "sector-03-08:g5",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G5",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g5"
        },
        "x": 540,
        "y": -1990
      },
      "target": {
        "id": "sector-03-08:g5-surface",
        "properties": {
          "sourceId": "g5"
        },
        "x": 540,
        "y": -1990
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 2176,
      "width": 4608
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "upper-market-gate",
      "free-weave-finale"
    ],
    "entry": {
      "id": "sector-03-08:entry",
      "x": -1920,
      "y": -64
    },
    "exit": {
      "id": "sector-03-08:exit",
      "x": 960,
      "y": -2070
    },
    "gate": {
      "barrier": {
        "height": 96,
        "width": 64,
        "x": 928,
        "y": -2134
      },
      "completionMode": "content-boundary",
      "id": "sector-03-08:gate",
      "nextAreaId": null,
      "requiredObjectiveIds": [
        "sector-03-08:exit-panel-engaged"
      ],
      "trigger": {
        "height": 160,
        "width": 96,
        "x": 912,
        "y": -2166
      }
    },
    "id": "sector-03-08",
    "name": "UPPER EXCHANGE GATE",
    "nextAreaId": null,
    "objectives": [
      {
        "id": "sector-03-08:exit-panel-engaged",
        "sourceObjectId": "sector-03-08:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 416,
            "width": 1200
          }
        },
        "coordinateAnchor": "center",
        "enemyType": "patrol-drone-t1",
        "id": "sector-03-08:drone-1",
        "kind": "patrol-drone",
        "patrol": {
          "mode": "pingpong",
          "points": [
            {
              "x": -1504,
              "y": -896
            },
            {
              "x": -1056,
              "y": -1024
            }
          ],
          "speed": 48,
          "waitSeconds": 0.45
        },
        "position": {
          "x": -865,
          "y": -590
        },
        "presentationId": "world-object:patrol-drone",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "target-lock-cycle",
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
            "height": 500,
            "width": 1200
          }
        },
        "coordinateAnchor": "center",
        "enemyType": "patrol-drone-t1",
        "id": "sector-03-08:drone-2",
        "kind": "patrol-drone",
        "patrol": {
          "mode": "pingpong",
          "points": [
            {
              "x": 720,
              "y": -1264
            },
            {
              "x": 1088,
              "y": -1408
            }
          ],
          "speed": 48,
          "waitSeconds": 0.45
        },
        "position": {
          "x": -65,
          "y": -1305
        },
        "presentationId": "world-object:patrol-drone",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "target-lock-cycle",
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
            "height": 500,
            "width": 1200
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "artillery-drone-t1",
            "support-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-03-08:market-lower-guard",
        "kind": "sentry",
        "position": {
          "x": -215,
          "y": -910
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
            "height": 384,
            "width": 576
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "artillery-drone-t1",
            "support-drone-t1",
            "swarm-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-03-08:market-upper-guard",
        "kind": "sentry",
        "position": {
          "x": -125,
          "y": -1670
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
            "height": 500,
            "width": 1200
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "artillery-drone-t1",
            "support-drone-t1",
            "swarm-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-03-08:final-control-guard",
        "kind": "sentry",
        "position": {
          "x": 380,
          "y": -1635
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
        "cueIds": [
          "sector-03-08:market-gate"
        ],
        "id": "sector-03-08:market-gate",
        "kind": "story-display",
        "position": {
          "x": -515,
          "y": -645
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-08:market-directory"
        ],
        "id": "sector-03-08:market-directory",
        "kind": "story-display",
        "position": {
          "x": 315,
          "y": -1115
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-08:evacuation-archive"
        ],
        "id": "sector-03-08:evacuation-archive",
        "kind": "story-display",
        "position": {
          "x": -225,
          "y": -1845
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-08:access-archive"
        ],
        "id": "sector-03-08:access-archive",
        "kind": "story-display",
        "position": {
          "x": 270,
          "y": -1840
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-08:final-control"
        ],
        "id": "sector-03-08:final-control",
        "kind": "story-display",
        "position": {
          "x": 960,
          "y": -2140
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-08:gate",
        "id": "sector-03-08:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-03-08:exit-panel-engaged",
        "position": {
          "x": 880,
          "y": -2070
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-08:gate",
        "id": "sector-03-08:exit-gate",
        "kind": "gate",
        "position": {
          "x": 960,
          "y": -2070
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 8,
    "recoveryPoints": [],
    "routePoints": [
      {
        "id": "sector-03-08:route-route-5-1-central-path-2-4",
        "sourceId": "route-5-1-central-path-2-4",
        "x": -416,
        "y": -832
      },
      {
        "id": "sector-03-08:route-route-5-1-central-path-3-5",
        "sourceId": "route-5-1-central-path-3-5",
        "x": -128,
        "y": -1000
      },
      {
        "id": "sector-03-08:route-route-5-1-central-path-4-6",
        "sourceId": "route-5-1-central-path-4-6",
        "x": -64,
        "y": -1120
      },
      {
        "id": "sector-03-08:route-route-5-1-west-path-1-7",
        "sourceId": "route-5-1-west-path-1-7",
        "x": -896,
        "y": -640
      },
      {
        "id": "sector-03-08:route-route-5-1-west-path-2-8",
        "sourceId": "route-5-1-west-path-2-8",
        "x": -1152,
        "y": -768
      },
      {
        "id": "sector-03-08:route-route-5-1-west-path-3-9",
        "sourceId": "route-5-1-west-path-3-9",
        "x": -1472,
        "y": -896
      },
      {
        "id": "sector-03-08:route-route-5-1-west-path-4-10",
        "sourceId": "route-5-1-west-path-4-10",
        "x": -1152,
        "y": -1024
      },
      {
        "id": "sector-03-08:route-route-5-1-west-path-5-11",
        "sourceId": "route-5-1-west-path-5-11",
        "x": -800,
        "y": -1104
      },
      {
        "id": "sector-03-08:route-route-5-1-west-path-6-12",
        "sourceId": "route-5-1-west-path-6-12",
        "x": -448,
        "y": -1120
      },
      {
        "id": "sector-03-08:route-route-5-1-west-path-7-13",
        "sourceId": "route-5-1-west-path-7-13",
        "x": -64,
        "y": -1120
      },
      {
        "id": "sector-03-08:route-route-5-1-east-path-2-15",
        "sourceId": "route-5-1-east-path-2-15",
        "x": -192,
        "y": -736
      },
      {
        "id": "sector-03-08:route-route-5-1-east-path-3-16",
        "sourceId": "route-5-1-east-path-3-16",
        "x": 160,
        "y": -832
      },
      {
        "id": "sector-03-08:route-route-5-1-east-path-4-17",
        "sourceId": "route-5-1-east-path-4-17",
        "x": 480,
        "y": -944
      },
      {
        "id": "sector-03-08:route-route-5-1-east-path-5-18",
        "sourceId": "route-5-1-east-path-5-18",
        "x": 320,
        "y": -1088
      },
      {
        "id": "sector-03-08:route-route-5-2-central-path-1-22",
        "sourceId": "route-5-2-central-path-1-22",
        "x": 320,
        "y": -1120
      },
      {
        "id": "sector-03-08:route-route-5-2-central-path-2-23",
        "sourceId": "route-5-2-central-path-2-23",
        "x": 128,
        "y": -1304
      },
      {
        "id": "sector-03-08:route-route-5-2-central-path-3-24",
        "sourceId": "route-5-2-central-path-3-24",
        "x": 128,
        "y": -1488
      },
      {
        "id": "sector-03-08:route-route-5-2-west-path-1-25",
        "sourceId": "route-5-2-west-path-1-25",
        "x": -64,
        "y": -1120
      },
      {
        "id": "sector-03-08:route-route-5-2-west-path-2-26",
        "sourceId": "route-5-2-west-path-2-26",
        "x": -352,
        "y": -1232
      },
      {
        "id": "sector-03-08:route-route-5-2-west-path-3-27",
        "sourceId": "route-5-2-west-path-3-27",
        "x": -704,
        "y": -1344
      },
      {
        "id": "sector-03-08:route-route-5-2-west-path-4-28",
        "sourceId": "route-5-2-west-path-4-28",
        "x": -384,
        "y": -1456
      },
      {
        "id": "sector-03-08:route-route-5-2-west-path-5-29",
        "sourceId": "route-5-2-west-path-5-29",
        "x": -64,
        "y": -1488
      },
      {
        "id": "sector-03-08:route-route-5-2-east-path-1-30",
        "sourceId": "route-5-2-east-path-1-30",
        "x": 320,
        "y": -1120
      },
      {
        "id": "sector-03-08:route-route-5-2-east-path-2-31",
        "sourceId": "route-5-2-east-path-2-31",
        "x": 640,
        "y": -1216
      },
      {
        "id": "sector-03-08:route-route-5-2-east-path-3-32",
        "sourceId": "route-5-2-east-path-3-32",
        "x": 992,
        "y": -1344
      },
      {
        "id": "sector-03-08:route-route-5-2-east-path-4-33",
        "sourceId": "route-5-2-east-path-4-33",
        "x": 640,
        "y": -1464
      },
      {
        "id": "sector-03-08:route-route-5-2-east-path-5-34",
        "sourceId": "route-5-2-east-path-5-34",
        "x": 320,
        "y": -1488
      },
      {
        "id": "sector-03-08:route-route-5-3-central-path-1-37",
        "sourceId": "route-5-3-central-path-1-37",
        "x": 320,
        "y": -1488
      },
      {
        "id": "sector-03-08:route-route-5-3-central-path-2-38",
        "sourceId": "route-5-3-central-path-2-38",
        "x": 128,
        "y": -1656
      },
      {
        "id": "sector-03-08:route-route-5-3-central-path-3-39",
        "sourceId": "route-5-3-central-path-3-39",
        "x": 128,
        "y": -1784
      },
      {
        "id": "sector-03-08:route-route-5-3-central-path-4-40",
        "sourceId": "route-5-3-central-path-4-40",
        "x": 384,
        "y": -1888
      },
      {
        "id": "sector-03-08:route-route-5-3-west-path-1-41",
        "sourceId": "route-5-3-west-path-1-41",
        "x": -64,
        "y": -1488
      },
      {
        "id": "sector-03-08:route-route-5-3-west-path-2-42",
        "sourceId": "route-5-3-west-path-2-42",
        "x": -352,
        "y": -1600
      },
      {
        "id": "sector-03-08:route-route-5-3-west-path-3-43",
        "sourceId": "route-5-3-west-path-3-43",
        "x": -704,
        "y": -1712
      },
      {
        "id": "sector-03-08:route-route-5-3-west-path-4-44",
        "sourceId": "route-5-3-west-path-4-44",
        "x": -384,
        "y": -1840
      },
      {
        "id": "sector-03-08:route-route-5-3-west-path-5-45",
        "sourceId": "route-5-3-west-path-5-45",
        "x": -384,
        "y": -1888
      },
      {
        "id": "sector-03-08:route-route-5-3-east-path-1-46",
        "sourceId": "route-5-3-east-path-1-46",
        "x": 320,
        "y": -1488
      },
      {
        "id": "sector-03-08:route-route-5-3-east-path-2-47",
        "sourceId": "route-5-3-east-path-2-47",
        "x": 608,
        "y": -1600
      },
      {
        "id": "sector-03-08:route-route-5-3-east-path-4-49",
        "sourceId": "route-5-3-east-path-4-49",
        "x": 608,
        "y": -1840
      },
      {
        "id": "sector-03-08:route-route-5-3-east-path-5-50",
        "sourceId": "route-5-3-east-path-5-50",
        "x": 384,
        "y": -1888
      }
    ],
    "routes": [
      "safe",
      "flow",
      "recovery"
    ],
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
          "sector-03-08:c1-surface",
          "sector-03-08:c2-surface",
          "sector-03-08:c3-surface",
          "sector-03-08:c4-surface"
        ],
        "cycle": {
          "available": 1.5,
          "locked": 1.1,
          "reset": 0.3,
          "warning": 0.6
        },
        "id": "sector-03-08:scanner-upper-market-A",
        "phaseOffsetSeconds": 0
      }
    ],
    "sectorId": "sector-03",
    "storyTriggers": [
      "upper-market-gate",
      "evacuation-archive",
      "access-archive"
    ],
    "subtitle": "OPEN MARKET SECURITY WEAVE",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1920,
          "y": -32
        },
        "sourceId": "entry-deck",
        "vertices": [
          {
            "x": -2016,
            "y": -32
          },
          {
            "x": -1824,
            "y": -32
          },
          {
            "x": -1824,
            "y": 0
          },
          {
            "x": -2016,
            "y": 0
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "safe-hub-m0",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -704,
          "y": -640
        },
        "sourceId": "safe-hub-m0",
        "vertices": [
          {
            "x": -896,
            "y": -640
          },
          {
            "x": -512,
            "y": -640
          },
          {
            "x": -512,
            "y": -610
          },
          {
            "x": -896,
            "y": -610
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "safe-hub-mx",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 130,
          "y": -1110
        },
        "sourceId": "safe-hub-mx",
        "vertices": [
          {
            "x": -62,
            "y": -1110
          },
          {
            "x": 322,
            "y": -1110
          },
          {
            "x": 322,
            "y": -1080
          },
          {
            "x": -62,
            "y": -1080
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "safe-hub-m1",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 335,
          "y": -1430
        },
        "sourceId": "safe-hub-m1",
        "vertices": [
          {
            "x": 143,
            "y": -1430
          },
          {
            "x": 527,
            "y": -1430
          },
          {
            "x": 527,
            "y": -1400
          },
          {
            "x": 143,
            "y": -1400
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "records-bay",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -25,
          "y": -1835
        },
        "sourceId": "records-bay",
        "vertices": [
          {
            "x": -409,
            "y": -1835
          },
          {
            "x": 359,
            "y": -1835
          },
          {
            "x": 359,
            "y": -1801
          },
          {
            "x": -409,
            "y": -1801
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "upper-control",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 960,
          "y": -2070
        },
        "sourceId": "upper-control",
        "vertices": [
          {
            "x": 800,
            "y": -2070
          },
          {
            "x": 1120,
            "y": -2070
          },
          {
            "x": 1120,
            "y": -2040
          },
          {
            "x": 800,
            "y": -2040
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
    "id": "3-8",
    "sector": 3,
    "sourceAreaId": "sector-03-08",
    "stage": 8
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
