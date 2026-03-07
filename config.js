// Supabase configuration
const SUPABASE_URL = 'https://thbudwhxccbkmlibvogm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoYnVkd2h4Y2Nia21saWJ2b2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ4NzcsImV4cCI6MjA4ODQ5MDg3N30.s0RJQXrmVYsjFV1A-0TxnE4YNhrz6uI2rd7IfjvLV0U';

// Initialize Supabase client using the global supabase object
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make it available globally
window.supabaseClient = supabaseClient;


