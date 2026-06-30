-- Add city column to orders table for multi-city filtering
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city text;

-- Backfill existing orders with city from their linked address
UPDATE public.orders o
SET city = a.city
FROM public.addresses a
WHERE o.address_id = a.id
  AND o.city IS NULL;
