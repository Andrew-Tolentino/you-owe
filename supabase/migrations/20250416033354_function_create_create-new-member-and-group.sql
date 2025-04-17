-- Creates a new Member, Group, and MembersGroup entry.
-- Follows the necessary flow for creating a Group.
CREATE OR REPLACE FUNCTION "public".create_new_member_and_group(
  member_name text,
  group_name text,
  auth_user_id uuid,
  group_password text DEFAULT NULL
)
  RETURNS text AS $$
  DECLARE
    new_member_id text;
    new_group_id text;
  BEGIN
    -- 1. Create a new Member
      INSERT INTO "public"."members"("name", auth_user_id)
      VALUES (member_name, auth_user_id)
      RETURNING id INTO new_member_id;

    -- 2. Create a new Group
    INSERT INTO "public"."groups"("name", creator_member_id, "password")
    VALUES (group_name, new_member_id, group_password)
    RETURNING id into new_group_id;

    RETURN new_group_id;
  END;
$$ LANGUAGE PLPGSQL;
