/**
 * Mock seed data — realistic iGOT competency framework data.
 * All types align with src/types/api.ts so swapping to real API
 * requires zero type changes.
 */

import type {
  CompetencyGapSummary,
  Recommendation,
  Quiz,
  QuizResult,
  User,
} from '../../types/api';

// ── Mock user ─────────────────────────────────────────────────────────────────
export const MOCK_USER: User = {
  id:         'user-001',
  name:       'Priya Sharma',
  email:      'priya.sharma@gov.in',
  role:       'learner',
  department: 'Ministry of Finance',
};

// ── Competency gap data ───────────────────────────────────────────────────────
export const MOCK_COMPETENCY_GAP: CompetencyGapSummary = {
  userId:        'user-001',
  overallScore:  62,
  criticalCount: 3,
  warningCount:  2,
  okCount:       3,
  lastUpdated:   '2026-08-20T10:30:00Z',
  scores: [
    {
      domain: { id: 'd1', name: 'Leadership & Strategy', category: 'Core' },
      currentLevel: 45, requiredLevel: 80, gapPercent: 35, severity: 'warning',
    },
    {
      domain: { id: 'd2', name: 'Digital Governance', category: 'Technology' },
      currentLevel: 30, requiredLevel: 90, gapPercent: 60, severity: 'warning',
    },
    {
      domain: { id: 'd3', name: 'Policy Analysis', category: 'Core' },
      currentLevel: 72, requiredLevel: 85, gapPercent: 13, severity: 'ok',
    },
    {
      domain: { id: 'd4', name: 'Financial Management', category: 'Finance' },
      currentLevel: 80, requiredLevel: 90, gapPercent: 10, severity: 'ok',
    },
    {
      domain: { id: 'd5', name: 'Data & Analytics', category: 'Technology' },
      currentLevel: 20, requiredLevel: 75, gapPercent: 55, severity: 'warning',
    },
    {
      domain: { id: 'd6', name: 'Ethical Governance', category: 'Core' },
      currentLevel: 75, requiredLevel: 80, gapPercent: 5, severity: 'ok',
    },
    {
      domain: { id: 'd7', name: 'Communication & Stakeholder', category: 'Soft Skills' },
      currentLevel: 15, requiredLevel: 80, gapPercent: 65, severity: 'critical',
    },
    {
      domain: { id: 'd8', name: 'Project Management', category: 'Operations' },
      currentLevel: 10, requiredLevel: 85, gapPercent: 75, severity: 'critical',
    },
  ],
};

// ── Recommendations ───────────────────────────────────────────────────────────
export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    course: {
      id: 'c1',
      title: 'Digital Governance for Civil Servants',
      provider: 'iGOT Academy',
      durationMinutes: 180,
      level: 'intermediate',
      format: 'interactive',
      thumbnailUrl: undefined,
      iGOTCourseUrl: 'https://igot.gov.in/igot/course/c1',
      tags: ['Digital', 'Governance', 'Policy'],
    },
    relevanceScore:   0.95,
    targetDomains:    [{ id: 'd2', name: 'Digital Governance', category: 'Technology' }],
    whyRecommended:   'Your Digital Governance score is 60% below required. This course directly bridges that gap through practical e-governance case studies.',
    estimatedGapFill: 40,
  },
  {
    course: {
      id: 'c2',
      title: 'Effective Communication in Public Service',
      provider: 'LBSNAA',
      durationMinutes: 120,
      level: 'beginner',
      format: 'video',
      iGOTCourseUrl: 'https://igot.gov.in/igot/course/c2',
      tags: ['Communication', 'Stakeholder', 'Soft Skills'],
    },
    relevanceScore:   0.91,
    targetDomains:    [{ id: 'd7', name: 'Communication & Stakeholder', category: 'Soft Skills' }],
    whyRecommended:   'Critical gap detected (65%) in Communication. This foundational course builds structured communication skills for inter-ministry coordination.',
    estimatedGapFill: 35,
  },
  {
    course: {
      id: 'c3',
      title: 'Project Management for Government Officers',
      provider: 'iGOT Academy',
      durationMinutes: 240,
      level: 'intermediate',
      format: 'interactive',
      iGOTCourseUrl: 'https://igot.gov.in/igot/course/c3',
      tags: ['Project Management', 'Operations', 'PM'],
    },
    relevanceScore:   0.88,
    targetDomains:    [{ id: 'd8', name: 'Project Management', category: 'Operations' }],
    whyRecommended:   'Your Project Management gap (75%) is the largest identified. This course uses government project case studies from PMGSY and Smart Cities Mission.',
    estimatedGapFill: 50,
  },
  {
    course: {
      id: 'c4',
      title: 'Data Analytics for Policy Makers',
      provider: 'NIPFP',
      durationMinutes: 200,
      level: 'intermediate',
      format: 'video',
      iGOTCourseUrl: 'https://igot.gov.in/igot/course/c4',
      tags: ['Data', 'Analytics', 'Policy'],
    },
    relevanceScore:   0.82,
    targetDomains:    [{ id: 'd5', name: 'Data & Analytics', category: 'Technology' }],
    whyRecommended:   'Data & Analytics gap (55%) impacts evidence-based policy work. Covers public datasets, MIS dashboards, and outcome measurement.',
    estimatedGapFill: 30,
  },
];

