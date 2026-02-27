import { Profile } from '@/app/api/search-profiles/types';
import { MIN_SCORE_THRESHOLD } from '@/lib/constants';

export interface ParsedRequirements {
  skills: string[];
  location: string | null;
  seniority: string | null;
  workMode: string | null;
  role: string | null; // frontend, backend, fullstack, devops, mobile, data, qa, etc.
}

export interface RankedProfile extends Profile {
  embeddingScore: number;
  roleScore: number;
  skillScore: number;
  locationScore: number;
  seniorityScore: number;
  finalScore: number;
}

interface DynamicWeights {
  role: number;
  skills: number;
  embedding: number;
  seniority: number;
  location: number;
}

// Role categories and their keywords
const ROLE_CATEGORIES: Record<string, string[]> = {
  frontend: [
    'frontend',
    'front-end',
    'front end',
    'ui',
    'ux',
    'ui/ux',
    'react',
    'vue',
    'angular',
    'svelte',
    'next.js',
    'nextjs',
    'css',
    'html',
    'tailwind',
    'web developer',
    'web dev',
  ],
  backend: [
    'backend',
    'back-end',
    'back end',
    'server',
    'api',
    'node',
    'python',
    'java',
    'go',
    'golang',
    'rust',
    'ruby',
    'php',
    'django',
    'flask',
    'spring',
    'express',
    'fastapi',
  ],
  fullstack: ['fullstack', 'full-stack', 'full stack'],
  devops: [
    'devops',
    'dev ops',
    'sre',
    'site reliability',
    'infrastructure',
    'platform engineer',
    'cloud engineer',
    'systems engineer',
    'kubernetes',
    'docker',
    'terraform',
    'aws engineer',
    'azure engineer',
    'cicd',
    'ci/cd',
    'deployment',
    'infrastructure',
  ],
  mobile: [
    'mobile',
    'ios',
    'android',
    'react native',
    'flutter',
    'swift',
    'kotlin',
    'mobile developer',
    'app developer',
  ],
  data: [
    'data engineer',
    'data scientist',
    'data analyst',
    'machine learning',
    'ml engineer',
    'ai engineer',
    'etl',
    'data pipeline',
    'analytics',
    'big data',
    'spark',
    'airflow',
    'tensorflow',
    'pytorch',
  ],
  qa: [
    'qa',
    'quality assurance',
    'test',
    'tester',
    'testing',
    'sdet',
    'automation engineer',
    'test engineer',
    'selenium',
    'cypress',
    'playwright',
  ],
  security: [
    'security',
    'cybersecurity',
    'infosec',
    'penetration',
    'pentest',
    'security engineer',
    'appsec',
  ],
  architect: [
    'architect',
    'solutions architect',
    'software architect',
    'cloud architect',
    'technical architect',
    'enterprise architect',
  ],
};

// Roles that are compatible (e.g., fullstack can do frontend or backend)
const ROLE_COMPATIBILITY: Record<string, string[]> = {
  frontend: ['fullstack'],
  backend: ['fullstack'],
  fullstack: ['frontend', 'backend'],
  devops: ['architect', 'backend'],
  mobile: [],
  data: ['backend'],
  qa: [],
  security: ['devops', 'backend'],
  architect: ['fullstack', 'backend', 'devops'],
};

// Embedding score normalization
const EMBEDDING_MIN = 0.25;
const EMBEDDING_MAX = 0.75;

// Common skill aliases - maps canonical skill name to variations
const SKILL_ALIASES: Record<string, string[]> = {
  react: ['reactjs', 'react.js', 'react native', 'reactnative'],
  node: ['nodejs', 'node.js', 'express', 'nestjs', 'nest.js'],
  typescript: ['ts', 'tsx'],
  javascript: ['js', 'jsx', 'ecmascript', 'es6'],
  python: ['py', 'python3'],
  postgres: ['postgresql', 'psql', 'pg'],
  mongo: ['mongodb', 'mongoose'],
  aws: ['amazon web services', 'ec2', 's3', 'lambda'],
  gcp: ['google cloud', 'google cloud platform'],
  azure: ['microsoft azure'],
  docker: ['containerization', 'containers'],
  kubernetes: ['k8s', 'kubectl'],
  vue: ['vuejs', 'vue.js', 'nuxt', 'nuxtjs'],
  angular: ['angularjs', 'ng'],
  go: ['golang'],
  rust: ['rustlang'],
  java: ['jvm'],
  spring: ['spring boot', 'springboot'],
  graphql: ['gql', 'apollo'],
  redis: ['caching', 'cache'],
  tailwind: ['tailwindcss', 'tailwind css'],
  next: ['nextjs', 'next.js'],
};

