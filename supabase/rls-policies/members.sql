-- Enable RLS
ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;

-- Authenticated users can see all Members
CREATE POLICY "authenticated user - can SELECT"
on "public"."members"
AS PERMISSIVE
FOR SELECT
TO authenticated
using (true);

-- Authenticated users can create Members
CREATE POLICY "authenticated user - can INSERT"
ON "public"."members"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth_user_id = (SELECT auth.uid()));
