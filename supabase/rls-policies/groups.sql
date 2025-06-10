-- Enable RLS
ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;

-- Any user can see all Groups (needed for non authenticated users to join a Group)
CREATE POLICY "any user - can SELECT"
ON "public"."groups"
AS PERMISSIVE
FOR SELECT
USING (true);

-- Only Members can create Groups with valid auth id
CREATE POLICY "authenticated user - Members can INSERT"
ON "public"."groups"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
creator_member_id IN (
  SELECT id
  FROM "public"."members" m
  WHERE m.auth_user_id = (SELECT auth.uid())
 )
);

-- Members can only UPDATE Groups they made
CREATE POLICY "authenticated user - Members can only UPDATE Groups they made"
ON "public"."groups"
AS PERMISSIVE
FOR UPDATE
TO authenticated
WITH CHECK (
  creator_member_id IN (
    SELECT m.id
    FROM "public"."members" m
    WHERE m.id = creator_member_id AND m.auth_user_id = (SELECT auth.uid())
  )
);
