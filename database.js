const { createClient } = require('@supabase/supabase-js');

const TABLE_NAME = 'subscribers';
let supabase;

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('[database] Supabase client ready:', supabaseUrl);
  }

  return supabase;
}

async function initDb() {
  const client = getSupabaseClient();
  const { error } = await client.from(TABLE_NAME).select('id').limit(1);

  if (error) {
    console.error('[database] Supabase table check failed:', error);
    throw new Error('Supabase table "subscribers" is not ready. Create it in Supabase first.');
  }

  console.log('[database] Supabase subscribers table is ready.');
}

async function findSubscriberByEmail(email) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(TABLE_NAME)
    .select('id, email, source, created_at')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('[database] Supabase lookup error:', error);
    throw error;
  }

  return data;
}

async function addSubscriber(email, source) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(TABLE_NAME)
    .insert({ email, source })
    .select('id, email, source, created_at')
    .single();

  if (error) {
    console.error('[database] Supabase insert error:', error);
    throw error;
  }

  return data;
}

async function listSubscribers() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(TABLE_NAME)
    .select('id, email, source, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[database] Supabase list error:', error);
    throw error;
  }

  return data || [];
}

function isDuplicateEmailError(error) {
  return Boolean(error && error.code === '23505');
}

module.exports = {
  initDb,
  findSubscriberByEmail,
  addSubscriber,
  listSubscribers,
  isDuplicateEmailError,
};
