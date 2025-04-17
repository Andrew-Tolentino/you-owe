-- Trigger that is used to create a new entry in the MembersGroups junction table
-- linking the newly created Group with the Member who created the Group.
CREATE OR REPLACE FUNCTION "public".new_group_members_groups_trigger() RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO "public"."members_groups"(member_id, group_id)
    VALUES (NEW.creator_member_id, NEW.id);

    RETURN NEW;
    -- 
  END;
$$ LANGUAGE PLPGSQL;

/*
  Whenever a new row is created into the "public"."groups" table,
  a new entry in the "public"."members_groups" table will be created
  which adds the new Group created and the Member who created it.
*/
CREATE OR REPLACE TRIGGER new_group_members_groups_trigger
AFTER INSERT
ON "public"."groups"
FOR EACH ROW
EXECUTE PROCEDURE "public".new_group_members_groups_trigger();
