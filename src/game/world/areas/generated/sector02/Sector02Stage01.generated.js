// GENERATED FILE - DO NOT EDIT
// Source: 2-1 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "2-1";
export const GENERATED_AREA_ID = "sector-02-01";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-02-01:anchor-a",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": -384,
        "y": -176
      },
      "objectIndex": 0,
      "surfaceIndex": 12,
      "target": {
        "id": "sector-02-01:anchor-a-surface",
        "properties": {},
        "x": -384,
        "y": -176
      }
    },
    {
      "landmark": {
        "id": "sector-02-01:anchor-c",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 224,
        "y": -352
      },
      "objectIndex": 1,
      "surfaceIndex": 14,
      "target": {
        "id": "sector-02-01:anchor-c-surface",
        "properties": {},
        "x": 224,
        "y": -352
      }
    },
    {
      "landmark": {
        "id": "sector-02-01:anchor-e",
        "properties": {
          "coordinateAnchor": "center",
          "label": "E",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 160,
        "y": -576
      },
      "objectIndex": 2,
      "surfaceIndex": 16,
      "target": {
        "id": "sector-02-01:anchor-e-surface",
        "properties": {},
        "x": 160,
        "y": -576
      }
    },
    {
      "landmark": {
        "id": "sector-02-01:anchor-g",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G",
          "presentationId": "world-object:grapple-landmark"
        },
        "x": 416,
        "y": -752
      },
      "objectIndex": 3,
      "surfaceIndex": 18,
      "target": {
        "id": "sector-02-01:anchor-g-surface",
        "properties": {},
        "x": 416,
        "y": -752
      }
    }
  ],
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 832,
      "width": 1472
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "worker-block-12",
      "residential-courtyard",
      "quiet-housing",
      "community-notice"
    ],
    "entry": {
      "id": "sector-02-01:entry",
      "x": -624,
      "y": -32
    },
    "exit": {
      "id": "sector-02-01:exit",
      "x": 664,
      "y": -800
    },
    "gate": {
      "id": "sector-02-01:gate",
      "nextAreaId": "sector-02-02",
      "requiredObjectiveIds": [
        "sector-02-01:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 638,
        "y": -830
      }
    },
    "id": "sector-02-01",
    "name": "WORKER BLOCK 12",
    "nextAreaId": "sector-02-02",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 128,
          "x": 600,
          "y": -832
        },
        "id": "sector-02-01:exit-reached",
        "type": "reach"
      },
      {
        "id": "sector-02-01:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-02-01:exit-reached"
        ],
        "sourceObjectId": "sector-02-01:exit-panel",
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
            "height": 256,
            "width": 384
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "sentry-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-02-01:courtyard-guard",
        "kind": "sentry",
        "position": {
          "x": 384,
          "y": -384
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
          "evacuation-group-c",
          "wait-for-further-instruction"
        ],
        "id": "sector-02-01:community-notice",
        "kind": "story-display",
        "position": {
          "x": 568,
          "y": -768
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-01:gate",
        "id": "sector-02-01:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-02-01:exit-panel-engaged",
        "position": {
          "x": 552,
          "y": -768
        },
        "presentationId": "world-object:gate-panel",
        "requiredObjectiveIds": [
          "sector-02-01:exit-reached"
        ]
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-02-01:gate",
        "id": "sector-02-01:exit-gate",
        "kind": "gate",
        "position": {
          "x": 664,
          "y": -768
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 1,
    "recoveryPoints": [
      {
        "id": "sector-02-01:recovery-r1",
        "x": -192,
        "y": -128
      },
      {
        "id": "sector-02-01:recovery-r2",
        "x": 16,
        "y": -224
      },
      {
        "id": "sector-02-01:recovery-r3",
        "x": 160,
        "y": -336
      },
      {
        "id": "sector-02-01:recovery-r4",
        "x": -64,
        "y": -432
      }
    ],
    "routePoints": [
      {
        "id": "sector-02-01:route-entry",
        "x": -624,
        "y": -32
      },
      {
        "id": "sector-02-01:route-lower-alley",
        "x": -448,
        "y": -96
      },
      {
        "id": "sector-02-01:route-anchor-a",
        "landmark": "A",
        "x": -384,
        "y": -176
      },
      {
        "id": "sector-02-01:route-b",
        "x": -96,
        "y": -256
      },
      {
        "id": "sector-02-01:route-small-court",
        "x": 96,
        "y": -288
      },
      {
        "id": "sector-02-01:route-anchor-c",
        "landmark": "C",
        "x": 224,
        "y": -352
      },
      {
        "id": "sector-02-01:route-mid-utility",
        "x": 320,
        "y": -384
      },
      {
        "id": "sector-02-01:route-d",
        "x": 160,
        "y": -464
      },
      {
        "id": "sector-02-01:route-laundry-landing",
        "x": -32,
        "y": -496
      },
      {
        "id": "sector-02-01:route-anchor-e",
        "landmark": "E",
        "x": 160,
        "y": -576
      },
      {
        "id": "sector-02-01:route-f",
        "x": 416,
        "y": -640
      },
      {
        "id": "sector-02-01:route-upper-gallery",
        "x": 480,
        "y": -672
      },
      {
        "id": "sector-02-01:route-story-safe",
        "x": 288,
        "y": -704
      },
      {
        "id": "sector-02-01:route-anchor-g",
        "landmark": "G",
        "x": 416,
        "y": -752
      },
      {
        "id": "sector-02-01:route-exit",
        "x": 600,
        "y": -800
      }
    ],
    "routes": [
      "safe",
      "flow",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-02",
    "storyTriggers": [
      "block-12-entry",
      "lived-in-trace",
      "community-notice"
    ],
    "subtitle": "RESIDENTIAL COURTYARD",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:entry-walk",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -560,
          "y": 0
        },
        "vertices": [
          {
            "x": -736,
            "y": 0
          },
          {
            "x": -384,
            "y": 0
          },
          {
            "x": -384,
            "y": 32
          },
          {
            "x": -736,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:lower-alley",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -448,
          "y": -96
        },
        "vertices": [
          {
            "x": -592,
            "y": -96
          },
          {
            "x": -304,
            "y": -96
          },
          {
            "x": -304,
            "y": -76
          },
          {
            "x": -592,
            "y": -76
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:r1",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -192,
          "y": -112
        },
        "vertices": [
          {
            "x": -304,
            "y": -112
          },
          {
            "x": -80,
            "y": -112
          },
          {
            "x": -80,
            "y": -96
          },
          {
            "x": -304,
            "y": -96
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:r2",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 16,
          "y": -208
        },
        "vertices": [
          {
            "x": -96,
            "y": -208
          },
          {
            "x": 128,
            "y": -208
          },
          {
            "x": 128,
            "y": -192
          },
          {
            "x": -96,
            "y": -192
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:small-court-landing",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 96,
          "y": -288
        },
        "vertices": [
          {
            "x": -32,
            "y": -288
          },
          {
            "x": 224,
            "y": -288
          },
          {
            "x": 224,
            "y": -266
          },
          {
            "x": -32,
            "y": -266
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:r3",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 160,
          "y": -320
        },
        "vertices": [
          {
            "x": 48,
            "y": -320
          },
          {
            "x": 272,
            "y": -320
          },
          {
            "x": 272,
            "y": -304
          },
          {
            "x": 48,
            "y": -304
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:mid-utility-landing",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 320,
          "y": -384
        },
        "vertices": [
          {
            "x": 208,
            "y": -384
          },
          {
            "x": 432,
            "y": -384
          },
          {
            "x": 432,
            "y": -362
          },
          {
            "x": 208,
            "y": -362
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:r4",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -64,
          "y": -416
        },
        "vertices": [
          {
            "x": -168,
            "y": -416
          },
          {
            "x": 40,
            "y": -416
          },
          {
            "x": 40,
            "y": -400
          },
          {
            "x": -168,
            "y": -400
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:laundry-landing",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -32,
          "y": -496
        },
        "vertices": [
          {
            "x": -160,
            "y": -496
          },
          {
            "x": 96,
            "y": -496
          },
          {
            "x": 96,
            "y": -474
          },
          {
            "x": -160,
            "y": -474
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:upper-shared-gallery",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 480,
          "y": -672
        },
        "vertices": [
          {
            "x": 336,
            "y": -672
          },
          {
            "x": 624,
            "y": -672
          },
          {
            "x": 624,
            "y": -650
          },
          {
            "x": 336,
            "y": -650
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:story-safe-landing",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 288,
          "y": -704
        },
        "vertices": [
          {
            "x": 160,
            "y": -704
          },
          {
            "x": 416,
            "y": -704
          },
          {
            "x": 416,
            "y": -686
          },
          {
            "x": 160,
            "y": -686
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "sector-02-01:exit-deck",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": 536,
          "y": -768
        },
        "vertices": [
          {
            "x": 376,
            "y": -768
          },
          {
            "x": 696,
            "y": -768
          },
          {
            "x": 696,
            "y": -736
          },
          {
            "x": 376,
            "y": -736
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-01:grip-b-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": -96,
          "y": -256
        },
        "renderable": false,
        "vertices": [
          {
            "x": -108,
            "y": -268
          },
          {
            "x": -84,
            "y": -268
          },
          {
            "x": -84,
            "y": -244
          },
          {
            "x": -108,
            "y": -244
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-01:grip-d-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 160,
          "y": -464
        },
        "renderable": false,
        "vertices": [
          {
            "x": 148,
            "y": -476
          },
          {
            "x": 172,
            "y": -476
          },
          {
            "x": 172,
            "y": -452
          },
          {
            "x": 148,
            "y": -452
          }
        ]
      },
      {
        "collision": false,
        "coordinateAnchor": "center",
        "grappleable": true,
        "id": "sector-02-01:grip-f-surface",
        "kind": "structural-grapple-target",
        "oneWay": false,
        "position": {
          "x": 416,
          "y": -640
        },
        "renderable": false,
        "vertices": [
          {
            "x": 404,
            "y": -652
          },
          {
            "x": 428,
            "y": -652
          },
          {
            "x": 428,
            "y": -628
          },
          {
            "x": 404,
            "y": -628
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
    "legacyStageAlias": "2-1",
    "sector": 2,
    "sourceAreaId": "sector-02-01",
    "stage": 1
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
