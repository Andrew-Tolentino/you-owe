-- **** "public"."members" ****
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
-- **** "public"."members" ****


-- **** "public"."groups" ****
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
-- **** "public"."groups" ****


-- **** "public"."members_groups" ****
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
-- **** "public"."members_groups" ****


-- **** "public"."orders" ****
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
WITH CHECK (
  creator_member_id IN (
    SELECT m.id
    FROM "public"."members" m
    WHERE m.id = creator_member_id AND m.auth_user_id = (SELECT auth.uid())
  )
);
-- **** "public"."orders" ****


-- **** "public"."orders_members" ****
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
-- **** "public"."orders_members" ****
