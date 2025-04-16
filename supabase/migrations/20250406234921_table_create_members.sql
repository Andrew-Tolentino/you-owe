CREATE TABLE "public"."members" (
  "id" varchar(24) NOT NULL DEFAULT generate_bson_id() PRIMARY KEY,
  "name" varchar(50) NOT NULL,
  "created_at" timestamp WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
  "deleted_at" timestamp WITH TIME ZONE,
  "auth_user_id" uuid NOT NULL UNIQUE,

  CONSTRAINT fk_members_auth_users_id
    FOREIGN KEY("auth_user_id")
      REFERENCES "auth"."users"(id)
      ON DELETE CASCADE
);
