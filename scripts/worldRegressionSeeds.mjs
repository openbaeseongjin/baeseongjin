export const WORLD_REGRESSION_SEEDS = Object.freeze([
    Object.freeze({ seed: 1, reason: "최소 양의 시드 경계" }),
    Object.freeze({ seed: 42, reason: "짧은 재현용 기준 시드" }),
    Object.freeze({ seed: 123456789, reason: "일반 분포 기준 시드" }),
    Object.freeze({ seed: 20260810, reason: "현재 프로토타입 기본 시드" }),
    Object.freeze({ seed: 0xffffffff, reason: "32비트 부호 없는 최대 시드 경계" })
]);