// ── Quiz ──────────────────────────────────────────────────────────────────────
export const MOCK_QUIZ: Quiz = {
  id:               'quiz-001',
  title:            'Digital Governance Fundamentals',
  description:      'Assess your understanding of e-governance principles, digital India initiatives, and data management for public servants.',
  timeLimitSeconds: 1200, // 20 minutes
  totalMarks:       10,
  passingPercent:   60,
  questions: [
    {
      id: 'q1',
      questionText: 'Which framework governs the electronic delivery of government services in India?',
      type: 'single',
      difficulty: 'easy',
      options: [
        { id: 'q1a', text: 'National e-Governance Plan (NeGP)', isCorrect: true },
        { id: 'q1b', text: 'Digital Bharat Framework', isCorrect: false },
        { id: 'q1c', text: 'Aadhaar Integration Policy', isCorrect: false },
        { id: 'q1d', text: 'CERT-In Guidelines', isCorrect: false },
      ],
      explanation: 'The National e-Governance Plan (NeGP) was approved in 2006 and provides the overarching framework for e-governance service delivery in India.',
      competencyDomain: 'Digital Governance',
      bloomsLevel: 'remember',
    },
    {
      id: 'q2',
      questionText: 'Under the Digital Personal Data Protection Act 2023, what is a "Data Fiduciary"?',
      type: 'single',
      difficulty: 'medium',
      options: [
        { id: 'q2a', text: 'An entity that determines the purpose and means of processing personal data', isCorrect: true },
        { id: 'q2b', text: 'A citizen whose data is being collected', isCorrect: false },
        { id: 'q2c', text: 'A third-party auditor of data practices', isCorrect: false },
        { id: 'q2d', text: 'The Ministry of Electronics and IT', isCorrect: false },
      ],
      explanation: 'Under DPDP Act 2023, a Data Fiduciary is any person who, alone or in conjunction with others, determines the purpose and means of processing personal data.',
      competencyDomain: 'Digital Governance',
      bloomsLevel: 'understand',
    },
    {
      id: 'q3',
      questionText: 'Which of the following are core components of the India Stack? (Select all that apply)',
      type: 'multiple',
      difficulty: 'medium',
      options: [
        { id: 'q3a', text: 'Aadhaar',    isCorrect: true },
        { id: 'q3b', text: 'UPI',        isCorrect: true },
        { id: 'q3c', text: 'DigiLocker', isCorrect: true },
        { id: 'q3d', text: 'UMANG',      isCorrect: false },
      ],
      explanation: 'India Stack comprises the identity layer (Aadhaar), payments layer (UPI), and documents layer (DigiLocker). UMANG is a separate app aggregator, not a Stack layer.',
      competencyDomain: 'Digital Governance',
      bloomsLevel: 'understand',
    },
  ],
};

// ── Quiz result ───────────────────────────────────────────────────────────────
export const MOCK_QUIZ_RESULT: QuizResult = {
  attemptId:        'attempt-001',
  quizId:           'quiz-001',
  userId:           'user-001',
  score:            7,
  totalMarks:       10,
  percentScore:     70,
  passed:           true,
  timeTakenSeconds: 840,
  submittedAt:      '2026-08-24T12:00:00Z',
  topicBreakdowns: [
    { topic: 'e-Governance Frameworks', correct: 3, total: 4, percentCorrect: 75, isWeakArea: false },
    { topic: 'Data Protection Laws',    correct: 2, total: 3, percentCorrect: 67, isWeakArea: false },
    { topic: 'Digital Identity',        correct: 2, total: 3, percentCorrect: 67, isWeakArea: false },
  ],
};
