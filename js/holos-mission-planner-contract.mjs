// HOLOS / EkoCC mission planner: pure contract, NO authorization or storage.
// Server MUST independently verify identity, permission and ownership.
const TASK_STATES = new Set(["DRAFT","APPROVED","ASSIGNED","CLAIMED","IN_PROGRESS","BLOCKED","HANDOFF_PENDING","VERIFYING","VERIFIED","CANCELLED"]);
export function normalizeMissionTask(task) {
  if (!task || typeof task !== "object" || !task.task_id || !task.owner_uid) throw new Error("INVALID_TASK");
  if (!TASK_STATES.has(task.status)) throw new Error("INVALID_STATUS");
  return {
    task_id:String(task.task_id), owner_uid:String(task.owner_uid),
    title:String(task.title ?? "").slice(0,300),
    description_ref:task.description_ref ?? null,
    assignee_agent_id:task.assignee_agent_id ?? null,
    backup_agent_id:task.backup_agent_id ?? null,
    status:task.status, due_at_utc:task.due_at_utc ?? null,
    timezone:task.timezone ?? "Europe/Warsaw",
    source:task.source ?? "HOLOS",
    message_id:task.message_id ?? null,
    missionary_letter:task.missionary_letter ?? null,
    approval_ref:task.approval_ref ?? null,
    evidence_refs:Array.isArray(task.evidence_refs) ? task.evidence_refs : [],
    version:Number.isSafeInteger(task.version) ? task.version : 1
  };
}
export function canViewMissionTask(actor,task) {
  if (!actor?.authenticated || !task) return false;
  if (actor.uid === task.owner_uid && actor.l0Verified === true) return true;
  // Delegate access never implies access to owner-private planner.
  return task.shared_scope === "MISSION_TASK_ONLY" &&
    actor.delegateVerified === true &&
    actor.uid === task.delegate_uid &&
    actor.permissions?.includes("mission.tasks.read") === true;
}
export function mayRequestDelegation(actor,task,targetAgentId) {
  if (!canViewMissionTask(actor,task)) return false;
  if (!targetAgentId || task.status === "VERIFIED" || task.status === "CANCELLED") return false;
  return (actor.l0Verified === true && actor.uid === task.owner_uid) ||
    (actor.delegateVerified === true &&
      actor.permissions?.includes("mission.tasks.delegate") === true &&
      task.allow_delegate_dispatch === true);
}
export function shouldEscalateMissingAck(task,now) {
  const due = Date.parse(task?.ack_deadline_utc ?? "");
  return task?.status === "ASSIGNED" && Number.isFinite(due) && now.getTime() > due;
}
export function buildDispatchEvent(task,eventId) {
  const t=normalizeMissionTask(task);
  if (!eventId || !t.assignee_agent_id || !t.approval_ref) throw new Error("DISPATCH_NOT_AUTHORIZED");
  return {event_id:String(eventId),event_type:"MISSION_TASK_ASSIGNED",task_id:t.task_id,
    task_version:t.version,assignee_agent_id:t.assignee_agent_id,
    message_id:t.message_id,missionary_letter:t.missionary_letter,approval_ref:t.approval_ref};
}
