-- Creates new Member and respective Members_Groups entries.
CREATE OR REPLACE FUNCTION "public".create_new_member_and_link_to_members_groups(
  member_name text,
  group_id text,
  auth_user_id uuid
) RETURNS setof "public"."members" AS $$
  DECLARE
    new_member_id text;
  BEGIN
    -- 1. Create a new Member
    INSERT INTO "public"."members"("name", auth_user_id)
    VALUES (member_name, auth_user_id)
    RETURNING id INTO new_member_id;

    -- 2. Create new entry in Members_Groups to link new Member to existing Group
    INSERT INTO "public"."members_groups"(member_id, group_id)
    VALUES (new_member_id, group_id);

    RETURN query
      SELECT *
      FROM "public"."members"
      WHERE id = new_member_id;
  END;
$$ LANGUAGE PLPGSQL;
