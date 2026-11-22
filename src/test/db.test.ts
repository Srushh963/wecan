import { describe, it, expect, vi } from 'vitest';
import {
  saveProfile,
  getProfile,
  saveResumeRecord,
  saveTestResult,
  getUserTests,
  saveStudyPlan,
  saveInterviewSession,
  getCurrentUserId,
  UserProfileData,
} from '../lib/db';

// Mock Supabase module
vi.mock('../lib/supabase', () => {
  const store: Record<string, any[]> = {
    profiles: [],
    resumes: [],
    tests: [],
    study_plans: [],
    qa_sessions: [],
    interviews: [],
  };

  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: {
                id: 'mock-user-uuid-123',
                email: 'candidate@wecan.ai',
                user_metadata: { full_name: 'Test Candidate' },
              },
            },
          },
        }),
      },
      from: (table: string) => ({
        upsert: vi.fn().mockImplementation((payload: any) => {
          store[table] = store[table] || [];
          const idx = store[table].findIndex((item) => item.id === payload.id || item.user_id === payload.user_id);
          if (idx >= 0) {
            store[table][idx] = { ...store[table][idx], ...payload };
          } else {
            store[table].push(payload);
          }
          return Promise.resolve({ data: payload, error: null });
        }),
        insert: vi.fn().mockImplementation((payload: any) => {
          store[table] = store[table] || [];
          store[table].push(payload);
          return Promise.resolve({ data: payload, error: null });
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockImplementation(() => {
              const item = (store[table] || []).find((x) => x.id === 'mock-user-uuid-123' || x.user_id === 'mock-user-uuid-123');
              return Promise.resolve({ data: item || null, error: null });
            }),
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockImplementation((limitCount: number) => {
                const items = (store[table] || []).filter((x) => x.user_id === 'mock-user-uuid-123').slice(0, limitCount);
                return Promise.resolve({ data: items, error: null });
              }),
            }),
          }),
        }),
      }),
    },
  };
});

describe('Database Layer & Supabase Integration (db.ts)', () => {
  it('retrieves current authenticated user id from session', async () => {
    const userId = await getCurrentUserId();
    expect(userId).toBe('mock-user-uuid-123');
  });

  it('saves and fetches user profile', async () => {
    const profile: UserProfileData = {
      role: 'Full Stack Engineer',
      experience: '2-4 years',
      domain: 'Web Development',
      targetJob: 'Senior React Developer',
      displayName: 'Test Candidate',
      email: 'candidate@wecan.ai',
    };

    await saveProfile(profile);
    const fetched = await getProfile();

    expect(fetched).toBeDefined();
    expect(fetched?.role).toBe('Full Stack Engineer');
    expect(fetched?.targetJob).toBe('Senior React Developer');
  });

  it('saves resume analysis record without errors', async () => {
    await expect(
      saveResumeRecord({
        type: 'upload',
        atsScore: 94,
        content: 'Experienced developer in React and TypeScript...',
        tips: { strengths: ['Clear impact metrics'], improvements: ['Add CI/CD details'] },
      })
    ).resolves.not.toThrow();
  });

  it('stores test results and queries test history', async () => {
    await saveTestResult({
      topic: 'System Design & Scalability',
      score: 95,
    });

    const tests = await getUserTests(10);
    expect(Array.isArray(tests)).toBe(true);
    expect(tests.length).toBeGreaterThan(0);
    expect(tests[0].topic).toBe('System Design & Scalability');
    expect(tests[0].score).toBe(95);
  });

  it('persists study plans and interview evaluations', async () => {
    await expect(
      saveStudyPlan({
        title: '4-Week Cloud Native Mastery',
        modules: [{ week: 1, title: 'Docker Containers' }, { week: 2, title: 'Kubernetes Pods' }],
      })
    ).resolves.not.toThrow();

    await expect(
      saveInterviewSession({
        sessionId: 'sess-abc-789',
        mode: 'technical',
        history: [{ sender: 'ai', text: 'Tell me about microservices' }],
        score: 88,
        feedback: 'Good architecture overview.',
      })
    ).resolves.not.toThrow();
  });
});
