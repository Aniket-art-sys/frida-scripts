// index.ts — Cleaned Il2Cpp hook system
import "frida-il2cpp-bridge";

declare const Memory: any;
declare const NativePointer: any;

const START_DELAY_MS = 800;

// ========= RETURN OVERRIDES =========
const returnValues: Record<string, any> = {
    "IsBehindWall": false,
    "IsFireRatePaused": false,
    "IsKilledIn10Seconds": true,
    "GetBotRespawnDelay": 0,
    "get_IsOffline": true,
    "get_AmmoReloadTimeout": 0.001,
    "GetLerpFactor": 0,
    "GetBulletsToShootCount": 1,
    "IsAllyFor": false,
    "get_Cooldown": 0,
    "NeedBanPopup": false
};

// ========= VOID NO-OP METHODS =========
const voidMethods: string[] = [
    "ActorEnemyStealth.Activate",
    "BotBrainComponent.DoOnUpdate"
];

// ========= ARG OVERRIDES =========
const argOverrides: Record<string, (args: any[], isStatic: boolean) => any[]> = {
    "SharedDamageManager.Heal": (args, isStatic) => {
        if (isStatic) {
            args[1] = 999999; // Amount
            args[2] = true;   // ApplyHpChange
        } else {
            args[1] = 999999;
        }
        return args;
    }
};

// ========= READ-ONLY / LOGIC HOOKS =========
const readOnlyMethods: string[] = [
    "get_MoveState",
    "get_PowerMultiplier",
    "UserSkillEstimationFormatter.Serialize",
    "GetWeaponEquipmentSetupById",
    "PlayerSetupMatchmaking.ShallowCopy",
    "get_MaxWaitTime",
    "ExecuteOrEnqueue",
    "StartMatchSearchCmd..ctor",
    "get_TurnSpeedMultiplier",
    "add_AnticheatActivated",
    "remove_AnticheatActivated",
    "NotifyAnticheatActivated",
    "get_DamageManager",
    "set_DamageManager",
    "#SetHangarPresets",
    "BattleMessageInputQueue.Dequeue",
    "BattleMessageManager.Enqueue",
    "get_PlayerActorId",
    "#GetEquipmentDamage"
];

const targetMethods = new Set([
    ...Object.keys(returnValues),
    ...voidMethods,
    ...Object.keys(argOverrides),
    ...readOnlyMethods
]);

// ========= SAFE HELPERS =========
function safe<T>(fn: () => T): { ok: true; value: T } | { ok: false; error: any } {
    try { return { ok: true, value: fn() }; }
    catch (error) { return { ok: false, error }; }
}

function safeMethodName(method: Il2Cpp.Method): string | null {
    const r = safe(() => method.name);
    return r.ok ? r.value : null;
}

// ========= GLOBAL STATE =========
let playerId: number | null = null;
let actorids: number[] = [];

