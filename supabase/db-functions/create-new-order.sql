-- Create a new Order
CREATE OR REPLACE FUNCTION "public".create_new_order(
  creator_member_id text,
  target_group_id text,
  target_title text,
  target_price numeric,
  target_description text DEFAULT NULL,
  target_participant_member_ids text[] DEFAULT '{}'::text[]
) RETURNS "public"."orders" AS $$
  DECLARE
    new_order "public"."orders"%ROWTYPE;
    member_row "public"."members"%ROWTYPE;
    group_row "public"."groups"%ROWTYPE;
    target_participant_member_id text;
    payload jsonb;
    creator_member_payload jsonb;
    participant_members_arr_payload jsonb;
    topic_name text;
  BEGIN
    -- Null check each field returning client friendly messages except 'participant_member_ids'
    IF creator_member_id IS NULL THEN
      RAISE EXCEPTION USING
        MESSAGE='''creator_member_id'' field is invalid.',
        HINT='CUSTOM_VALIDATION_ERROR',
        DETAIL='creator_member_id field is NULL',
        ERRCODE='45000';
    END IF;

    IF target_group_id IS NULL THEN
      RAISE EXCEPTION USING
        MESSAGE='''group_id field'' is invalid.',
        HINT='CUSTOM_VALIDATION_ERROR',
        DETAIL='group_id field is NULL',
        ERRCODE='45000';
    END IF;

    IF target_title IS NULL THEN
      RAISE EXCEPTION USING
        MESSAGE='''title'' field is invalid.',
        HINT='CUSTOM_VALIDATION_ERROR',
        DETAIL='title field is NULL',
        ERRCODE='45000';
    END IF;

    IF target_price IS NULL THEN
      RAISE EXCEPTION USING
        MESSAGE='''price'' field is invalid.',
        HINT='CUSTOM_VALIDATION_ERROR',
        DETAIL='price field is NULL',
        ERRCODE='45000';
    ELSEIF target_price <= 0 THEN
      RAISE EXCEPTION USING
        MESSAGE='''price'' field is invalid.',
        HINT='CUSTOM_VALIDATION_ERROR',
        DETAIL='price field is less than or equal to 0',
        ERRCODE='45000';
    END IF;

    -- Verify Member is valid
    SELECT * INTO member_row
    FROM "public"."members" m
    WHERE m.id = creator_member_id AND m.deleted_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION USING
        MESSAGE='''Member'' does not exist.',
        HINT='CUSTOM_RESOURCE_NOT_FOUND_ERROR',
        DETAIL='Member with ID ''' || creator_member_id || ''' has been deleted or never existed.',
        ERRCODE='45000';      
    END IF;

    -- Verify Group is valid
    SELECT * INTO group_row
    FROM "public"."groups" g
    WHERE g.id = target_group_id AND g.deleted_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION USING
        MESSAGE='''Group'' does not exist.',
        HINT='CUSTOM_RESOURCE_NOT_FOUND_ERROR',
        DETAIL='Group with ID ''' || target_group_id || ''' has been deleted or never existed.',
        ERRCODE='45000';      
    END IF;

    -- Now that Member and Group are both valid, verify that Member belongs to Group
    IF NOT EXISTS (
      SELECT 1
      FROM "public"."members_groups" mg
      WHERE mg.member_id = creator_member_id AND mg.group_id = target_group_id
    ) 
    THEN
      RAISE EXCEPTION USING
        MESSAGE='''Member'' does not belong to this ''Group''.',
        HINT='CUSTOM_VALIDATION_ERROR',
        DETAIL='Member with ID ''' || creator_member_id || ''' does not belong to Group with ID ''' || target_group_id || '''.',
        ERRCODE='45000';
    END IF;

    -- Now verify that all Members in 'target_participant_member_ids' are active and in the Group
    FOREACH target_participant_member_id IN ARRAY target_participant_member_ids
      LOOP
        IF NOT EXISTS (
          SELECT 1
          FROM "public"."members" m
          WHERE m.id = target_participant_member_id AND m.deleted_at IS NULL
        ) THEN
            RAISE EXCEPTION USING
              MESSAGE='A ''Member'' who is participating in this Order does not exist.',
              HINT='CUSTOM_RESOURCE_NOT_FOUND_ERROR',
              DETAIL='Member with ID ''' || target_participant_member_id || ''' has been deleted or never existed.',
              ERRCODE='45000';

        ELSEIF NOT EXISTS (
          SELECT 1
          FROM "public"."members_groups" mg
          WHERE mg.member_id = target_participant_member_id AND mg.group_id = target_group_id
        ) THEN
            RAISE EXCEPTION USING
              MESSAGE='A ''Member'' who is participating in this Order does not belong to this Group.',
              HINT='CUSTOM_RESOURCE_NOT_FOUND_ERROR',
              DETAIL='Member with ID ''' || target_participant_member_id || ''' does not belong to Group with ID ''' || target_group_id || '''.',
              ERRCODE='45000';
        END IF;
      END LOOP;

    -- Create Order
    -- Add +1 to 'number_of_participants' value to include Member creating the Order (array_length returns NULL if array is empty, hence COALESCE)
    INSERT INTO "public"."orders"(group_id, creator_member_id, title, description, price, number_of_participants)
    VALUES (target_group_id, creator_member_id, target_title, target_description, target_price, COALESCE(array_length(target_participant_member_ids, 1), 0) + 1)
    RETURNING * INTO new_order;

    -- Create entry in 'orders_members' join table for Member creating the Order
    INSERT INTO "public"."orders_members"(order_id, member_id)
    VALUES (new_order.id, creator_member_id);

    -- Create entries in 'orders_members' for participating Members
    FOREACH target_participant_member_id IN ARRAY target_participant_member_ids
      LOOP
        INSERT INTO "public"."orders_members"(order_id, member_id)
        VALUES (new_order.id, target_participant_member_id);
    END LOOP;

    -- * Below will now send a broadcast message to notify any listeners that a new Order has been created *

    -- Create payload of Member who created the Order
    SELECT to_jsonb(row) INTO creator_member_payload
    FROM (
      SELECT m.id , m.name
      FROM "public"."members" m
      WHERE m.id = creator_member_id
    ) row;

    -- Create payload of participant Members in the Order
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', row.member_id,
        'name', row.name
      )
    ) INTO participant_members_arr_payload
    FROM (
      SELECT m.id, m.name
      FROM "public"."orders_members" om
      INNER JOIN "public"."members" m ON om.member_id = m.id
      WHERE om.order_id = new_order.id AND om.member_id != creator_member_id AND m.id != creator_member_id
    ) row;

    SELECT jsonb_build_object(
      'order', to_jsonb(new_order),
      'creator_member', creator_member_payload,
      'participant_members', participant_members_arr_payload
    ) INTO payload;

    -- Get topic placeholder name
    SELECT cbm.topic INTO topic_name
    FROM "public"."custom_broadcast_messages" cbm
    WHERE cbm.id = 1;

    PERFORM "realtime".send(
      payload,
      'ORDER_CREATED',
      topic_name || target_group_id,
      false
    );

    RETURN new_order;
  END;
$$ LANGUAGE PLPGSQL;
