-- Enable RLS
ALTER TABLE "public"."members_groups" ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can see
CREATE POLICY "authenticated user - can SELECT"
ON "public"."members_groups"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);

-- Only authenticated Members can INSERT
CREATE POLICY "authenticated user - Member can INSERT"
ON "public"."members_groups"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  member_id IN (
    SELECT id
    FROM "public"."members" m
    WHERE m.auth_user_id = (SELECT auth.uid())
  )
);
