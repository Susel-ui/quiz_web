/**
 * Shared TypeScript types that mirror backend DTOs.
 * These are the canonical shapes used across all features.
 * Each feature may extend these types but never contradict them.
 */

// ─── Common ──────────────────────────────────────────────────────────────────

export type UUID = string;

export interface PaginatedResponse<T> {
  data:       T[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
}

export interface ApiError {
  status:  number;
  message: string;
  code?:   string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'learner' | 'admin' | 'reviewer';

export interface User {
  id:         UUID;
  name:       string;
  email:      string;
  role:       UserRole;
  department: string;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
  expiresAt:    number; // epoch ms
}

// ─── Competency Gap ───────────────────────────────────────────────────────────

export type GapSeverity = 'critical' | 'warning' | 'ok';

export interface CompetencyDomain {
  id:       string;
  name:     string;
  category: string;
}

export interface CompetencyScore {
  domain:        CompetencyDomain;
  currentLevel:  number; // 0–100
  requiredLevel: number; // 0–100
  gapPercent:    number; // requiredLevel - currentLevel, clamped >= 0
  severity:      GapSeverity;
}

export interface CompetencyGapSummary {
  userId:         UUID;
  overallScore:   number;            // weighted average current level
  criticalCount:  number;
  warningCount:   number;
  okCount:        number;
  scores:         CompetencyScore[];
  lastUpdated:    string;            // ISO 8601
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseFormat = 'video' | 'text' | 'interactive' | 'workshop';

export interface Course {
  id:              UUID;
  title:           string;
  provider:        string;
  durationMinutes: number;
  level:           CourseLevel;
  format:          CourseFormat;
  thumbnailUrl?:   string;
  iGOTCourseUrl:   string;
  tags:            string[];
}

export interface Recommendation {
  course:           Course;
  relevanceScore:   number;     // 0–1
  targetDomains:    CompetencyDomain[];
  whyRecommended:   string;     // AI-generated explanation
  estimatedGapFill: number;     // % gap reduction expected
}

// ─── Quiz Generator ───────────────────────────────────────────────────────────

export type JobStatus = 'queued' | 'processing' | 'complete' | 'failed';

export interface UploadJobResponse {
  jobId:     UUID;
  status:    JobStatus;
  createdAt: string;
}

export interface JobStatusResponse {
  jobId:     UUID;
  status:    JobStatus;
  progress:  number; // 0–100
  message?:  string;
  quizId?:   UUID;   // set when status === 'complete'
}

export type QuestionType = 'single' | 'multiple';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface MCQOption {
  id:        string;
  text:      string;
  isCorrect: boolean;
}

export interface MCQuestion {
  id:              UUID;
  questionText:    string;
  type:            QuestionType;
  difficulty:      DifficultyLevel;
  options:         MCQOption[];
  explanation:     string;
  competencyDomain?: string;
  bloomsLevel?:    'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

// ─── Quiz Attempt ─────────────────────────────────────────────────────────────

export interface Quiz {
  id:              UUID;
  title:           string;
  description:     string;
  timeLimitSeconds: number;
  questions:       MCQuestion[];
  totalMarks:      number;
  passingPercent:  number;
}

export interface QuizAnswer {
  questionId: UUID;
  selectedOptionIds: string[];
  timeTakenSeconds: number;
}

export interface QuizAttemptRequest {
  quizId:  UUID;
  answers: QuizAnswer[];
}

export interface TopicBreakdown {
  topic:           string;
  correct:         number;
  total:           number;
  percentCorrect:  number;
  isWeakArea:      boolean;
}

export interface QuizResult {
  attemptId:       UUID;
  quizId:          UUID;
  userId:          UUID;
  score:           number;
  totalMarks:      number;
  percentScore:    number;
  passed:          boolean;
  timeTakenSeconds: number;
  topicBreakdowns: TopicBreakdown[];
  submittedAt:     string;
}
