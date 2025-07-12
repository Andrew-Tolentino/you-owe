ALTER policy "authenticated user - Members can only UPDATE Groups they made"
ON "public"."groups"
TO authenticated
USING (
  creator_member_id IN (
    SELECT m.id
    FROM "public"."members" m
    WHERE m.id = creator_member_id AND m.auth_user_id = (SELECT auth.uid())
  )
);
