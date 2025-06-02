CREATE OR REPLACE FUNCTION "public".check_orders_members_same_group() RETURNS TRIGGER AS $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM "public"."orders" o
      INNER JOIN "public"."members_groups" mg ON o.group_id = mg.group_id
      WHERE o.id = NEW.order_id AND mg.member_id = NEW.member_id
    ) THEN
      RAISE EXCEPTION USING
        MESSAGE='Member does not belong to the same Group the Order belongs to.',
        HINT='CUSTOM_RESOURCE_NOT_FOUND_ERROR',
        DETAIL='Member with ID ''' || NEW.member_id || ''' does not belong to the same Group the Order with ID ''' || NEW.order_id || ''' belongs in.',
        ERRCODE='45000';
    END IF;

    RETURN NEW;
  END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE TRIGGER check_orders_members_same_group_trigger
BEFORE INSERT
ON "public"."orders_members"
FOR EACH ROW
EXECUTE PROCEDURE "public".check_orders_members_same_group();