// Seniority levels
const SENIORITY_LEVELS = [
  'junior',
  'mid',
  'senior',
  'lead',
  'principal',
  'staff',
];

// Work mode keywords
const WORK_MODE_KEYWORDS = {
  remote: ['remote', 'work from home', 'wfh', 'distributed', 'anywhere'],
  hybrid: ['hybrid', 'flexible'],
  onsite: ['on-site', 'onsite', 'on site', 'in-office', 'in office'],
};

/**
 * Parse the input query to extract requirements
 */
export function parseRequirements(query: string): ParsedRequirements {
  const lowerQuery = query.toLowerCase();

  return {
    role: extractRole(lowerQuery),
    skills: extractSkills(lowerQuery),
    location: extractLocation(lowerQuery),
    seniority: extractSeniority(lowerQuery),
    workMode: extractWorkMode(lowerQuery),
  };
}

function extractRole(query: string): string | null {
  // Check each role category
  for (const [role, keywords] of Object.entries(ROLE_CATEGORIES)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        return role;
      }
    }
  }
  return null;
}

function extractSkills(query: string): string[] {
  const foundSkills: Set<string> = new Set();

  for (const [skill, aliases] of Object.entries(SKILL_ALIASES)) {
    const skillRegex = new RegExp(`\\b${skill}\\b`, 'i');
    if (skillRegex.test(query)) {
      foundSkills.add(skill);
      continue;
    }

    for (const alias of aliases) {
      if (query.includes(alias.toLowerCase())) {
        foundSkills.add(skill);
        break;
      }
    }
  }

  return Array.from(foundSkills);
}

function extractLocation(query: string): string | null {
  const locations = [
    'madrid',
    'barcelona',
    'valencia',
    'spain',
    'españa',
    'london',
    'manchester',
    'uk',
    'united kingdom',
    'new york',
    'san francisco',
    'austin',
    'chicago',
    'seattle',
    'boston',
    'usa',
    'united states',
    'toronto',
    'vancouver',
    'montreal',
    'canada',
    'berlin',
    'munich',
    'frankfurt',
    'germany',
    'paris',
    'france',
    'amsterdam',
    'netherlands',
    'tokyo',
    'japan',
    'singapore',
    'seoul',
    'korea',
    'bangalore',
    'mumbai',
    'india',
    'sydney',
    'melbourne',
    'australia',
    'sao paulo',
    'brazil',
    'buenos aires',
    'argentina',
    'mexico city',
    'mexico',
    'europe',
    'latam',
    'asia',
    'emea',
  ];

  for (const loc of locations) {
    if (query.includes(loc)) {
      return loc;
    }
  }
  return null;
}

function extractSeniority(query: string): string | null {
  for (const level of SENIORITY_LEVELS) {
    const regex = new RegExp(`\\b${level}\\b`, 'i');
    if (regex.test(query)) {
      return level;
    }
  }

  const yearsMatch = query.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1]);
    if (years <= 2) return 'junior';
    if (years <= 4) return 'mid';
    if (years <= 7) return 'senior';
    return 'lead';
  }

  return null;
}

function extractWorkMode(query: string): string | null {
  for (const [mode, keywords] of Object.entries(WORK_MODE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        return mode;
      }
    }
  }
  return null;
}

// ============================================================================
// FIX 1: Word-Level Skill Matching (replaces substring matching)
// ============================================================================

/**
 * Check if a profile skill matches a required skill using word-level matching.
 * This prevents false positives like "aws".includes("a") = true
 */
