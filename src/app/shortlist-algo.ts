import { Candidate } from './models';

export interface ShortlistOptions {
  mustHaveSkills?: string[];
  targetCount?: number;
}

export function scoreCandidate(
  c: Candidate,
  opts: ShortlistOptions = {}
): number {
  let score = 0;

  // Experience
  const expPoints = (c.years_experience || 0) * 5;
  score += expPoints;

  // Skill matches
  let skillMatchPoints = 0;
  let matchedSkills: string[] = [];
  if (opts.mustHaveSkills && opts.mustHaveSkills.length) {
    matchedSkills = opts.mustHaveSkills.filter(s =>
      c.skills?.map(x => x.toLowerCase()).includes(s.toLowerCase())
    );
    skillMatchPoints = matchedSkills.length * 10;
    score += skillMatchPoints;
  }

  // Education bonus
  let educationPoints = 0;
  if (
    c.education?.degrees?.some(d => d.isTop25 || d.isTop50)
  ) {
    educationPoints = 10;
    score += educationPoints;
  }

  // Breadth of skills
  const breadthPoints = Math.min(10, (c.skills?.length || 0));
  score += breadthPoints;

  // Generate explanation
  const reasons: string[] = [];
  if (expPoints > 0) reasons.push(`${c.years_experience} yrs experience`);
  if (matchedSkills.length)
    reasons.push(`Key skills: ${matchedSkills.join(', ')}`);
  if (educationPoints > 0)
    reasons.push(`Education from top-ranked institution`);
  if (breadthPoints > 0)
    reasons.push(`Diverse skillset (${c.skills?.length} skills)`);

  c.explanation = reasons.length
    ? reasons.join('; ')
    : 'Solid background and potential fit';

  return score;
}

export function autoShortlist(
  candidates: Candidate[],
  opts: ShortlistOptions = {}
): Candidate[] {
  const target = opts.targetCount || 5;

  candidates.forEach(
    c => (c.score = scoreCandidate(c, opts))
  );

  return candidates
    .slice()
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, target);
}
