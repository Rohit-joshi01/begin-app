import { BadRequestError } from "../../shared/errors/index.js";
import type { StartupStage, StartupVisibility, OpenRoleType } from "../../shared/types/database.types.js";

/**
 * Validation rules and types for startup entities, team invitations, open roles, and milestones.
 */

export interface StartupPayload {
  name: string;
  pitch: string;
  stage: StartupStage;
  visibility: StartupVisibility;
  problem: string;
  solution: string;
  industryTags: any;
  links: any;
}

export interface OpenRolePayload {
  title: string;
  skillsNeeded: any;
  commitmentHours: number;
  roleType: OpenRoleType;
  equityOrCreditNote: string;
}

export interface MilestonePayload {
  title: string;
  milestoneType: string;
  description: string;
}

export function validateStartupPayload(body: any): StartupPayload {
  const { name, pitch, stage, visibility } = body || {};

  if (!name || !name.trim()) {
    throw new BadRequestError("Startup name is required.");
  }

  if (!pitch || !pitch.trim()) {
    throw new BadRequestError("One-line pitch is required.");
  }

  if (pitch.trim().length > 200) {
    throw new BadRequestError("One-line pitch must not exceed 200 characters.");
  }

  const validStages = ["Idea", "Building MVP", "Launched", "Has users"];
  const selectedStage = stage && validStages.includes(stage) ? (stage as StartupStage) : "Idea";

  const validVisibilities = ["PUBLIC", "STEALTH"];
  const selectedVisibility =
    visibility && validVisibilities.includes(visibility) ? (visibility as StartupVisibility) : "PUBLIC";

  return {
    name: name.trim(),
    pitch: pitch.trim(),
    stage: selectedStage,
    visibility: selectedVisibility,
    problem: (body.problem || "").trim(),
    solution: (body.solution || "").trim(),
    industryTags: body.industryTags,
    links: body.links,
  };
}

export function validateOpenRolePayload(body: any): OpenRolePayload {
  const { title } = body || {};
  if (!title || !title.trim()) {
    throw new BadRequestError("Role title is required.");
  }

  return {
    title: title.trim(),
    skillsNeeded: body.skillsNeeded,
    commitmentHours: Number(body.commitmentHours) || 0,
    roleType: (body.roleType as OpenRoleType) || "teammate",
    equityOrCreditNote: (body.equityOrCreditNote || "").trim(),
  };
}

export function validateMilestonePayload(body: any): MilestonePayload {
  const { title } = body || {};
  if (!title || !title.trim()) {
    throw new BadRequestError("Milestone title is required.");
  }

  return {
    title: title.trim(),
    milestoneType: body.milestoneType || "Custom update",
    description: (body.description || "").trim(),
  };
}
