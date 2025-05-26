-- Gets Orders (in DESC order by created_at) based on given filters and returns a payload similar to the message topic - "orders_group-"
CREATE OR REPLACE FUNCTION "public".get_orders(
  target_group_id text DEFAULT NULL,
  target_creator_member_id text DEFAULT NULL
) RETURNS jsonb AS $$
  DECLARE
    -- Use a dynamic query so we can add query filters if available
    sql_orders_query text := 'SELECT * FROM public.orders WHERE deleted_at IS NULL';
    specific_order record;
    creator_member_payload jsonb;
    participant_members_arr_payload jsonb;
    orders_arr_payload jsonb := '[]';
  BEGIN

    -- Add "target_group_id" to filter query to limit Orders to a specific Group
    IF target_group_id IS NOT NULL THEN
      sql_orders_query := sql_orders_query || format(' AND group_id = %L', target_group_id);
    END IF;

    -- Add "target_creator_member_id" to filter query to limit Orders to a specific Member
    IF target_creator_member_id IS NOT NULL THEN
      sql_orders_query := sql_orders_query || format(' AND creator_member_id = %L', target_creator_member_id);
    END IF;

    -- Have the Orders be ordered by date created descending
    sql_orders_query := sql_orders_query || 'ORDER BY created_at DESC';

    -- Iterate through all "active" Orders (not soft deleted) within Group
    FOR specific_order IN 
      EXECUTE sql_orders_query
    LOOP
      -- Create json object for creator member.
      SELECT to_jsonb(row) INTO creator_member_payload
      FROM (
        SELECT m.id, m.name
        FROM "public"."members" m
        WHERE m.id = specific_order.creator_member_id
      ) row;
      
      -- Create json array for participant members.
      SELECT jsonb_agg(
        to_jsonb(row)
      ) INTO participant_members_arr_payload
      FROM (
        SELECT m.id, m.name
        FROM "public"."orders_members" om 
        INNER JOIN "public"."members" m ON om.member_id = m.id
        WHERE om.order_id = specific_order.id AND om.member_id != specific_order.creator_member_id AND m.id != specific_order.creator_member_id
      ) row;

      -- Append to json resulting array
      orders_arr_payload := orders_arr_payload || jsonb_build_object(
        'order', specific_order,
        'creator_member', creator_member_payload,
        'participant_members', coalesce(participant_members_arr_payload, '[]')
      );
    END LOOP;

    return orders_arr_payload;
  END;
$$ LANGUAGE PLPGSQL;
