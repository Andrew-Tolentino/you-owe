/*
 Whenever a row is updated from the "public"."orders" table,
 we want to update the "updated_at" column with the "public".set_updated_at() trigger at the DB level.
*/
CREATE OR REPLACE TRIGGER orders_set_updated_at
BEFORE UPDATE
ON "public"."orders"
FOR EACH ROW
EXECUTE PROCEDURE "public".set_updated_at();

/*
 Whenever a row is updated from the "public"."members" table,
 we want to update the "updated_at" column with the "public".set_updated_at() trigger at the DB level.
*/
CREATE OR REPLACE TRIGGER members_set_updated_at
BEFORE UPDATE
ON "public"."members"
FOR EACH ROW
EXECUTE PROCEDURE "public".set_updated_at();
