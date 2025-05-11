DROP FUNCTION "public".create_new_member_and_link_to_members_groups;

-- Creates new Member and respective Members_Groups entries.
CREATE OR REPLACE FUNCTION "public".create_new_member_and_link_to_members_groups(
  member_name text,
  group_id text,
  auth_user_id uuid
) RETURNS "public"."members" AS $$
  DECLARE
    new_member "public"."members"%ROWTYPE;
  BEGIN
    -- 1. Create a new Member
    INSERT INTO "public"."members"("name", auth_user_id)
    VALUES (member_name, auth_user_id)
    RETURNING * INTO new_member;

    -- 2. Create new entry in Members_Groups to link new Member to existing Group
    INSERT INTO "public"."members_groups"(member_id, group_id)
    VALUES (new_member.id, group_id);

    RETURN new_member;
  END;
$$ LANGUAGE PLPGSQL;
