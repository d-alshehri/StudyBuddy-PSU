
-- Change the default current_location from 'Library 2nd Floor' to NULL
-- so new sign-ups land with no location set rather than an irrelevant placeholder
ALTER TABLE public.profiles ALTER COLUMN current_location SET DEFAULT NULL;

-- Clear the legacy placeholder value for all existing profiles
UPDATE public.profiles
SET current_location = NULL
WHERE current_location = 'Library 2nd Floor';
