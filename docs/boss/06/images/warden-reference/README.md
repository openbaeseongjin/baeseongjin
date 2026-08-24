# Boss06 Warden Image Reference

Status: `REFERENCE-ONLY / NOT A RUNTIME ASSET PACKAGE`

This folder preserves the user-provided Warden visual references and their source specifications. It is not a sprite atlas, a runtime manifest, or a source of gameplay authority. Do not wire these files into the renderer, collision, damage, AI, or networking; current Boss06 Runtime truth remains in the canonical Boss06 documents and code.

The source specifications are retained as reference material. Their embedded implementation instructions do not authorize a Runtime change. Asset licensing and production-export provenance are unverified.

Original filenames are intentionally preserved. Both Thruster Dash V3 and V4 are retained; this import makes no selection between them.

PNG files are byte-identical to the supplied sources. The Markdown specifications were normalized only by removing trailing whitespace to satisfy the repository's `git diff --check` rule; the SHA-256 values below remain hashes of the supplied source artifacts. Verification compares PNGs directly and Markdown after that normalization.

## PNG references

| Original file | Dimensions | SHA-256 |
| --- | --- | --- |
| [2bd43b91-69e5-4962-995c-919431c9290f.png](./images/2bd43b91-69e5-4962-995c-919431c9290f.png) | 1402×1122 | `595060fe52e40e0c8c4bbea1d885bfe1670b3b03ada1c80491868569d53f2e12` |
| [15b7dc49-3633-4e09-88f4-e6b0b7abf38e.png](./images/15b7dc49-3633-4e09-88f4-e6b0b7abf38e.png) | 1536×1024 | `c911fcfb32590a8718601201846d5de9ce21d01a7ba825fbbeea4a87dd322271` |
| [598c7961-6b5d-44f3-8d34-2f33ebc52845.png](./images/598c7961-6b5d-44f3-8d34-2f33ebc52845.png) | 1536×1024 | `592a263e73664cad87dced94a3fd561f10c4bd49a7ff4d8b3fedfbff7b0d0856` |
| [1784f50f-77bd-4455-b9ff-34931005455b.png](./images/1784f50f-77bd-4455-b9ff-34931005455b.png) | 1536×1024 | `47bc16f15163014c4c591a0a1c1a7f4a3e50695d15925c9bbb2695c4b98180c2` |
| [ac5e8ddb-8bdd-4a3c-b68c-b5c339e8b6be.png](./images/ac5e8ddb-8bdd-4a3c-b68c-b5c339e8b6be.png) | 1536×1024 | `67f91054734d572c2a06f9064c7565b81550d321d9cbb080910b52c1ea6e1841` |
| [0dd35406-af5e-40e8-a234-1cc773be483e.png](./images/0dd35406-af5e-40e8-a234-1cc773be483e.png) | 1536×1024 | `747c4f750ef43f723571943bd9ac27955ce3aea9ac75eae4ecab6987993802e7` |
| [8eb1b76a-1d5e-49b6-87a7-26e6b2cf95f7.png](./images/8eb1b76a-1d5e-49b6-87a7-26e6b2cf95f7.png) | 1536×1024 | `ad84c85543b60755e2822a6f17bf9a09a65666295a57885629690ab53b641a04` |
| [60b1fc2f-408d-44a1-92e8-bca20275b15a.png](./images/60b1fc2f-408d-44a1-92e8-bca20275b15a.png) | 1536×1024 | `cd2e4fd9a4b8aaa747f4b70a91e712c641177994989f206ff0090acfcea7845c` |
| [705a577f-2842-49bb-97a4-807136ca4ae7.png](./images/705a577f-2842-49bb-97a4-807136ca4ae7.png) | 1448×1086 | `dd4bc8f4a2a251d6d294d4a77d382438a0da4901a726b92cb8f5d7ce4c30060f` |
| [bd06d32d-5e92-42cb-bc57-2903de72388a.png](./images/bd06d32d-5e92-42cb-bc57-2903de72388a.png) | 1536×1024 | `3e155ff62fe712c42236d88b928be63272c45061568c86ef13c5c057d30a3a94` |

## Source specifications

| Original file | SHA-256 |
| --- | --- |
| [BOSS06_WARDEN_BATON_TELEGRAPH_SPEC.md](./specs/BOSS06_WARDEN_BATON_TELEGRAPH_SPEC.md) | `ecfd47b3c998965d1f28b8bf481c4d5186fe59afbd394f210d1859b8e92c05a0` |
| [BOSS06_WARDEN_BODY_BASE_SPEC.md](./specs/BOSS06_WARDEN_BODY_BASE_SPEC.md) | `a37169fde516667f301562422dcad20f8bd2e62d8bcde94c3bef5c1a42a206ba` |
| [BOSS06_WARDEN_CHARGE_ACTIVE_SPEC_V2.md](./specs/BOSS06_WARDEN_CHARGE_ACTIVE_SPEC_V2.md) | `2d1dd5d42e9f3b92d9ae1dc2560f0e67f4fa28c7bd2335b705e2eec1bd428f31` |
| [BOSS06_WARDEN_OVERHEAD_SLAM_SPEC.md](./specs/BOSS06_WARDEN_OVERHEAD_SLAM_SPEC.md) | `650e103388ae16af1ad5755d8c9f9efdcbbfceb9423a73bf891f0444301d5300` |
| [BOSS06_WARDEN_SHIELD_COUNTER_READY_SPEC.md](./specs/BOSS06_WARDEN_SHIELD_COUNTER_READY_SPEC.md) | `57b6af32709132419377ea1fe32119cc600944bd0dc0a35c876e5c8b553d0440` |
| [BOSS06_WARDEN_SHIELD_GUARD_SPEC.md](./specs/BOSS06_WARDEN_SHIELD_GUARD_SPEC.md) | `9dcb02b71799e053d8231d3b7ef540737efefbcacfe50c2a89843ac35c769793` |
| [BOSS06_WARDEN_THRUSTER_DASH_ACTIVE_SPEC_V3.md](./specs/BOSS06_WARDEN_THRUSTER_DASH_ACTIVE_SPEC_V3.md) | `223e4ffcc4f67d12ebb7325530d1c5c6fadad0b03c8ae842c5d669f36bf3ab12` |
| [BOSS06_WARDEN_THRUSTER_DASH_ACTIVE_SPEC_V4.md](./specs/BOSS06_WARDEN_THRUSTER_DASH_ACTIVE_SPEC_V4.md) | `2f84654caf5878a508aad012d5fc29cbb820b7134f336662d28b0182c6965192` |
