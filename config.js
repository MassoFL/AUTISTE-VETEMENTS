// Supabase configuration
const SUPABASE_URL = 'https://thbudwhxccbkmlibvogm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoYnVkd2h4Y2Nia21saWJ2b2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ4NzcsImV4cCI6MjA4ODQ5MDg3N30.s0RJQXrmVYsjFV1A-0TxnE4YNhrz6uI2rd7IfjvLV0U';

// Backend API
const BACKEND_URL = 'https://autiste-back-xkuo.vercel.app';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SBbl7JSBAvJsiKM3zGSLQ8LCC3gHRS4r220rLWOkGK8ulh5HSK2YNOZi2vMX5MWUKVudM2cSwMfOnim7A6PCFxC00RY8Bc8z5';

// Initialize Supabase client using the global supabase object
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make it available globally
window.supabaseClient = supabaseClient;

// Initialize Stripe
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);


