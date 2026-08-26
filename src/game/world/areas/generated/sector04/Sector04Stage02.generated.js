// GENERATED FILE - DO NOT EDIT
// Source: 4-2 AREA-SPEC.v2.json
import { createAreaDefinitionFromV2 } from "../../../area-authoring-v2/AreaSpecV2.js";

export const GENERATED_STAGE_ID = "4-2";
export const GENERATED_AREA_ID = "sector-04-02";
// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const SPEC = {
  "anchors": [
    {
      "landmark": {
        "id": "A1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A1",
          "sourceId": "A1"
        },
        "x": -1696,
        "y": -384
      },
      "target": {
        "id": "A1-surface",
        "properties": {
          "sourceId": "A1"
        },
        "x": -1696,
        "y": -384
      }
    },
    {
      "landmark": {
        "id": "C1",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C1",
          "sourceId": "C1"
        },
        "x": -1120,
        "y": -640
      },
      "target": {
        "id": "C1-surface",
        "properties": {
          "sourceId": "C1"
        },
        "x": -1120,
        "y": -640
      }
    },
    {
      "landmark": {
        "id": "C2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C2",
          "sourceId": "C2"
        },
        "x": -800,
        "y": -736
      },
      "target": {
        "id": "C2-surface",
        "properties": {
          "sourceId": "C2"
        },
        "x": -800,
        "y": -736
      }
    },
    {
      "landmark": {
        "id": "C3",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C3",
          "sourceId": "C3"
        },
        "x": -448,
        "y": -800
      },
      "target": {
        "id": "C3-surface",
        "properties": {
          "sourceId": "C3"
        },
        "x": -448,
        "y": -800
      }
    },
    {
      "landmark": {
        "id": "C4",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C4",
          "sourceId": "C4"
        },
        "x": -96,
        "y": -736
      },
      "target": {
        "id": "C4-surface",
        "properties": {
          "sourceId": "C4"
        },
        "x": -96,
        "y": -736
      }
    },
    {
      "landmark": {
        "id": "C5",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C5",
          "sourceId": "C5"
        },
        "x": 256,
        "y": -640
      },
      "target": {
        "id": "C5-surface",
        "properties": {
          "sourceId": "C5"
        },
        "x": 256,
        "y": -640
      }
    },
    {
      "landmark": {
        "id": "C6",
        "properties": {
          "coordinateAnchor": "center",
          "label": "C6",
          "sourceId": "C6"
        },
        "x": 576,
        "y": -512
      },
      "target": {
        "id": "C6-surface",
        "properties": {
          "sourceId": "C6"
        },
        "x": 576,
        "y": -512
      }
    },
    {
      "landmark": {
        "id": "CUT2",
        "properties": {
          "coordinateAnchor": "center",
          "label": "CUT2",
          "sourceId": "CUT2"
        },
        "x": 896,
        "y": -1248
      },
      "target": {
        "id": "CUT2-surface",
        "properties": {
          "sourceId": "CUT2"
        },
        "x": 896,
        "y": -1248
      }
    },
    {
      "landmark": {
        "id": "A7",
        "properties": {
          "coordinateAnchor": "center",
          "label": "A7",
          "sourceId": "A7"
        },
        "x": 1728,
        "y": -1696
      },
      "target": {
        "id": "A7-surface",
        "properties": {
          "sourceId": "A7"
        },
        "x": 1728,
        "y": -1696
      }
    },
    {
      "landmark": {
        "id": "V0",
        "properties": {
          "coordinateAnchor": "center",
          "label": "V0",
          "sourceId": "V0"
        },
        "x": 1184,
        "y": -1408
      },
      "target": {
        "id": "V0-surface",
        "properties": {
          "sourceId": "V0"
        },
        "x": 1184,
        "y": -1408
      }
    },
    {
      "landmark": {
        "id": "OVR",
        "properties": {
          "coordinateAnchor": "center",
          "label": "OVR",
          "sourceId": "OVR"
        },
        "x": 1456,
        "y": -1504
      },
      "target": {
        "id": "OVR-surface",
        "properties": {
          "sourceId": "OVR"
        },
        "x": 1456,
        "y": -1504
      }
    }
  ],
  "authoringMode": "runtime",
  "behaviorRefs": [],
  "definition": {
    "bounds": {
      "height": 2112,
      "width": 4480
    },
    "cameraZones": [
      {
        "desktopZoom": 0.88,
        "id": "courtyard-overlook",
        "maxY": 0,
        "minY": -640,
        "mobileZoom": 0.66
      },
      {
        "desktopZoom": 0.84,
        "id": "courtyard-pursuit",
        "maxY": -640,
        "minY": -1088,
        "mobileZoom": 0.64
      },
      {
        "desktopZoom": 0.92,
        "id": "arcade-contact-break",
        "maxY": -1088,
        "minY": -1536,
        "mobileZoom": 0.68
      },
      {
        "desktopZoom": 0.96,
        "id": "override-vestibule",
        "maxY": -1536,
        "minY": -2112,
        "mobileZoom": 0.72
      }
    ],
    "checkpoints": [],
    "cueIds": [],
    "entry": {
      "id": "sector-04-02:entry",
      "x": -1984,
      "y": -288
    },
    "exit": {
      "id": "sector-04-02:exit",
      "x": 1984,
      "y": -1856
    },
    "gate": {
      "id": "sector-04-02:gate",
      "nextAreaId": "sector-04-03",
      "requiredObjectiveIds": [
        "sector-04-02:exit-panel-engaged"
      ],
      "trigger": {
        "height": 128,
        "width": 96,
        "x": 1936,
        "y": -1952
      }
    },
    "id": "sector-04-02",
    "name": "RESIDENT COURTYARD",
    "nextAreaId": "sector-04-03",
    "objectives": [
      {
        "accessModuleId": "sector-04:resident-security-override:a",
        "id": "sector-04-02:override-a-acquired",
        "sourceObjectId": "sector-04-02:override-a-panel",
        "type": "interact"
      },
      {
        "id": "sector-04-02:exit-panel-engaged",
        "sourceObjectId": "sector-04-02:exit-panel",
        "type": "interact"
      }
    ],
    "objects": [
      {
        "activation": {
          "height": 580,
          "width": 2000,
          "x": -1280,
          "y": -940
        },
        "coordinateAnchor": "center",
        "enemyType": "pursuit-drone-t1",
        "id": "sector-04-02:resident-courtyard-pursuit",
        "kind": "patrol-drone",
        "position": {
          "x": -960,
          "y": -560
        }
      },
      {
        "coordinateAnchor": "center",
        "id": "sector-04-02:override-a-panel",
        "interactionRadius": 72,
        "kind": "terminal",
        "objectiveId": "sector-04-02:override-a-acquired",
        "position": {
          "x": 960,
          "y": -780
        },
        "presentationId": "world-object:terminal"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-04-02:gate",
        "id": "sector-04-02:exit-panel",
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
        "objectiveId": "sector-04-02:exit-panel-engaged",
        "position": {
          "x": 1872,
          "y": -1856
        },
        "presentationId": "world-object:gate-panel"
      },
      {
        "coordinateAnchor": "bottom-center",
        "gateId": "sector-04-02:gate",
        "id": "sector-04-02:exit-gate",
        "kind": "gate",
        "position": {
          "x": 1984,
          "y": -1856
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
            "patrol-drone-t1",
            "pursuit-drone-t1"
          ]
        },
        "id": "sector-04-02:route-guard-01",
        "kind": "sentry",
        "position": {
          "x": 752,
          "y": -784
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
        "id": "sector-04-02:route-guard-02",
        "kind": "sentry",
        "position": {
          "x": 1264,
          "y": -1488
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
            "patrol-drone-t1",
            "pursuit-drone-t1"
          ]
        },
        "id": "sector-04-02:route-guard-03",
        "kind": "sentry",
        "position": {
          "x": -16,
          "y": -816
        },
        "presentationId": "world-object:sentry",
        "rules": [
          "kill-optional",
          "no-rope-cut",
          "activation-band-only"
        ]
      }
    ],
    "order": 2,
    "recoveryPoints": [],
    "routePoints": [
      {
        "id": "sector-04-02:route-ENTRY",
        "sourceId": "ENTRY",
        "x": -1984,
        "y": -256
      },
      {
        "id": "sector-04-02:route-A1",
        "sourceId": "A1",
        "x": -1696,
        "y": -384
      },
      {
        "id": "sector-04-02:route-M0",
        "sourceId": "M0",
        "x": -1408,
        "y": -480
      },
      {
        "id": "sector-04-02:route-C1",
        "sourceId": "C1",
        "x": -1120,
        "y": -640
      },
      {
        "id": "sector-04-02:route-C2",
        "sourceId": "C2",
        "x": -800,
        "y": -736
      },
      {
        "id": "sector-04-02:route-C3",
        "sourceId": "C3",
        "x": -448,
        "y": -800
      },
      {
        "id": "sector-04-02:route-C4",
        "sourceId": "C4",
        "x": -96,
        "y": -736
      },
      {
        "id": "sector-04-02:route-C5",
        "sourceId": "C5",
        "x": 256,
        "y": -640
      },
      {
        "id": "sector-04-02:route-C6",
        "sourceId": "C6",
        "x": 576,
        "y": -512
      },
      {
        "id": "sector-04-02:route-CUT1",
        "sourceId": "CUT1",
        "x": 832,
        "y": -704
      },
      {
        "id": "sector-04-02:route-R1",
        "sourceId": "R1",
        "x": 640,
        "y": -992
      },
      {
        "id": "sector-04-02:route-CUT2",
        "sourceId": "CUT2",
        "x": 896,
        "y": -1248
      },
      {
        "id": "sector-04-02:route-V0",
        "sourceId": "V0",
        "x": 1184,
        "y": -1408
      },
      {
        "id": "sector-04-02:route-OVR",
        "sourceId": "OVR",
        "x": 1456,
        "y": -1504
      },
      {
        "id": "sector-04-02:route-A7",
        "sourceId": "A7",
        "x": 1728,
        "y": -1696
      },
      {
        "id": "sector-04-02:route-EXIT",
        "sourceId": "EXIT",
        "x": 1984,
        "y": -1856
      }
    ],
    "routes": [],
    "scannerGroups": [],
    "sectorId": "sector-04",
    "storyTriggers": [],
    "subtitle": "DOUBLE-CRESCENT COURTYARD / PURSUIT ARC → INTERIOR CUT-THROUGH → SAFE OVERRIDE VESTIBULE",
    "surfaces": [
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "entry-terrace",
        "kind": "safe-entry",
        "oneWay": true,
        "position": {
          "x": -1970,
          "y": -256
        },
        "sourceId": "entry-terrace",
        "vertices": [
          {
            "x": -2100,
            "y": -256
          },
          {
            "x": -1840,
            "y": -256
          },
          {
            "x": -1840,
            "y": -226
          },
          {
            "x": -2100,
            "y": -226
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "courtyard-safe-deck",
        "kind": "safe-courtyard",
        "oneWay": true,
        "position": {
          "x": -1408,
          "y": -480
        },
        "sourceId": "courtyard-safe-deck",
        "vertices": [
          {
            "x": -1530,
            "y": -480
          },
          {
            "x": -1286,
            "y": -480
          },
          {
            "x": -1286,
            "y": -450
          },
          {
            "x": -1530,
            "y": -450
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "interior-arcade-cut",
        "kind": "interior-arcade-deck",
        "oneWay": true,
        "position": {
          "x": 845,
          "y": -770
        },
        "sourceId": "interior-arcade-cut",
        "vertices": [
          {
            "x": 720,
            "y": -770
          },
          {
            "x": 970,
            "y": -770
          },
          {
            "x": 970,
            "y": -660
          },
          {
            "x": 720,
            "y": -660
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "arcade-recovery",
        "kind": "arcade-recovery",
        "oneWay": true,
        "position": {
          "x": 640,
          "y": -1020
        },
        "sourceId": "arcade-recovery",
        "vertices": [
          {
            "x": 520,
            "y": -1020
          },
          {
            "x": 760,
            "y": -1020
          },
          {
            "x": 760,
            "y": -950
          },
          {
            "x": 520,
            "y": -950
          }
        ]
      },
      {
        "coordinateAnchor": "top-center",
        "grappleable": true,
        "id": "exit-terrace",
        "kind": "safe-exit",
        "oneWay": true,
        "position": {
          "x": 1984,
          "y": -1856
        },
        "sourceId": "exit-terrace",
        "vertices": [
          {
            "x": 1855,
            "y": -1856
          },
          {
            "x": 2113,
            "y": -1856
          },
          {
            "x": 2113,
            "y": -1826
          },
          {
            "x": 1855,
            "y": -1826
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
  "scenario": {
    "boundsProvenance": "authored",
    "status": "runtime-generated"
  },
  "schemaVersion": "area-spec-v2",
  "stage": {
    "id": "4-2",
    "sector": 4,
    "sourceAreaId": "sector-04-02",
    "stage": 2
  }
};

export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);
