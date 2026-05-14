import { supabase } from '../supabaseClient.js';

async function tableReady(name) {
  if (!supabase) return false;
  const { error } = await supabase.from(name).select('id', { count: 'exact', head: true });
  return !error;
}

export async function fetchUserRow(userId) {
  if (!supabase || !userId || !(await tableReady('users'))) return null;
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) return null;
  return data;
}

export async function upsertUserRow(partial) {
  if (!supabase || !partial?.id || !(await tableReady('users'))) return { ok: false };
  const { error } = await supabase.from('users').upsert(
    {
      id: partial.id,
      username: partial.username,
      avatar_url: partial.avatar_url,
      level: partial.level,
      xp: partial.xp,
      streak: partial.streak,
      attention_score: partial.attention_score,
      emergency_exit_left: partial.emergency_exit_left,
    },
    { onConflict: 'id' },
  );
  return { ok: !error, error };
}

export async function insertRoadmapRow({ userId, topic, roadmapJson }) {
  if (!supabase || !userId || !(await tableReady('roadmaps'))) return { id: null };
  const { data, error } = await supabase
    .from('roadmaps')
    .insert({ user_id: userId, topic, roadmap_json: roadmapJson, status: 'active' })
    .select('id')
    .single();
  if (error) return { id: null, error };
  return { id: data?.id };
}

export async function insertLearningHistoryRow(row) {
  if (!supabase || !(await tableReady('learning_history'))) return;
  await supabase.from('learning_history').insert(row);
}

export async function insertQuizResultRow(row) {
  if (!supabase || !(await tableReady('quiz_results'))) return;
  await supabase.from('quiz_results').insert(row);
}

export async function insertBadgeRow(row) {
  if (!supabase || !(await tableReady('badges'))) return { ok: false };
  const { error } = await supabase.from('badges').insert(row);
  if (error?.code === '23505') return { ok: true, duplicate: true };
  return { ok: !error, error };
}

export async function fetchBadges(userId) {
  if (!supabase || !userId || !(await tableReady('badges'))) return [];
  const { data } = await supabase.from('badges').select('*').eq('user_id', userId).order('earned_at', { ascending: false });
  return Array.isArray(data) ? data : [];
}

export async function fetchLearningHistory(userId, limit = 40) {
  if (!supabase || !userId || !(await tableReady('learning_history'))) return [];
  const { data } = await supabase
    .from('learning_history')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  return Array.isArray(data) ? data : [];
}

export async function insertMiniGameRow(row) {
  if (!supabase || !(await tableReady('mini_games'))) return;
  await supabase.from('mini_games').insert(row);
}

export async function startSessionRow(userId) {
  if (!supabase || !userId || !(await tableReady('sessions'))) return null;
  const { data, error } = await supabase.from('sessions').insert({ user_id: userId }).select('id').single();
  if (error) return null;
  return data?.id;
}

export async function endSessionRow(sessionId, durationSeconds) {
  if (!supabase || !sessionId || !(await tableReady('sessions'))) return;
  await supabase
    .from('sessions')
    .update({ ended_at: new Date().toISOString(), online_duration: Math.max(0, durationSeconds | 0) })
    .eq('id', sessionId);
}
