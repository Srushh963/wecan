import { supabase } from './supabase';
import { auth, db } from './firebase';
import { doc, getDoc, getDocs, setDoc, query, collection, orderBy, limit } from 'firebase/firestore';

/**
 * Returns current authenticated user ID, supporting both Supabase and Firebase.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) {
    return session.user.id;
  }
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  return null;
}

/**
 * Returns user email and display name if available.
 */
export async function getCurrentUserInfo() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    return {
      id: session.user.id,
      email: session.user.email || null,
      displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null,
    };
  }
  if (auth.currentUser) {
    return {
      id: auth.currentUser.uid,
      email: auth.currentUser.email || null,
      displayName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || null,
    };
  }
  return null;
}

// ==========================================
// 1. PROFILES
// ==========================================
export interface UserProfileData {
  role?: string;
  experience?: string;
  domain?: string;
  targetJob?: string;
  email?: string;
  displayName?: string;
}

export async function saveProfile(profileData: UserProfileData) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const info = await getCurrentUserInfo();

  // Try Supabase first
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: profileData.email || info?.email || null,
        display_name: profileData.displayName || info?.displayName || null,
        role: profileData.role || null,
        experience: profileData.experience || null,
        domain: profileData.domain || null,
        target_job: profileData.targetJob || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase saveProfile error, falling back to Firebase:', error);
      throw error;
    }
  } catch {
    // Firebase Fallback
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'profile', 'minimal'), {
          ...profileData,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (fbErr) {
      console.error('Firebase saveProfile failed:', fbErr);
    }
  }
}

export async function getProfile(): Promise<UserProfileData | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return {
        role: data.role,
        experience: data.experience,
        domain: data.domain,
        targetJob: data.target_job,
        email: data.email,
        displayName: data.display_name
      };
    }
  } catch (err) {
    console.warn('Supabase getProfile failed, attempting Firebase:', err);
  }

  // Firebase Fallback
  try {
    if (auth.currentUser) {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid, 'profile', 'minimal'));
      if (snap.exists()) {
        const d = snap.data();
        return {
          role: d.role,
          experience: d.experience,
          domain: d.domain,
          targetJob: d.targetJob
        };
      }
    }
  } catch (fbErr) {
    console.error('Firebase getProfile failed:', fbErr);
  }

  return null;
}

// ==========================================
// 2. RESUMES
// ==========================================
export async function saveResumeRecord(params: {
  type: string;
  atsScore?: number;
  content?: string;
  tips?: any;
  rawAnswers?: any;
}) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    const { error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        type: params.type,
        ats_score: params.atsScore ?? null,
        content: params.content ?? null,
        tips: params.tips ?? null,
        raw_answers: params.rawAnswers ?? null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Supabase saveResume error, falling back to Firebase:', error);
      throw error;
    }
  } catch {
    // Firebase Fallback
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'resumes', `resume_${Date.now()}`), {
          ...params,
          createdAt: new Date().toISOString()
        });
      }
    } catch (fbErr) {
      console.error('Firebase saveResume failed:', fbErr);
    }
  }
}

// ==========================================
// 3. TESTS
// ==========================================
export async function saveTestResult(params: { topic: string; score: number }) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const testId = `test_${Date.now()}`;
  const now = new Date().toISOString();

  try {
    const { error } = await supabase
      .from('tests')
      .insert({
        id: testId,
        user_id: userId,
        topic: params.topic,
        score: params.score,
        created_at: now
      });

    if (error) {
      console.warn('Supabase saveTestResult error, falling back to Firebase:', error);
      throw error;
    }
  } catch {
    // Firebase Fallback
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'tests', testId), {
          topic: params.topic,
          score: params.score,
          createdAt: now
        });
      }
    } catch (fbErr) {
      console.error('Firebase saveTestResult failed:', fbErr);
    }
  }
}

export async function getUserTests(maxCount: number = 20): Promise<Array<{ topic: string; score: number; createdAt?: string }>> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('tests')
      .select('topic, score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(maxCount);

    if (!error && data && data.length > 0) {
      return data.map(d => ({
        topic: d.topic,
        score: Number(d.score),
        createdAt: d.created_at
      }));
    }
  } catch (err) {
    console.warn('Supabase getUserTests error, falling back to Firebase:', err);
  }

  // Firebase Fallback
  try {
    if (auth.currentUser) {
      const testsRef = collection(db, 'users', auth.currentUser.uid, 'tests');
      const q = query(testsRef, orderBy('createdAt', 'asc'), limit(maxCount));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(docSnap => ({
        topic: docSnap.data().topic,
        score: Number(docSnap.data().score),
        createdAt: docSnap.data().createdAt
      }));
    }
  } catch (fbErr) {
    console.error('Firebase getUserTests failed:', fbErr);
  }

  return [];
}

// ==========================================
// 4. STUDY PLANS
// ==========================================
export async function saveStudyPlan(planData: { title: string; modules: any[] }) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const now = new Date().toISOString();

  try {
    const { error } = await supabase
      .from('study_plans')
      .upsert({
        user_id: userId,
        title: planData.title,
        modules: planData.modules,
        updated_at: now
      }, { onConflict: 'user_id' });

    if (error) {
      console.warn('Supabase saveStudyPlan error, falling back to Firebase:', error);
      throw error;
    }
  } catch {
    // Firebase Fallback
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'studyPlans', 'current'), {
          ...planData,
          updatedAt: now
        });
      }
    } catch (fbErr) {
      console.error('Firebase saveStudyPlan failed:', fbErr);
    }
  }
}

// ==========================================
// 5. QA SESSIONS
// ==========================================
export async function saveQASession(targetRole: string, questions: any[]) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const sessionId = `qa_${Date.now()}`;
  const now = new Date().toISOString();

  try {
    const { error } = await supabase
      .from('qa_sessions')
      .insert({
        id: sessionId,
        user_id: userId,
        target_role: targetRole,
        questions: questions,
        created_at: now
      });

    if (error) {
      console.warn('Supabase saveQASession error, falling back to Firebase:', error);
      throw error;
    }
  } catch {
    // Firebase Fallback
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'qa_sessions', sessionId), {
          id: sessionId,
          targetRole,
          questions,
          createdAt: now
        });
      }
    } catch (fbErr) {
      console.error('Firebase saveQASession failed:', fbErr);
    }
  }
}

// ==========================================
// 6. INTERVIEWS
// ==========================================
export async function saveInterviewSession(params: {
  sessionId: string;
  mode: string;
  history: any;
  feedback?: string;
  voiceMetrics?: any;
  score?: number;
}) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const now = new Date().toISOString();

  try {
    const { error } = await supabase
      .from('interviews')
      .upsert({
        id: params.sessionId,
        user_id: userId,
        mode: params.mode,
        history: params.history,
        feedback: params.feedback ?? null,
        voice_metrics: params.voiceMetrics ?? null,
        score: params.score ?? null,
        created_at: now
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase saveInterviewSession error, falling back to Firebase:', error);
      throw error;
    }
  } catch {
    // Firebase Fallback
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'interviews', params.sessionId), {
          ...params,
          timestamp: now
        });
      }
    } catch (fbErr) {
      console.error('Firebase saveInterviewSession failed:', fbErr);
    }
  }
}
