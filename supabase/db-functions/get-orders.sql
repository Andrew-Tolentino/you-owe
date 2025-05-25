-- Gets Orders (in DESC order by created_at) based on given filters and returns a payload similar to the message topic - "orders_group-"
-- As of right now, this function requires a Group ID but in the future there might be other optional filters such as..
--  date_start (starting date)
--  date_end (ending date)
CREATE OR REPLACE FUNCTION "public".get_orders(
  orders_group_id text
) RETURNS jsonb AS $$
  DECLARE
    specific_order record;
    creator_member_payload jsonb;
    participant_members_arr_payload jsonb;
    return_arr jsonb := '[]';
  BEGIN
    -- Null check for 'group_id'
    IF orders_group_id IS NULL THEN
      RAISE EXCEPTION USING
        MESSAGE='''groupd_id'' field is invalid.',
        HINT='CUSTOM_VALIDATION_ERROR',
        DETAIL='groupd_id field is NULL',
        ERRCODE='45000';
    END IF;

    -- Iterate through all "active" Orders (not soft deleted) within Group
    FOR specific_order IN 
      SELECT *
      FROM "public"."orders" o
      WHERE o.group_id = orders_group_id AND o.deleted_at IS NULL
      ORDER BY o.created_at DESC
    LOOP
      -- Create json object for creator member.
      SELECT to_jsonb(row) INTO creator_member_payload
      FROM (
        SELECT m.id AS member_id, m.name
        FROM "public"."members" m
        WHERE m.id = specific_order.creator_member_id
      ) row;
      
      -- Create json array for participant members.
      SELECT jsonb_agg(
        to_jsonb(row)
      ) INTO participant_members_arr_payload
      FROM (
        SELECT m.id AS member_id, m.name
        FROM "public"."orders_members" om 
        INNER JOIN "public"."members" m ON om.member_id = m.id
        WHERE om.order_id = specific_order.id AND om.member_id != specific_order.creator_member_id AND m.id != specific_order.creator_member_id
      ) row;

      -- Append to json resulting array
      return_arr := return_arr || jsonb_build_object(
        'order', specific_order,
        'creator_member', creator_member_payload,
        'participant_members', coalesce(participant_members_arr_payload, '[]')
      );
    END LOOP;

    return return_arr;
  END;
$$ LANGUAGE PLPGSQL;