function skillMatches(profileSkill: string, requiredSkill: string): boolean {
  const psLower = profileSkill.toLowerCase().trim();
  const reqLower = requiredSkill.toLowerCase().trim();

  // Exact match
  if (psLower === reqLower) return true;

  // Word boundary match for compound skills
  // Split on spaces, hyphens, slashes, dots
  const psWords = psLower.split(/[\s\-\/\.]+/);
  const reqWords = reqLower.split(/[\s\-\/\.]+/);

  // Check if any word in profile skill exactly matches any word in required skill
  return psWords.some((psWord) =>
    reqWords.some((reqWord) => psWord === reqWord && psWord.length > 1),
  );
}

/**
 * Check if a profile has a specific skill, considering aliases
 */
function hasSkillMatch(
  profileSkills: string[],
  requiredSkill: string,
): boolean {
  // Check direct match first
  for (const profileSkill of profileSkills) {
    if (skillMatches(profileSkill, requiredSkill)) {
      return true;
    }
  }

  // Check aliases for the required skill
  const aliases = SKILL_ALIASES[requiredSkill] || [];
  for (const alias of aliases) {
    for (const profileSkill of profileSkills) {
      if (skillMatches(profileSkill, alias)) {
        return true;
      }
    }
  }

  // Also check if any alias of any skill maps to the required skill
  // e.g., if profile has "nodejs" and we require "node"
  for (const [canonicalSkill, skillAliases] of Object.entries(SKILL_ALIASES)) {
    if (
      canonicalSkill === requiredSkill ||
      skillAliases.includes(requiredSkill)
    ) {
      // Check if profile has the canonical skill or any of its aliases
      for (const profileSkill of profileSkills) {
        if (skillMatches(profileSkill, canonicalSkill)) {
          return true;
        }
        for (const alias of skillAliases) {
          if (skillMatches(profileSkill, alias)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

// ============================================================================
// FIX 2: Hard Requirement Filter (skills are hard requirements)
// ============================================================================

/**
 * Filter profiles by hard requirements (skills).
 * Profiles must have at least ONE required skill to be included.
 */
function filterByHardRequirements(
  profiles: Profile[],
  requirements: ParsedRequirements,
): Profile[] {
  // If no skills specified, no hard requirements
  if (requirements.skills.length === 0) {
    return profiles;
  }

  // Must match at least ONE required skill
  return profiles.filter((profile) => {
    const profileSkills = profile.skills || [];
    return requirements.skills.some((reqSkill) =>
      hasSkillMatch(profileSkills, reqSkill),
    );
  });
}

// ============================================================================
// FIX 3: Dynamic Weights Based on Specified Criteria
// ============================================================================

/**
 * Calculate dynamic weights based on what criteria are specified.
 * Unspecified criteria get 0 weight (not 100% score).
 */
function calculateDynamicWeights(
  requirements: ParsedRequirements,
): DynamicWeights {
  const hasSkills = requirements.skills.length > 0;
  const hasRole = requirements.role !== null;
  const hasSeniority = requirements.seniority !== null;
  const hasLocation =
    requirements.location !== null || requirements.workMode !== null;

  // Count how many soft criteria are specified
  const specifiedCount = [hasRole, hasSeniority, hasLocation].filter(
    Boolean,
  ).length;

  // When only skills specified → skills dominate
  if (hasSkills && specifiedCount === 0) {
    return {
      skills: 0.6,
      embedding: 0.3,
      role: 0.0,
      seniority: 0.05,
      location: 0.05,
    };
  }

  // When skills + some other criteria specified
  if (hasSkills && specifiedCount > 0) {
    // Base weights for specified criteria
    const weights: DynamicWeights = {
      skills: 0.35,
      embedding: 0.2,
      role: 0.0,
      seniority: 0.0,
      location: 0.0,
    };

    // Distribute remaining 45% among specified soft criteria
    const remainingWeight = 0.45;
    const roleWeight = hasRole ? 0.25 : 0;
    const seniorityWeight = hasSeniority ? 0.12 : 0;
    const locationWeight = hasLocation ? 0.08 : 0;

    // Normalize to use full remaining weight if not all specified
    const totalSoftWeight = roleWeight + seniorityWeight + locationWeight;
    if (totalSoftWeight > 0) {
      const normalizer = remainingWeight / totalSoftWeight;
      weights.role = roleWeight * normalizer;
      weights.seniority = seniorityWeight * normalizer;
      weights.location = locationWeight * normalizer;
    }

    return weights;
  }

  // No skills specified, only soft criteria
  if (!hasSkills && specifiedCount > 0) {
    const weights: DynamicWeights = {
      skills: 0.0,
      embedding: 0.4,
      role: 0.0,
      seniority: 0.0,
      location: 0.0,
    };

    // Distribute 60% among specified soft criteria
    const remainingWeight = 0.6;
    const roleWeight = hasRole ? 0.35 : 0;
    const seniorityWeight = hasSeniority ? 0.15 : 0;
    const locationWeight = hasLocation ? 0.1 : 0;

    const totalSoftWeight = roleWeight + seniorityWeight + locationWeight;
    if (totalSoftWeight > 0) {
      const normalizer = remainingWeight / totalSoftWeight;
      weights.role = roleWeight * normalizer;
      weights.seniority = seniorityWeight * normalizer;
      weights.location = locationWeight * normalizer;
    }

    return weights;
  }

  // Nothing specified - use embedding only
  return {
    skills: 0.0,
    embedding: 1.0,
    role: 0.0,
    seniority: 0.0,
    location: 0.0,
  };
}

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Detect role from profile position and skills
 */
function detectProfileRole(position: string, skills: string[]): string | null {
  const positionLower = position.toLowerCase();
  const skillsLower = skills.map((s) => s.toLowerCase());
  const combined = positionLower + ' ' + skillsLower.join(' ');

  // Check position first (more reliable)
  for (const [role, keywords] of Object.entries(ROLE_CATEGORIES)) {
    for (const keyword of keywords) {
      if (positionLower.includes(keyword)) {
        return role;
      }
    }
  }

  // Fall back to skills-based detection
  for (const [role, keywords] of Object.entries(ROLE_CATEGORIES)) {
    let matchCount = 0;
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        matchCount++;
      }
    }
    // Require at least 2 keyword matches for skills-based role detection
    if (matchCount >= 2) {
      return role;
    }
  }

  return null;
}

/**
 * Calculate role match score
 * Returns 0 for unspecified requirements (not 1)
 */
function calculateRoleScore(
  requiredRole: string | null,
  profilePosition: string,
  profileSkills: string[],
): number {
  // FIX: Unspecified role returns 0, not 1
  if (!requiredRole) return 0;

  const profileRole = detectProfileRole(profilePosition, profileSkills);

  if (!profileRole) return 0.3; // Unknown role - low score

  // Exact match
  if (profileRole === requiredRole) return 1;

  // Compatible role (e.g., fullstack can do frontend)
  const compatibleRoles = ROLE_COMPATIBILITY[requiredRole] || [];
  if (compatibleRoles.includes(profileRole)) return 0.7;

  // Reverse compatibility (profile is fullstack, required is frontend)
  const profileCompatible = ROLE_COMPATIBILITY[profileRole] || [];
  if (profileCompatible.includes(requiredRole)) return 0.7;

  // Completely different role = very low score
  return 0;
}

function normalizeEmbeddingScore(score: number): number {
  if (score <= EMBEDDING_MIN) return 0;
  if (score >= EMBEDDING_MAX) return 1;
  return (score - EMBEDDING_MIN) / (EMBEDDING_MAX - EMBEDDING_MIN);
}

/**
 * Calculate skill score using word-level matching
 * Returns 0 for unspecified requirements (not 1)
 */
function calculateSkillScore(
  requiredSkills: string[],
  profileSkills: string[],
): number {
  // FIX: Unspecified skills returns 0, not 1
  if (requiredSkills.length === 0) return 0;

  let matchCount = 0;

  for (const required of requiredSkills) {
    if (hasSkillMatch(profileSkills, required)) {
      matchCount++;
    }
  }

  return matchCount / requiredSkills.length;
}

/**
 * Calculate location score
 * Returns 0 for unspecified requirements (not 1)
 */
function calculateLocationScore(
  requiredLocation: string | null,
  requiredWorkMode: string | null,
  profileLocation: string,
  profileOffice: string,
): number {
  // FIX: Unspecified location returns 0, not 1
  if (!requiredLocation && !requiredWorkMode) return 0;

  const profileLocationLower = profileLocation.toLowerCase();
  const profileOfficeLower = profileOffice.toLowerCase();
  const isRemote = profileOfficeLower.includes('remote');

  if (isRemote) return 0.9; // Remote can work anywhere

  let score = 0.4;

  if (requiredLocation && profileLocationLower.includes(requiredLocation)) {
    score += 0.4;
  }

  if (requiredWorkMode) {
    if (
      requiredWorkMode === 'hybrid' &&
      profileOfficeLower.includes('hybrid')
    ) {
      score += 0.2;
    } else if (
      requiredWorkMode === 'onsite' &&
      (profileOfficeLower.includes('on-site') ||
        profileOfficeLower.includes('onsite'))
    ) {
      score += 0.2;
    }
  }

  return Math.min(score, 1);
}

/**
 * Calculate seniority score
 * Returns 0 for unspecified requirements (not 1)
 */
function calculateSeniorityScore(
  requiredSeniority: string | null,
  profileSeniority: string,
): number {
  // FIX: Unspecified seniority returns 0, not 1
  if (!requiredSeniority) return 0;

  const profileSeniorityLower = profileSeniority.toLowerCase();
  const requiredIndex = SENIORITY_LEVELS.indexOf(requiredSeniority);

  let profileIndex = -1;
  for (let i = 0; i < SENIORITY_LEVELS.length; i++) {
    if (profileSeniorityLower.includes(SENIORITY_LEVELS[i])) {
      profileIndex = i;
      break;
    }
  }

  if (profileIndex === -1) return 0.5;
  if (profileIndex === requiredIndex) return 1;
  if (profileIndex > requiredIndex) return 0.9;

  const diff = requiredIndex - profileIndex;
  return Math.max(0.2, 1 - diff * 0.3);
}

// ============================================================================
// Main Reranking Function
// ============================================================================

/**
 * Rerank profiles using Filter First, Score Second approach:
 * 1. Filter by hard requirements (skills)
 * 2. Calculate dynamic weights based on specified criteria
 * 3. Score only specified criteria (unspecified = 0 contribution)
 * 4. Sort by final score
 */
export function rerankProfiles(
  profiles: Profile[],
  requirements: ParsedRequirements,
): RankedProfile[] {
  // PHASE 1: Filter by hard requirements (skills)
  const filteredProfiles = filterByHardRequirements(profiles, requirements);

  // PHASE 2: Calculate dynamic weights
  const weights = calculateDynamicWeights(requirements);

  // PHASE 3: Score remaining profiles
  const rankedProfiles: RankedProfile[] = filteredProfiles.map((profile) => {
    const embeddingScore = normalizeEmbeddingScore(profile.similarity);

    const roleScore = calculateRoleScore(
      requirements.role,
      profile.position || '',
      profile.skills || [],
    );

    const skillScore = calculateSkillScore(
      requirements.skills,
      profile.skills || [],
    );

    const locationScore = calculateLocationScore(
      requirements.location,
      requirements.workMode,
      profile.location || '',
      profile.office || '',
    );

    const seniorityScore = calculateSeniorityScore(
      requirements.seniority,
      profile.seniority || '',
    );

    // Calculate final score with dynamic weights
    const finalScore =
      weights.role * roleScore +
      weights.skills * skillScore +
      weights.embedding * embeddingScore +
      weights.seniority * seniorityScore +
      weights.location * locationScore;

    return {
      ...profile,
      embeddingScore,
      roleScore,
      skillScore,
      locationScore,
      seniorityScore,
      finalScore,
    };
  });

  // PHASE 4: Apply minimum threshold and additional filters
  let result = rankedProfiles.filter(
    (p) => p.finalScore >= MIN_SCORE_THRESHOLD,
  );

  // If a role was specified, require at least some role match
  if (requirements.role) {
    result = result.filter((p) => p.roleScore > 0);
  }

  // PHASE 5: Sort by final score descending
  return result.sort((a, b) => b.finalScore - a.finalScore);
}
