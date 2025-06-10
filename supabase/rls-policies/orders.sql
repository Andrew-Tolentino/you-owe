-- Enable RLS
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can see
CREATE POLICY "authenticated user - can SELECT"
ON "public"."orders"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);

-- Members must belong to the same Group the Order was created for
CREATE POLICY "authenticated user - Members in Order's Group to INSERT"
ON "public"."orders"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  creator_member_id IN (
    SELECT mg.member_id
    FROM "public"."members_groups" mg
    INNER JOIN "public"."members" m ON mg.member_id = m.id
    WHERE mg.group_id = group_id AND mg.member_id = creator_member_id AND m.auth_user_id = (SELECT auth.uid())
  )
);

-- Members can only UPDATE Orders they made
CREATE POLICY "authenticated user - Members can only UPDATE Orders they made"
ON "public"."orders"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  creator_member_id IN (
    SELECT m.id
    FROM "public"."members" m
    WHERE m.id = creator_member_id AND m.auth_user_id = (SELECT auth.uid())
  )
);
