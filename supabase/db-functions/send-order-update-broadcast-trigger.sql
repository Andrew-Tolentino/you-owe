-- Trigger that will broadcase a Supabase message once an Order has been updated.
-- This will be on the "publics".orders table.
CREATE OR REPLACE FUNCTION "public".send_order_update_broadcast_trigger() RETURNS TRIGGER AS $$
  DECLARE
    payload jsonb;
    creator_member_payload jsonb;
    participant_members_arr_payload jsonb;
    topic_name text;    
  BEGIN
    -- Create payload of Member who created the Order
    SELECT to_jsonb(row) INTO creator_member_payload
    FROM (
      SELECT m.id, m.name
      FROM "public"."members" m
      WHERE m.id = NEW.creator_member_id
    ) row;

    -- Create payload of participant Members in the Order
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', row.member_id,
        'name', row.name
      )
    ) INTO participant_members_arr_payload
    FROM (
      SELECT m.id AS member_id, m.name
      FROM "public"."orders_members" om
      INNER JOIN "public"."members" m ON om.member_id = m.id
      WHERE om.order_id = NEW.id AND om.member_id != NEW.creator_member_id AND m.id != NEW.creator_member_id
    ) row;

    SELECT jsonb_build_object(
      'order', to_jsonb(NEW),
      'creator_member', creator_member_payload,
      'participant_members', participant_members_arr_payload
    ) INTO payload;

    -- Get topic placeholder name
    SELECT cbm.topic INTO topic_name
    FROM "public"."custom_broadcast_messages" cbm
    WHERE cbm.id = 1;

    PERFORM "realtime".send(
      payload,
      'ORDER_UPDATED',
      topic_name || target_group_id,
      false
    );

    RETURN NEW;
  END;
$$ LANGUAGE PLPGSQL;
