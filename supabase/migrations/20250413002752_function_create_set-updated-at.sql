-- set_updated_at() is a general trigger use set the 'updated_at' column for tables
CREATE OR REPLACE FUNCTION "public".set_updated_at() RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = timezone('utc', NOW());
    RETURN NEW;
  END;
$$ LANGUAGE PLPGSQL;
