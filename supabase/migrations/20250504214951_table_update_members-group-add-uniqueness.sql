ALTER TABLE "public"."members_groups"
ADD CONSTRAINT unique_member_id_group_id
UNIQUE(member_id, group_id);
