-- ============================================================================
-- Family Collaboration Feature — Schema, RLS, and RPC
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- ── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE families (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE family_members (
  id         BIGSERIAL PRIMARY KEY,
  family_id  UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)  -- one family per user
);

CREATE TABLE family_categories (
  id         TEXT PRIMARY KEY,
  family_id  UUID REFERENCES families(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  amount     NUMERIC NOT NULL DEFAULT 0,
  type       TEXT NOT NULL,
  color      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE family_tracking (
  id          BIGSERIAL PRIMARY KEY,
  family_id   UUID REFERENCES families(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES family_categories(id) ON DELETE CASCADE,
  year        INT NOT NULL,
  month       INT NOT NULL,
  value       JSONB DEFAULT 'false',
  UNIQUE(family_id, category_id, year, month)
);

CREATE TABLE family_settings (
  family_id       UUID PRIMARY KEY REFERENCES families(id) ON DELETE CASCADE,
  currency_symbol TEXT DEFAULT '₹',
  current_year    INT DEFAULT EXTRACT(YEAR FROM now())
);

CREATE TABLE family_tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID REFERENCES families(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  assignee_id UUID REFERENCES auth.users(id),
  due_date    DATE,
  is_done     BOOLEAN DEFAULT false,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Helper: get current user's family (must come after tables) ──────────────

CREATE OR REPLACE FUNCTION get_user_family_id()
RETURNS UUID AS $$
  SELECT family_id FROM family_members WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_tasks ENABLE ROW LEVEL SECURITY;

-- families: members can read their own family (OR creator, for the insert→select flow)
CREATE POLICY "Users can view own family"
  ON families FOR SELECT
  USING (id = get_user_family_id() OR created_by = auth.uid());

-- families: anyone authenticated can insert (creating a new family)
CREATE POLICY "Authenticated users can create families"
  ON families FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- families: only creator can update
CREATE POLICY "Owner can update family"
  ON families FOR UPDATE
  USING (created_by = auth.uid());

-- families: only creator can delete
CREATE POLICY "Owner can delete family"
  ON families FOR DELETE
  USING (created_by = auth.uid());

-- family_members: members can see fellow members
CREATE POLICY "Members can view family members"
  ON family_members FOR SELECT
  USING (family_id = get_user_family_id());

-- family_members: insert allowed (join_family_by_code RPC handles validation)
CREATE POLICY "Allow member insert"
  ON family_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- family_members: user can delete own membership, owner can delete any in their family
CREATE POLICY "Members can leave or owner can remove"
  ON family_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR (
      family_id = get_user_family_id()
      AND EXISTS (
        SELECT 1 FROM family_members
        WHERE family_id = get_user_family_id()
          AND user_id = auth.uid()
          AND role = 'owner'
      )
    )
  );

-- family_categories: CRUD for family members
CREATE POLICY "Members can view family categories"
  ON family_categories FOR SELECT
  USING (family_id = get_user_family_id());

CREATE POLICY "Members can insert family categories"
  ON family_categories FOR INSERT
  WITH CHECK (family_id = get_user_family_id());

CREATE POLICY "Members can update family categories"
  ON family_categories FOR UPDATE
  USING (family_id = get_user_family_id());

CREATE POLICY "Members can delete family categories"
  ON family_categories FOR DELETE
  USING (family_id = get_user_family_id());

-- family_tracking: CRUD for family members
CREATE POLICY "Members can view family tracking"
  ON family_tracking FOR SELECT
  USING (family_id = get_user_family_id());

CREATE POLICY "Members can insert family tracking"
  ON family_tracking FOR INSERT
  WITH CHECK (family_id = get_user_family_id());

CREATE POLICY "Members can update family tracking"
  ON family_tracking FOR UPDATE
  USING (family_id = get_user_family_id());

CREATE POLICY "Members can delete family tracking"
  ON family_tracking FOR DELETE
  USING (family_id = get_user_family_id());

-- family_settings: CRUD for family members
CREATE POLICY "Members can view family settings"
  ON family_settings FOR SELECT
  USING (family_id = get_user_family_id());

CREATE POLICY "Members can insert family settings"
  ON family_settings FOR INSERT
  WITH CHECK (family_id = get_user_family_id());

CREATE POLICY "Members can update family settings"
  ON family_settings FOR UPDATE
  USING (family_id = get_user_family_id());

-- family_tasks: CRUD for family members
CREATE POLICY "Members can view family tasks"
  ON family_tasks FOR SELECT
  USING (family_id = get_user_family_id());

CREATE POLICY "Members can insert family tasks"
  ON family_tasks FOR INSERT
  WITH CHECK (family_id = get_user_family_id());

CREATE POLICY "Members can update family tasks"
  ON family_tasks FOR UPDATE
  USING (family_id = get_user_family_id());

CREATE POLICY "Members can delete family tasks"
  ON family_tasks FOR DELETE
  USING (family_id = get_user_family_id());

-- ── RPC: join family by invite code ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION join_family_by_code(code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_id UUID;
  v_existing UUID;
BEGIN
  -- Check if user is already in a family
  SELECT family_id INTO v_existing
    FROM family_members
   WHERE user_id = auth.uid();

  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION 'You are already in a family. Leave your current family first.';
  END IF;

  -- Look up family by invite code
  SELECT id INTO v_family_id
    FROM families
   WHERE invite_code = code;

  IF v_family_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code.';
  END IF;

  -- Insert membership
  INSERT INTO family_members (family_id, user_id, role)
  VALUES (v_family_id, auth.uid(), 'member');

  RETURN v_family_id;
END;
$$;
