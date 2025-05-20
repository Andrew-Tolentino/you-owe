-- Trigger that is used to create a new entry in the MembersGroups junction table
-- linking the newly created Group with the Member who created the Group.
-- This will be on tbe "public".groups table.
CREATE OR REPLACE FUNCTION "public".new_group_members_groups_trigger() RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO "public"."members_groups"(member_id, group_id)
    VALUES (NEW.creator_member_id, NEW.id);

    RETURN NEW;
  END;
$$ LANGUAGE PLPGSQL;
