-- Roll back the OAuth trigger that is causing sign-up failures
-- (It will be recreated later if you decide to add a sturdier version.)

-- 1. Drop the AFTER INSERT trigger on auth.users (if it exists)
DROP TRIGGER IF EXISTS on_auth_user_created_oauth ON auth.users;

-- 2. Drop the trigger function itself (if it exists)
DROP FUNCTION IF EXISTS public.handle_oauth_user;
