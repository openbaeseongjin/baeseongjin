// GENERATED FILE - DO NOT EDIT
// Source: 3-7 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "3-7";
export const GENERATED_AREA_ID = "sector-03-07";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-03-07:g0",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G0",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g0"
        },
        "x": -1472,
        "y": -192
      },
      "target": {
        "id": "sector-03-07:g0-surface",
        "properties": {
          "sourceId": "g0"
        },
        "x": -1472,
        "y": -192
      }
    },
    {
      "landmark": {
        "id": "sector-03-07:g1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g1"
        },
        "x": -845,
        "y": -425
      },
      "target": {
        "id": "sector-03-07:g1-surface",
        "properties": {
          "sourceId": "g1"
        },
        "x": -845,
        "y": -425
      }
    },
    {
      "landmark": {
        "id": "sector-03-07:o6",
        "properties": {
          "coordinateAnchor": "center",
          "label": "O6",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "o6"
        },
        "x": 220,
        "y": -1180
      },
      "target": {
        "id": "sector-03-07:o6-surface",
        "properties": {
          "sourceId": "o6"
        },
        "x": 220,
        "y": -1180
      }
    },
    {
      "landmark": {
        "id": "sector-03-07:psp1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "PSP1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "psp1"
        },
        "x": 10,
        "y": -940
      },
      "target": {
        "id": "sector-03-07:psp1-surface",
        "properties": {
          "sourceId": "psp1"
        },
        "x": 10,
        "y": -940
      }
    },
    {
      "landmark": {
        "id": "sector-03-07:s1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "S1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "s1"
        },
        "x": -325,
        "y": -810
      },
      "target": {
        "id": "sector-03-07:s1-surface",
        "properties": {
          "sourceId": "s1"
        },
        "x": -325,
        "y": -810
      }
    },
    {
      "landmark": {
        "id": "sector-03-07:exit-approach",
        "properties": {
          "coordinateAnchor": "center",
          "label": "EXIT-APPROACH",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "exit-approach"
        },
        "x": -205,
        "y": -1560
      },
      "target": {
        "id": "sector-03-07:exit-approach-surface",
        "properties": {
          "sourceId": "exit-approach"
        },
        "x": -205,
        "y": -1560
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1792,
      "width": 3840
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "priority-concourse",
      "access-tier-reveal"
    ],
    "entry": {
      "id": "sector-03-07:entry",
      "x": -1664,
      "y": -64
    },
    "exit": {
      "id": "sector-03-07:exit",
      "x": -480,
      "y": -1696
    },
    "gate": {
      "id": "sector-03-07:gate",
      "nextAreaId": "sector-03-08",
      "requiredObjectiveIds": [
        "sector-03-07:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": -506,
        "y": -1758
      }
    },
    "id": "sector-03-07",
    "name": "TRANSFER MEZZANINE",
    "nextAreaId": "sector-03-08",
    "objectives": [
      {
        "id": "sector-03-07:exit-panel-engaged",
        "sourceObjectId": "sector-03-07:exit-panel",
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
        "id": "sector-03-07:concourse-lower-guard",
        "kind": "sentry",
        "position": {
          "x": -1105,
          "y": -345
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
        "enemyType": "patrol-drone-t1",
        "id": "sector-03-07:drone-1",
        "kind": "patrol-drone",
        "patrol": {
          "mode": "pingpong",
          "points": [
            {
              "x": -64,
              "y": -864
            },
            {
              "x": 448,
              "y": -1080
            }
          ],
          "speed": 48,
          "waitSeconds": 0.45
        },
        "position": {
          "x": -64,
          "y": -864
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
            "width": 2000
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
        "id": "sector-03-07:concourse-centre-guard",
        "kind": "sentry",
        "position": {
          "x": -665,
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
        "accessModuleId": "sector-03:access-module:c",
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
        "id": "sector-03-07:concourse-upper-guard",
        "kind": "sentry",
        "position": {
          "x": 120,
          "y": -1360
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional-for-stage",
          "kill-required-for-access-module-c",
          "no-rope-cut",
          "activation-band-only"
        ]
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-07:concourse-sign"
        ],
        "id": "sector-03-07:concourse-sign",
        "kind": "story-display",
        "position": {
          "x": -576,
          "y": -650
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "cueIds": [
          "sector-03-07:access-directory"
        ],
        "id": "sector-03-07:access-directory",
        "kind": "story-display",
        "position": {
          "x": 810,
          "y": -1264
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-07:upper-market-gate-ahead"
        ],
        "id": "sector-03-07:upper-market-gate-ahead",
        "kind": "story-display",
        "position": {
          "x": -480,
          "y": -1754
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-07:gate",
        "id": "sector-03-07:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-03-07:exit-panel-engaged",
        "position": {
          "x": -560,
          "y": -1696
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-07:gate",
        "id": "sector-03-07:exit-gate",
        "kind": "gate",
        "position": {
          "x": -480,
          "y": -1696
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 7,
    "recoveryPoints": [],
    "routePoints": [
      {
        "id": "sector-03-07:route-route-4-1-path-1-2",
        "sourceId": "route-4-1-path-1-2",
        "x": -768,
        "y": -544
      },
      {
        "id": "sector-03-07:route-route-4-1-path-2-3",
        "sourceId": "route-4-1-path-2-3",
        "x": -1056,
        "y": -704
      },
      {
        "id": "sector-03-07:route-route-4-1-path-3-4",
        "sourceId": "route-4-1-path-3-4",
        "x": -1344,
        "y": -832
      },
      {
        "id": "sector-03-07:route-route-4-1-path-4-5",
        "sourceId": "route-4-1-path-4-5",
        "x": -1600,
        "y": -960
      },
      {
        "id": "sector-03-07:route-route-4-1-path-5-6",
        "sourceId": "route-4-1-path-5-6",
        "x": -1280,
        "y": -1088
      },
      {
        "id": "sector-03-07:route-route-4-1-path-6-7",
        "sourceId": "route-4-1-path-6-7",
        "x": -928,
        "y": -1168
      },
      {
        "id": "sector-03-07:route-route-4-1-path-7-8",
        "sourceId": "route-4-1-path-7-8",
        "x": -576,
        "y": -1216
      },
      {
        "id": "sector-03-07:route-route-4-1-path-8-9",
        "sourceId": "route-4-1-path-8-9",
        "x": -224,
        "y": -1240
      },
      {
        "id": "sector-03-07:route-route-4-1-path-9-10",
        "sourceId": "route-4-1-path-9-10",
        "x": 128,
        "y": -1256
      },
      {
        "id": "sector-03-07:route-route-4-1-path-10-11",
        "sourceId": "route-4-1-path-10-11",
        "x": 448,
        "y": -1264
      },
      {
        "id": "sector-03-07:route-route-4-2-path-1-13",
        "sourceId": "route-4-2-path-1-13",
        "x": -384,
        "y": -544
      },
      {
        "id": "sector-03-07:route-route-4-2-path-2-14",
        "sourceId": "route-4-2-path-2-14",
        "x": -192,
        "y": -800
      },
      {
        "id": "sector-03-07:route-route-4-2-path-3-15",
        "sourceId": "route-4-2-path-3-15",
        "x": 96,
        "y": -944
      },
      {
        "id": "sector-03-07:route-route-4-2-path-4-16",
        "sourceId": "route-4-2-path-4-16",
        "x": 384,
        "y": -1088
      },
      {
        "id": "sector-03-07:route-route-4-2-path-5-17",
        "sourceId": "route-4-2-path-5-17",
        "x": 448,
        "y": -1264
      },
      {
        "id": "sector-03-07:route-route-4-3-path-1-19",
        "sourceId": "route-4-3-path-1-19",
        "x": -384,
        "y": -544
      },
      {
        "id": "sector-03-07:route-route-4-3-path-2-20",
        "sourceId": "route-4-3-path-2-20",
        "x": -64,
        "y": -656
      },
      {
        "id": "sector-03-07:route-route-4-3-path-3-21",
        "sourceId": "route-4-3-path-3-21",
        "x": 256,
        "y": -720
      },
      {
        "id": "sector-03-07:route-route-4-3-path-4-22",
        "sourceId": "route-4-3-path-4-22",
        "x": 576,
        "y": -800
      },
      {
        "id": "sector-03-07:route-route-4-3-path-5-23",
        "sourceId": "route-4-3-path-5-23",
        "x": 864,
        "y": -928
      },
      {
        "id": "sector-03-07:route-route-4-3-path-6-24",
        "sourceId": "route-4-3-path-6-24",
        "x": 800,
        "y": -1088
      },
      {
        "id": "sector-03-07:route-route-4-3-path-7-25",
        "sourceId": "route-4-3-path-7-25",
        "x": 832,
        "y": -1264
      }
    ],
    "routes": [
      "outer",
      "priority-spine",
      "service",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-03",
    "storyTriggers": [
      "priority-concourse",
      "access-tier",
      "service-class"
    ],
    "subtitle": "THREE-BAND COMMERCIAL TRANSFER BRAID",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "entry-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1664,
          "y": -32
        },
        "sourceId": "entry-deck",
        "vertices": [
          {
            "x": -1760,
            "y": -32
          },
          {
            "x": -1568,
            "y": -32
          },
          {
            "x": -1568,
            "y": 0
          },
          {
            "x": -1760,
            "y": 0
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "entry-concourse",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1110,
          "y": -290
        },
        "sourceId": "entry-concourse",
        "vertices": [
          {
            "x": -1270,
            "y": -290
          },
          {
            "x": -950,
            "y": -290
          },
          {
            "x": -950,
            "y": -262
          },
          {
            "x": -1270,
            "y": -262
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
          "x": -576,
          "y": -544
        },
        "sourceId": "safe-hub-m1",
        "vertices": [
          {
            "x": -768,
            "y": -544
          },
          {
            "x": -384,
            "y": -544
          },
          {
            "x": -384,
            "y": -514
          },
          {
            "x": -768,
            "y": -514
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "safe-hub-m2",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 640,
          "y": -1264
        },
        "sourceId": "safe-hub-m2",
        "vertices": [
          {
            "x": 448,
            "y": -1264
          },
          {
            "x": 832,
            "y": -1264
          },
          {
            "x": 832,
            "y": -1234
          },
          {
            "x": 448,
            "y": -1234
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "upper-transfer-threshold",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 128,
          "y": -1472
        },
        "sourceId": "upper-transfer-threshold",
        "vertices": [
          {
            "x": -64,
            "y": -1472
          },
          {
            "x": 320,
            "y": -1472
          },
          {
            "x": 320,
            "y": -1444
          },
          {
            "x": -64,
            "y": -1444
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -480,
          "y": -1696
        },
        "sourceId": "exit-deck",
        "vertices": [
          {
            "x": -640,
            "y": -1696
          },
          {
            "x": -320,
            "y": -1696
          },
          {
            "x": -320,
            "y": -1666
          },
          {
            "x": -640,
            "y": -1666
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
    "id": "3-7",
    "sector": 3,
    "sourceAreaId": "sector-03-07",
    "stage": 7
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
