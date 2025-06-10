INSERT INTO "public"."custom_broadcast_messages"
(id, topic, topic_naming_instructions, events, topic_description, where_topic_is_referenced)
VALUES 
  (
    1,
    'orders_group-',
    'orders_group-<group_id> where the group_id is the ID of Group the Order belongs to.',
    $${
        "ORDER_CREATED": "A new Order has been created.",
        "ORDER_UPDATED": "An Order has been updated"
      }$$,
    'This topic is used whenever Orders for a Group are created or updated. This helps with any applications listening for any updates on Orders for a specific Group.',
    $${
        "public.create_new_order()": "Fires an ORDER_CREATED event type after creating an Order.",
        "public.send_order_update_broadcast_trigger()": "Fires an ORDER_UPDATED event type as a trigger on the Orders table after an Order has been updated."
      }$$
  );
