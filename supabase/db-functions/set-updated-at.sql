-- General trigger use set the 'updated_at' column for tables
CREATE OR REPLACE FUNCTION "public".set_updated_at() RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
  END;
$$ LANGUAGE PLPGSQL;