// ========= MAIN HOOKER =========
function installHooks() {
    Il2Cpp.perform(() => {
        console.log("[safe-hook] Starting enumeration");

        const asmList = safe(() => Il2Cpp.domain.assemblies);
        if (!asmList.ok) return;

        for (const asm of asmList.value) {
            const asmName = safe(() => asm.name).ok ? asm.name : "<unknown>";
            const classesSafe = safe(() => asm.image.classes);
            if (!classesSafe.ok) continue;

            for (const cls of classesSafe.value) {
                const clsName = safe(() => cls.name).ok ? cls.name : "<unknown>";
                const methodsSafe = safe(() => cls.methods);
                if (!methodsSafe.ok || !Array.isArray(methodsSafe.value)) continue;

                for (const method of methodsSafe.value) {
                    const mName = safeMethodName(method);
                    if (!mName) continue;

                    const key = `${clsName}.${mName}`;

                    if (!targetMethods.has(mName) && !targetMethods.has(key)) continue;

                    const handleValid = safe(() => method.handle);
                    if (!handleValid.ok || !handleValid.value) continue;

                    try {
                        // ========= VOID HOOK =========
                        if (voidMethods.includes(mName) || voidMethods.includes(key)) {
                            method.implementation = function (...args: any[]) { return; };
                            continue;
                        }

                        // ========= ARG OVERRIDE =========
                        if (key in argOverrides || mName in argOverrides) {
                            const modifyArgs = argOverrides[key] || argOverrides[mName];
                            method.implementation = function (...args: any[]) {
                                const inst = this as Il2Cpp.Object;
                                const isStatic = method.isStatic;
                                const newArgs = modifyArgs([...args], isStatic);
                                try {
                                    if (isStatic) {
                                        return method.invoke(...newArgs);
                                    } else {
                                        return inst.method(mName).invoke(...newArgs);
                                    }
                                } catch (e) {
                                    return undefined;
                                }
                            };
                            continue;
                        }

                        // ========= CUSTOM LOGIC HOOKS =========
                        if (readOnlyMethods.includes(mName) || readOnlyMethods.includes(key)) {
                            method.implementation = function (...args: any[]) {
                                const inst = this as Il2Cpp.Object;
                                try {
                                    // 1. Force OpenHangar arg
                                    if (mName === "OpenHangar") { 
                                        args[0] = false; 
                                    }

                                    // 2. Reset actors on Match Search
                                    if (mName === "ExecuteOrEnqueue") {
                                        const Bm = new Il2Cpp.Object(args[0]);
                                        if (Bm.class.name === "StartMatchSearchCmd") {
                                            actorids = [];
                                            console.log("Match search started, cleared actor IDs");
                                        }
                                    }

                                    // 3. BattleMessageManager.Enqueue Logic (Damage Injection)
                                    if (mName === "Enqueue") {
                                        const BattleMessage = new Il2Cpp.Object(args[1]);
                                        
                                        if (BattleMessage.class.name === "BattleMessageDamage") {
                                            processHits(BattleMessage, "DirectWeaponHits");
                                        }
                                    }

                                    // 4. Track Actors via Dequeue (Input Queue)
                                    if (mName === "dequeue") {
                                        const BattleMessage = new Il2Cpp.Object(args[1]);
                                        if (BattleMessage.class.name === "BattleMessageActorSpawn") {
                                            const actorid = BattleMessage.field("ActorId").value;
                                            actorids.push(actorid as number);
                                        }
                                    }

                                    // EXECUTE ORIGINAL
                                    let ret;
                                    if (method.isStatic) {
                                        ret = method.invoke(...args);
                                    } else {
                                        // Handle specific overload for Enqueue if necessary
                                        if (mName === "Enqueue" && !/^\d+$/.test((args[0] as string))) {
                                            inst.method("Enqueue")
                                                .overload(
                                                    "Legion.Shared.Battles.States.BattleUserState",
                                                    "Legion.Shared.Battles.BattleMessages.BattleMessage",
                                                    "System.Boolean"
                                                )
                                                .invoke(...args);
                                        } else {
                                            ret = inst.method(mName, args.length).invoke(...args);
                                        }
                                    }

                                    // 5. Track Actors via Return Value (Output Queue)
                                    if (mName === "Dequeue") {
                                        const BattleMessage = new Il2Cpp.Object(ret as any);
                                        const msgClass = BattleMessage.class.name;

                                        if (msgClass === "BattleMessageActorSpawned") {
                                            const actorid = BattleMessage.field("ActorId").value;
                                            actorids.push(actorid as number);
                                            actorids = [...new Set(actorids)];
                                        }
                                        if (msgClass === "BattleMessageActorDeath") {
                                            const actorid = BattleMessage.field("ActorId").value;
                                            const index = actorids.indexOf(actorid as number);
                                            if (index !== -1) {
                                                actorids.splice(index, 1);
                                            }
                                        }
                                    }

                                    // 6. Capture Player ID
                                    if (mName === "get_PlayerActorId") {
                                        if (playerId === null && /\d/.test((ret as any as string))) {
                                            playerId = ret as number;
                                            console.log(`Player ID set: ${playerId}`);
                                        }
                                    }

                                    return ret;
                                } catch (e) {
                                    return undefined;
                                }
                            };
                            continue;
                        }

                        // ========= RETURN OVERRIDE =========
                        if (mName in returnValues || key in returnValues) {
                            const retValue = returnValues[key] || returnValues[mName];
                            method.implementation = function (...args: any[]) {
                                return retValue;
                            };
                            continue;
                        }

                    } catch (e) {
                        console.log(`[safe-hook] Failed to hook ${clsName}.${mName}`);
                    }
                }
            }
        }
        console.log("[safe-hook] Enumeration complete.");
    });
}

function processHits(obj_: Il2Cpp.Object, fieldName: string) {
    try {
        const hitsList = obj_.field(fieldName).value as Il2Cpp.Object;
        const count = hitsList.method("get_Count").invoke() as number;

        if (count === 0) return;

        // Template copy strategy
        const template = hitsList.method("get_Item").invoke(0) as Il2Cpp.Object;
        const itemClass = template.class;

        for (const id of actorids) {
            // Prevent self-damage
            if (Number(playerId) !== Number(id)) {
                const newHit = itemClass.alloc();
                const ctor = newHit.method(".ctor", 0);
                if (ctor) ctor.invoke();

                // Clone data
                newHit.field("CauserIdToPartsHitsCount").value = template.field("CauserIdToPartsHitsCount").value;
                newHit.field("VictimId").value = parseInt(id as any as string);

                // Add to list
                hitsList.method("Add").invoke(newHit);
            }
        }
    } catch (e) {
        console.log(`[processHits] Error: ${e}`);
    }
}

setTimeout(() => installHooks(), START_DELAY_MS);
