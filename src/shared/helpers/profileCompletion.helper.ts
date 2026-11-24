/**
 * Breakdown of completion criteria across builder profile dimensions.
 */
export interface ProfileCompletionBreakdown {
  fullName?: boolean;
  college?: boolean;
  year?: boolean;
  branch?: boolean;
  bio?: boolean;
  skills?: boolean;
  interests?: boolean;
  lookingFor?: boolean;
  availability?: boolean;
  workOrStartup?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * Result returned by the calculateProfileCompletion algorithm.
 */
export interface ProfileCompletionResult {
  completionPercentage: number;
  isBuilder: boolean;
  breakdown: ProfileCompletionBreakdown;
}

/**
 * Computes profile completion percentage and determines eligibility for the Builder badge.
 * Evaluates ten weighted profile dimensions against functional requirements.
 */
export function calculateProfileCompletion(profile: any): ProfileCompletionResult {
  if (!profile) {
    return {
      completionPercentage: 0,
      isBuilder: false,
      breakdown: {},
    };
  }

  let score = 0;
  const breakdown: ProfileCompletionBreakdown = {};

  // 1. Full name (10 points)
  const hasName = Boolean(profile.fullName && profile.fullName.trim().length > 0);
  breakdown.fullName = hasName;
  if (hasName) score += 10;

  // 2. College (10 points)
  const hasCollege = Boolean(profile.college && profile.college.trim().length > 0);
  breakdown.college = hasCollege;
  if (hasCollege) score += 10;

  // 3. Academic year (10 points)
  const hasYear = Boolean(profile.year && profile.year.trim().length > 0);
  breakdown.year = hasYear;
  if (hasYear) score += 10;

  // 4. Academic branch / department (10 points)
  const hasBranch = Boolean(profile.branch && profile.branch.trim().length > 0);
  breakdown.branch = hasBranch;
  if (hasBranch) score += 10;

  // 5. Bio (10 points)
  const hasBio = Boolean(profile.bio && profile.bio.trim().length > 0);
  breakdown.bio = hasBio;
  if (hasBio) score += 10;

  // 6. Skills (10 points)
  const skillsCount = (profile.skills?.length || 0) + (profile.joinerDetails?.skills?.length || 0);
  const hasSkills = skillsCount > 0;
  breakdown.skills = hasSkills;
  if (hasSkills) score += 10;

  // 7. Interests (10 points)
  const hasInterests = Boolean(profile.interests && profile.interests.length > 0);
  breakdown.interests = hasInterests;
  if (hasInterests) score += 10;

  // 8. Looking-for tags (10 points)
  const hasLookingFor = Boolean(profile.lookingFor && profile.lookingFor.length > 0);
  breakdown.lookingFor = hasLookingFor;
  if (hasLookingFor) score += 10;

  // 9. Availability and weekly hours (10 points)
  const hasAvailability = Boolean(
    profile.availabilityStatus && Number(profile.weeklyHoursAvailable) > 0
  );
  breakdown.availability = hasAvailability;
  if (hasAvailability) score += 10;

  // 10. Past work or linked startup (10 points)
  const hasStartup = Boolean(
    profile.founderDetails?.startupName || (profile.linkedStartups && profile.linkedStartups.length > 0)
  );
  const hasPastWork = Boolean(
    (profile.pastWork && profile.pastWork.length > 0) ||
    profile.socialLinks?.github ||
    profile.socialLinks?.linkedin ||
    profile.socialLinks?.portfolio
  );
  const hasWorkOrStartup = hasStartup || hasPastWork;
  breakdown.workOrStartup = hasWorkOrStartup;
  if (hasWorkOrStartup) score += 10;

  const completionPercentage = Math.min(100, Math.max(0, score));

  // Requirement: Builder badge awarded when profile is at least 80% complete
  // and user has a startup page/record or a joiner skill set.
  const hasJoinerSkillSet = hasSkills;
  const isBuilder = completionPercentage >= 80 && (hasStartup || hasJoinerSkillSet);

  return {
    completionPercentage,
    isBuilder,
    breakdown,
  };
}
