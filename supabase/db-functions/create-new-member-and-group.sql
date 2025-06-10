-- Creates a new Member, Group, and Members_Groups entry.
-- Follows the necessary flow for creating a Group.
CREATE OR REPLACE FUNCTION "public".create_new_member_and_group(
  new_member_name text,
  new_group_name text,
  auth_user_id uuid,
  new_group_password text DEFAULT NULL
)
  RETURNS TABLE (
    member_id varchar,
    member_name varchar,
    member_created_at timestamp WITH TIME ZONE,
    group_id varchar,
    group_name varchar,
    group_created_at timestamp WITH TIME ZONE
  ) AS $$
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

    RETURN query
      SELECT 
        members.id AS member_id,
        members."name" AS member_name,
        members.created_at AS member_created_at,
        groups.id AS group_id,
        groups."name" AS group_name,
        groups.created_at AS group_created_at
      FROM "public"."members" members INNER JOIN "public"."groups" groups 
      ON members.id = new_member_id AND groups.id = new_group_id;
    
  END;
$$ LANGUAGE PLPGSQL;
