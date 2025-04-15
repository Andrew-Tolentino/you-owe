CREATE TABLE "public"."groups" (
  "id" varchar(24) NOT NULL DEFAULT generate_bson_id() PRIMARY KEY,
  "name" varchar(50) NOT NULL,
  "password" varchar(50),
  "creator_member_id" varchar(24) NOT NULL,
  "created_at" timestamp WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
  "updated_at" timestamp WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
  "deleted_at" timestamp WITH TIME ZONE,
  "is_closed" boolean DEFAULT FALSE
  
  CONSTRAINT minimum_password_length
    CHECK (password = NULL OR length(password) > 6),

  CONSTRAINT fk_creator_member_id
    FOREIGN KEY("creator_member_id")
    REFERENCES "public"."members"(id)
);

/*
 Whenever a row is updated from the "public"."groups" table,
 we want to update the "updated_at" column with the "public".set_updated_at() trigger at the DB level.
*/
CREATE OR REPLACE TRIGGER groups_set_updated_at
  AFTER UPDATE
  ON "public"."groups"
  FOR EACH ROW
  EXECUTE PROCEDURE "public".set_updated_at();