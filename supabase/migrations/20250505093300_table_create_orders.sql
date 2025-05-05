CREATE TABLE "public"."orders" (
  "id" varchar(24) NOT NULL DEFAULT generate_bson_id() PRIMARY KEY,
  "group_id" varchar(24) NOT NULL,
  "creator_member_id" varchar(24) NOT NULL,
  "description" text,
  "price" numeric(8,2),
  "number_of_participants" int NOT NULL DEFAULT 1,
  "created_at" timestamp WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
  "deleted_at" timestamp WITH TIME ZONE,

  CONSTRAINT fk_group_id
    FOREIGN KEY("group_id")
    REFERENCES "public"."groups"(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_creator_member_id
    FOREIGN KEY("creator_member_id")
    REFERENCES "public"."members"(id)
);
