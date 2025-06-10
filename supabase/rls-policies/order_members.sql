-- Enable RLS
ALTER TABLE "public"."orders_members" ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can see
CREATE POLICY "authenticated user - can SELECT"
ON "public"."orders_members"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);

-- Any authenticated user can insert
CREATE POLICY "authenticated user - can INSERT"
ON "public"."orders_members"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);
