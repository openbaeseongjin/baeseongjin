// GENERATED FILE - DO NOT EDIT
// Source: 3-1 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "3-1";
export const GENERATED_AREA_ID = "sector-03-01";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "sector-03-01:g1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G1",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g1"
        },
        "x": -1184,
        "y": -192
      },
      "target": {
        "id": "sector-03-01:g1-surface",
        "properties": {
          "sourceId": "g1"
        },
        "x": -1184,
        "y": -192
      }
    },
    {
      "landmark": {
        "id": "sector-03-01:g2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G2",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g2"
        },
        "x": -640,
        "y": -416
      },
      "target": {
        "id": "sector-03-01:g2-surface",
        "properties": {
          "sourceId": "g2"
        },
        "x": -640,
        "y": -416
      }
    },
    {
      "landmark": {
        "id": "sector-03-01:g3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G3",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g3"
        },
        "x": 416,
        "y": -640
      },
      "target": {
        "id": "sector-03-01:g3-surface",
        "properties": {
          "sourceId": "g3"
        },
        "x": 416,
        "y": -640
      }
    },
    {
      "landmark": {
        "id": "sector-03-01:g4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "G4",
          "presentationId": "world-object:grapple-landmark",
          "sourceId": "g4"
        },
        "x": 1184,
        "y": -672
      },
      "target": {
        "id": "sector-03-01:g4-surface",
        "properties": {
          "sourceId": "g4"
        },
        "x": 1184,
        "y": -672
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 1088,
      "width": 3072
    },
    "cameraZones": [],
    "checkpoints": [],
    "cueIds": [
      "powered-promenade",
      "commercial-threshold"
    ],
    "entry": {
      "id": "sector-03-01:entry",
      "x": -1392,
      "y": -32
    },
    "exit": {
      "id": "sector-03-01:exit",
      "x": 1440,
      "y": -832
    },
    "gate": {
      "id": "sector-03-01:gate",
      "nextAreaId": "sector-03-02",
      "requiredObjectiveIds": [
        "sector-03-01:exit-panel-engaged"
      ],
      "trigger": {
        "height": 62,
        "width": 52,
        "x": 1414,
        "y": -862
      }
    },
    "id": "sector-03-01",
    "name": "LOWER MARKET PROMENADE",
    "nextAreaId": "sector-03-02",
    "objectives": [
      {
        "bounds": {
          "height": 96,
          "width": 320,
          "x": 1152,
          "y": -832
        },
        "id": "sector-03-01:final-deck-reached",
        "type": "reach"
      },
      {
        "id": "sector-03-01:exit-panel-engaged",
        "requiredObjectiveIds": [
          "sector-03-01:final-deck-reached"
        ],
        "sourceObjectId": "sector-03-01:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-01:district-sign"
        ],
        "id": "sector-03-01:district-sign",
        "kind": "story-display",
        "position": {
          "x": -1026,
          "y": -286
        },
        "presentationId": "world-object:story-display"
      },
      {
        "coordinateAnchor": "center",
        "cueIds": [
          "sector-03-01:welcome-kiosk"
        ],
        "id": "sector-03-01:welcome-kiosk",
        "kind": "story-display",
        "position": {
          "x": -112,
          "y": -610
        },
        "presentationId": "world-object:story-display"
      },
      {
        "activationSpec": {
          "anchor": "center",
          "offset": {
            "x": 0,
            "y": 0
          },
          "size": {
            "height": 192,
            "width": 384
          }
        },
        "coordinateAnchor": "center",
        "enemySelection": {
          "allowedEnemyTypes": [
            "pursuit-drone-t1",
            "shield-drone-t1",
            "artillery-drone-t1"
          ]
        },
        "enemyType": "sentry-t1",
        "id": "sector-03-01:promenade-guard",
        "kind": "sentry",
        "position": {
          "x": 944,
          "y": -416
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
        "gateId": "sector-03-01:gate",
        "id": "sector-03-01:exit-panel",
        "interactionRadius": 72,
        "kind": "gate-panel",
        "objectiveId": "sector-03-01:exit-panel-engaged",
        "position": {
          "x": 1360,
          "y": -800
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-03-01:gate",
        "id": "sector-03-01:exit-gate",
        "kind": "gate",
        "position": {
          "x": 1440,
          "y": -800
        },
        "presentationId": "world-object:gate"
      }
    ],
    "order": 1,
    "recoveryPoints": [
      {
        "id": "sector-03-01:recovery-recovery-a",
        "sourceId": "recovery-a",
        "x": -576,
        "y": -194
      },
      {
        "id": "sector-03-01:recovery-recovery-b",
        "sourceId": "recovery-b",
        "x": 384,
        "y": -322
      }
    ],
    "routePoints": [
      {
        "id": "sector-03-01:route-entry",
        "sourceId": "entry",
        "x": -1392,
        "y": -32
      },
      {
        "id": "sector-03-01:route-g1",
        "sourceId": "g1",
        "x": -1184,
        "y": -192
      },
      {
        "id": "sector-03-01:route-p1",
        "sourceId": "p1",
        "x": -1056,
        "y": -224
      },
      {
        "id": "sector-03-01:route-g2",
        "sourceId": "g2",
        "x": -640,
        "y": -416
      },
      {
        "id": "sector-03-01:route-island-left-edge",
        "sourceId": "island-left-edge",
        "x": -384,
        "y": -544
      },
      {
        "id": "sector-03-01:route-island-centre",
        "sourceId": "island-centre",
        "x": -128,
        "y": -544
      },
      {
        "id": "sector-03-01:route-island-right-edge",
        "sourceId": "island-right-edge",
        "x": 128,
        "y": -544
      },
      {
        "id": "sector-03-01:route-g3",
        "sourceId": "g3",
        "x": 416,
        "y": -640
      },
      {
        "id": "sector-03-01:route-p3-left-edge",
        "sourceId": "p3-left-edge",
        "x": 704,
        "y": -416
      },
      {
        "id": "sector-03-01:route-p3",
        "sourceId": "p3",
        "x": 896,
        "y": -416
      },
      {
        "id": "sector-03-01:route-g4",
        "sourceId": "g4",
        "x": 1184,
        "y": -672
      },
      {
        "id": "sector-03-01:route-exit",
        "sourceId": "exit",
        "x": 1376,
        "y": -832
      }
    ],
    "routes": [
      "safe",
      "flow",
      "recovery"
    ],
    "scannerGroups": [],
    "sectorId": "sector-03",
    "storyTriggers": [
      "district-sign",
      "powered-environment",
      "automated-welcome"
    ],
    "subtitle": "COMMERCIAL THRESHOLD",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p0",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": -1392,
          "y": 0
        },
        "sourceId": "p0",
        "vertices": [
          {
            "x": -1504,
            "y": 0
          },
          {
            "x": -1280,
            "y": 0
          },
          {
            "x": -1280,
            "y": 32
          },
          {
            "x": -1504,
            "y": 32
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p1-left-market",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -1056,
          "y": -224
        },
        "sourceId": "p1-left-market",
        "vertices": [
          {
            "x": -1248,
            "y": -224
          },
          {
            "x": -864,
            "y": -224
          },
          {
            "x": -864,
            "y": -198
          },
          {
            "x": -1248,
            "y": -198
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "recovery-a",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": -576,
          "y": -176
        },
        "sourceId": "recovery-a",
        "vertices": [
          {
            "x": -704,
            "y": -176
          },
          {
            "x": -448,
            "y": -176
          },
          {
            "x": -448,
            "y": -158
          },
          {
            "x": -704,
            "y": -158
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p2-suspended-market-island",
        "kind": "safe-deck",
        "oneWay": true,
        "position": {
          "x": -128,
          "y": -544
        },
        "sourceId": "p2-suspended-market-island",
        "vertices": [
          {
            "x": -384,
            "y": -544
          },
          {
            "x": 128,
            "y": -544
          },
          {
            "x": 128,
            "y": -514
          },
          {
            "x": -384,
            "y": -514
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "recovery-b",
        "kind": "recovery",
        "oneWay": true,
        "position": {
          "x": 384,
          "y": -304
        },
        "sourceId": "recovery-b",
        "vertices": [
          {
            "x": 256,
            "y": -304
          },
          {
            "x": 512,
            "y": -304
          },
          {
            "x": 512,
            "y": -286
          },
          {
            "x": 256,
            "y": -286
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "p3-right-market",
        "kind": "platform",
        "oneWay": true,
        "position": {
          "x": 896,
          "y": -416
        },
        "sourceId": "p3-right-market",
        "vertices": [
          {
            "x": 704,
            "y": -416
          },
          {
            "x": 1088,
            "y": -416
          },
          {
            "x": 1088,
            "y": -390
          },
          {
            "x": 704,
            "y": -390
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
          "x": 1312,
          "y": -800
        },
        "sourceId": "exit-deck",
        "vertices": [
          {
            "x": 1152,
            "y": -800
          },
          {
            "x": 1472,
            "y": -800
          },
          {
            "x": 1472,
            "y": -772
          },
          {
            "x": 1152,
            "y": -772
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
  "provenance": {
    "boundsProvenance": "authored",
    "sourcePath": "docs/bsh/scenario/3/3-1/AREA-SPEC-REV8-DESIGN.json",
    "sourceSchemaVersion": "area-spec-v1",
    "sourceSnapshot": {
      "augment": {
        "baseRopeClearable": true,
        "currentContract": "generic Augment v1 carry",
        "requiresSpecificCard": false
      },
      "baselineCommit": "c1f9cd7f0362de7f7a3065a34e7ea9d35927a934",
      "bounds": {
        "height": 1088,
        "width": 3072
      },
      "camera": {
        "customZonesRequired": false,
        "mode": "default-authored-camera-first",
        "requirements": {
          "ascent": [
            "Player",
            "G2",
            "island left edge"
          ],
          "descent": [
            "Player",
            "G3",
            "right-market broad landing"
          ],
          "entry": [
            "Player",
            "high suspended market island",
            "long commercial depth",
            "exit hidden"
          ],
          "exit": [
            "Player",
            "G4",
            "3-2 service threshold"
          ],
          "guard": [
            "ordinary gameplay framing"
          ],
          "island": [
            "Player",
            "large safe island",
            "right-market direction",
            "multi-floor depth"
          ]
        }
      },
      "entry": {
        "id": "sector-03-01:entry",
        "x": -1392,
        "y": -32
      },
      "forbidden": [
        "active Scanner in 3-1",
        "Patrol Drone",
        "second enemy",
        "Rope Cutter",
        "Wind",
        "kill gate",
        "enemy pressure on Story safe zones",
        "Player Bark as System Toast",
        "Group A/B identity",
        "Priority recipient identity",
        "C suspension cause",
        "class mapping",
        "intentional abandonment conclusion",
        "horizontal corridor interpretation",
        "repeated twin-void terrace grammar from superseded REV2"
      ],
      "gate": {
        "completionMode": "physical-crossing",
        "nextAreaId": "sector-03-02",
        "requiredObjectiveIds": [
          "sector-03-01:exit-panel-engaged"
        ]
      },
      "grappleTargets": [
        {
          "id": "g1",
          "role": "entry-to-left-market",
          "x": -1184,
          "y": -192
        },
        {
          "id": "g2",
          "role": "left-market-to-suspended-island",
          "x": -640,
          "y": -416
        },
        {
          "id": "g3",
          "role": "suspended-island-to-right-market-descending-arc",
          "x": 416,
          "y": -640
        },
        {
          "id": "g4",
          "role": "right-market-to-service-exit",
          "x": 1184,
          "y": -672
        }
      ],
      "mainRoute": [
        {
          "id": "entry",
          "x": -1392,
          "y": -32
        },
        {
          "id": "g1",
          "x": -1184,
          "y": -192
        },
        {
          "id": "p1",
          "x": -1056,
          "y": -224
        },
        {
          "id": "g2",
          "x": -640,
          "y": -416
        },
        {
          "id": "island-left-edge",
          "x": -384,
          "y": -544
        },
        {
          "id": "island-centre",
          "x": -128,
          "y": -544
        },
        {
          "id": "island-right-edge",
          "x": 128,
          "y": -544
        },
        {
          "id": "g3",
          "x": 416,
          "y": -640
        },
        {
          "id": "p3-left-edge",
          "x": 704,
          "y": -416
        },
        {
          "id": "p3",
          "x": 896,
          "y": -416
        },
        {
          "id": "g4",
          "x": 1184,
          "y": -672
        },
        {
          "id": "exit",
          "x": 1312,
          "y": -800
        }
      ],
      "objectives": [
        {
          "id": "sector-03-01:final-deck-reached",
          "target": "exit-deck",
          "type": "reach"
        },
        {
          "id": "sector-03-01:exit-panel-engaged",
          "requiredObjectiveIds": [
            "sector-03-01:final-deck-reached"
          ],
          "sourceObjectId": "sector-03-01:exit-panel",
          "type": "interact"
        }
      ],
      "objects": [
        {
          "id": "district-sign",
          "kind": "story-display",
          "properties": {
            "cueIds": [
              "sector-03-01:district-sign"
            ],
            "presentation": {
              "detail": "PROMENADE 06",
              "status": "VERIFIED",
              "title": "COMMERCIAL DISTRICT"
            }
          },
          "stableRuntimeId": "sector-03-01:district-sign",
          "x": -1026,
          "y": -286
        },
        {
          "id": "welcome-kiosk",
          "kind": "story-display",
          "properties": {
            "cueIds": [
              "sector-03-01:welcome-kiosk"
            ],
            "presentation": {
              "detail": "PUBLIC SERVICE ONLINE",
              "status": "VERIFIED",
              "title": "WELCOME"
            }
          },
          "stableRuntimeId": "sector-03-01:welcome-kiosk",
          "x": -112,
          "y": -610
        },
        {
          "id": "promenade-guard",
          "kind": "sentry-slot",
          "properties": {
            "activationPolicy": "right-market-only-after-story-and-island-crossing",
            "cannotPressure": [
              "left-market-story-safe",
              "suspended-island-story-safe"
            ],
            "enemySelection": {
              "allowedEnemyTypes": [
                "pursuit-drone-t1",
                "shield-drone-t1",
                "artillery-drone-t1"
              ],
              "authority": "SECTOR_03_STANDARD_POOL"
            },
            "enemyType": "sentry-t1",
            "rules": [
              "kill-optional",
              "no-rope-cut",
              "activation-band-only"
            ]
          },
          "stableRuntimeId": "sector-03-01:promenade-guard",
          "x": 944,
          "y": -416
        },
        {
          "id": "exit-panel",
          "kind": "interaction",
          "properties": {
            "objectiveId": "sector-03-01:exit-panel-engaged",
            "requiredObjectiveIds": [
              "sector-03-01:final-deck-reached"
            ]
          },
          "stableRuntimeId": "sector-03-01:exit-panel",
          "x": 1360,
          "y": -800
        }
      ],
      "patrol": {
        "active": false
      },
      "recoveryPoints": [
        {
          "bypassForbidden": [
            "p2-suspended-market-island"
          ],
          "id": "recovery-a",
          "retrySecondsTarget": [
            3,
            5
          ],
          "x": -576,
          "y": -194
        },
        {
          "bypassForbidden": [
            "p3-right-market"
          ],
          "id": "recovery-b",
          "retrySecondsTarget": [
            3,
            5
          ],
          "x": 384,
          "y": -322
        }
      ],
      "revision": {
        "designIteration": "REV3",
        "final": "REV8.0",
        "supersedes": [
          "REV2 2816x960 DRAFT",
          "REV1 legacy vertical blockout"
        ]
      },
      "ropeCut": {
        "active": false
      },
      "safeZones": [
        {
          "contract": [
            "no authored enemy pressure",
            "district-sign readable",
            "Player Bark A opportunity"
          ],
          "id": "left-market-story-safe",
          "maxX": -864,
          "maxY": -160,
          "minX": -1248,
          "minY": -320
        },
        {
          "contract": [
            "no authored enemy pressure",
            "welcome-kiosk readable",
            "Player Bark B opportunity",
            "no scanner"
          ],
          "id": "suspended-island-story-safe",
          "maxX": 128,
          "maxY": -480,
          "minX": -384,
          "minY": -680
        }
      ],
      "scanner": {
        "active": false,
        "activeCycleForbidden": true,
        "foreshadowOnly": true,
        "scannerGroups": []
      },
      "schemaVersion": "area-spec-v1",
      "stage": {
        "canonicalName": "LOWER MARKET PROMENADE",
        "role": "SECTOR 03 OPENING / SCALE REVEAL / POWERED DAILY-LIFE CONTRAST",
        "runtimeCurrentName": "POWERED PROMENADE",
        "sector": 3,
        "sourceAreaId": "sector-03-01",
        "stage": 1,
        "subtitle": "COMMERCIAL THRESHOLD"
      },
      "status": "DESIGN LOCKED",
      "story": {
        "entryBark": {
          "status": "NOT IMPLEMENTED — PLAYER BARK LAYER",
          "text": "…여긴 아직 불이 들어와 있어.",
          "triggerIntent": "after first powered safe terrace is physically read"
        },
        "question": "왜 여긴 아직 이렇게 켜져 있지?",
        "recognitionBark": {
          "status": "NOT IMPLEMENTED — PLAYER BARK LAYER",
          "text": "사람은 없는데… 기계들만 계속 일하고 있네.",
          "triggerIntent": "after WELCOME / PUBLIC SERVICE ONLINE"
        },
        "systemPresentations": [
          {
            "detail": "PROMENADE 06",
            "stableObjectId": "sector-03-01:district-sign",
            "status": "VERIFIED",
            "title": "COMMERCIAL DISTRICT"
          },
          {
            "detail": "PUBLIC SERVICE ONLINE",
            "stableObjectId": "sector-03-01:welcome-kiosk",
            "status": "VERIFIED",
            "title": "WELCOME"
          }
        ]
      },
      "surfaces": [
        {
          "height": 32,
          "id": "p0",
          "kind": "platform",
          "width": 224,
          "x": -1392,
          "y": 0
        },
        {
          "height": 26,
          "id": "p1-left-market",
          "kind": "safe-deck",
          "width": 384,
          "x": -1056,
          "y": -224
        },
        {
          "height": 18,
          "id": "recovery-a",
          "kind": "recovery",
          "width": 256,
          "x": -576,
          "y": -176
        },
        {
          "height": 30,
          "id": "p2-suspended-market-island",
          "kind": "safe-deck",
          "width": 512,
          "x": -128,
          "y": -544
        },
        {
          "height": 18,
          "id": "recovery-b",
          "kind": "recovery",
          "width": 256,
          "x": 384,
          "y": -304
        },
        {
          "height": 26,
          "id": "p3-right-market",
          "kind": "platform",
          "width": 384,
          "x": 896,
          "y": -416
        },
        {
          "height": 28,
          "id": "exit-deck",
          "kind": "safe-deck",
          "width": 320,
          "x": 1312,
          "y": -800
        }
      ],
      "uniqueness": {
        "comparisons": {
          "1-5": {
            "overlapCount": 0,
            "verdict": "PASS"
          },
          "1-6": {
            "overlap": [
              "large open space"
            ],
            "overlapCount": 1,
            "verdict": "PASS"
          },
          "1-7": {
            "overlapCount": 0,
            "verdict": "PASS"
          },
          "2-2": {
            "overlapCount": 0,
            "verdict": "PASS"
          },
          "2-6": {
            "overlapCount": 0,
            "verdict": "PASS"
          },
          "2-8": {
            "overlap": [
              "large central landmark / elevation change"
            ],
            "overlapCount": 1,
            "verdict": "PASS"
          },
          "planned-3-3": {
            "note": "3-3 orbits a void; 3-1 crosses through one",
            "overlapCount": 0,
            "verdict": "PASS"
          }
        },
        "dominantBody": "LOW LEFT → LONG UP-RIGHT → HIGH CENTRAL ISLAND → LONG DOWN-RIGHT → SHORT SERVICE LIFT",
        "maximumMeaningfulOverlap": 1,
        "signature": "PANORAMIC MARKET VOID / SUSPENDED MARKET ISLAND ARCH"
      },
      "wind": {
        "active": false
      }
    },
    "status": "scenario-only"
  },
  "schemaVersion": "area-spec-v2",
  "stage": {
    "legacyStageAlias": "3-1",
    "sector": 3,
    "sourceAreaId": "sector-03-01",
    "stage": 1
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
