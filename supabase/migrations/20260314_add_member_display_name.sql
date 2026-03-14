-- Add display_name to family_members so we can show names instead of UUIDs
ALTER TABLE family_members ADD COLUMN display_name TEXT;

-- Allow members to update their own display_name
CREATE POLICY "Members can update own record"
  ON family_members FOR UPDATE
  USING (user_id = auth.uid());

-- Update RPC to accept and store display_name
CREATE OR REPLACE FUNCTION join_family_by_code(code TEXT, display_name TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_id UUID;
  v_existing UUID;
BEGIN
  SELECT family_id INTO v_existing
    FROM family_members WHERE user_id = auth.uid();

  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION 'You are already in a family. Leave your current family first.';
  END IF;

  SELECT id INTO v_family_id
    FROM families WHERE invite_code = code;

  IF v_family_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code.';
  END IF;

  INSERT INTO family_members (family_id, user_id, role, display_name)
  VALUES (v_family_id, auth.uid(), 'member', display_name);

  RETURN v_family_id;
END;
$$;
