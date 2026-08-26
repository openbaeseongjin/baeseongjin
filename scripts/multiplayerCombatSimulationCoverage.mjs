export const MULTIPLAYER_COMBAT_SIMULATION_ID = Object.freeze({
    IN_PROCESS_COMBAT_RULES: "in-process-combat-rules",
    WIRE_SESSION_LIFECYCLE: "wire-session-lifecycle",
    WIRE_OWNER_MOTION_NEUTRAL_WORLD: "wire-owner-motion-neutral-world",
    WIRE_ENERGY_ORB_PLAYER_HIT: "wire-energy-orb-player-hit",
    WIRE_METEOR_IGNITED_PRESENTATION: "wire-meteor-ignited-presentation",
    WIRE_DEATH_RESPAWN: "wire-death-respawn",
    WIRE_BOSS03_GRAB_SLAM: "wire-boss03-grab-slam"
});

export const MULTIPLAYER_COMBAT_SIMULATION_COVERAGE = Object.freeze({
    [MULTIPLAYER_COMBAT_SIMULATION_ID.IN_PROCESS_COMBAT_RULES]: Object.freeze({
        runner: "scripts/simulateTwoPlayerCombat.mjs",
        boundary: "in-process",
        verifies: Object.freeze([
            "직접·범위 Spell 피해",
            "피해자 claim 결과와 중복 억제",
            "Ignited·Frozen runtime 상태",
            "막타 경험치·보상 선택·replica 수렴"
        ])
    }),
    [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_ENERGY_ORB_PLAYER_HIT]: Object.freeze({
        runner: "scripts/simulateTwoPlayerCombatWire.mjs",
        boundary: "production-wire",
        verifies: Object.freeze([
            "별도 multiplayer-server.mjs 프로세스",
            "RemoteGameAuthority WebSocket 클라이언트 2개",
            "live Energy Orb owner-motion·WorldSnapshot 직렬화",
            "cast·impact particle",
            "피해자 선판정·claim 승인·HP 수렴·피격 후 서버 health"
        ])
    }),
    [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_METEOR_IGNITED_PRESENTATION]: Object.freeze({
        runner: "scripts/simulateTwoPlayerCombatWire.mjs",
        boundary: "production-wire-with-controlled-loadout",
        verifies: Object.freeze([
            "Meteor live projectile 직렬화",
            "Meteor cast·impact particle",
            "피해자 선판정과 impact claim 승인",
            "로컬·공유 Ignited 상태 수렴",
            "Ignited status particle 방출과 피격 후 서버 health"
        ])
    }),
    [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_SESSION_LIFECYCLE]: Object.freeze({
        runner: "scripts/simulateTwoPlayerCombatWire.mjs",
        boundary: "production-wire",
        verifies: Object.freeze(["2인 참가", "한 명 퇴장 뒤 1인 world 유지", "마지막 퇴장 뒤 빈 방 삭제"])
    }),
    [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_OWNER_MOTION_NEUTRAL_WORLD]: Object.freeze({
        runner: "scripts/simulateTwoPlayerCombatWire.mjs",
        boundary: "production-wire",
        verifies: Object.freeze([
            "일반 수평 이동의 owner-motion 전송",
            "서버·동료 위치 수렴",
            "동료는 자기 owner 위치로 독립 수렴",
            "같은 authority snapshot의 Enemy 상태 일치"
        ])
    }),
    [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_DEATH_RESPAWN]: Object.freeze({
        runner: "scripts/simulateTwoPlayerCombatWire.mjs",
        boundary: "production-wire-with-controlled-health",
        verifies: Object.freeze([
            "lethal Energy Orb 피해자 선판정",
            "피해 Player 개별 checkpoint 부활",
            "동료 HP·위치 유지",
            "서버·동료 부활 상태 수렴과 사건 뒤 서버 health"
        ])
    }),
    [MULTIPLAYER_COMBAT_SIMULATION_ID.WIRE_BOSS03_GRAB_SLAM]: Object.freeze({
        runner: "scripts/simulateTwoPlayerCombatWire.mjs",
        boundary: "production-wire-with-controlled-boss03",
        verifies: Object.freeze([
            "Boss03 hook tip 비행 WorldSnapshot v21 직렬화",
            "피해자 로컬 눈높이 pull과 Grab Hammer 하강",
            "첫 지형 상면 충돌 반동과 플랫폼 피해 중복 억제",
            "서버·동료 owner-motion 반동 속도 수렴",
            "사건 뒤 서버 health"
        ])
    })
});

export const MULTIPLAYER_COMBAT_SIMULATION_NOT_COVERED = Object.freeze({
    BROWSER_GAME_LOOP: "MultiplayerGameApp 입력·Canvas draw·오디오 표현",
    PHYSICAL_DEVICES: "실제 기기 2대와 모바일 조작",
    NETWORK_CONDITIONS: "일반 이동·전투 외 지연·패킷 손실·재접속·장시간 세션",
    ROPE_TRAVERSAL: "Rope 조준·부착·스윙·해제의 실제 wire 수렴",
    OTHER_PRESENTATION_FAMILIES: "Rope·Enemy·Boss·Wind와 Ignited 외 status의 wire 표현"
});

export function multiplayerCombatSimulationCoverageSnapshot() {
    return Object.freeze({
        tests: MULTIPLAYER_COMBAT_SIMULATION_COVERAGE,
        notCovered: MULTIPLAYER_COMBAT_SIMULATION_NOT_COVERED
    });
}
