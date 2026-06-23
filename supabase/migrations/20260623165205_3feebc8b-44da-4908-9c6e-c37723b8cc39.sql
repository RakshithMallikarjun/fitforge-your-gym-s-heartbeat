
-- ============================================================
-- Multi-tenant SaaS hardening for FitForge
-- ============================================================

-- 1. Rename role gym_admin -> gym_owner (label-only change)
ALTER TYPE public.app_role RENAME VALUE 'gym_admin' TO 'gym_owner';

-- 2. Extend gyms with tenant lifecycle fields
ALTER TABLE public.gyms
  ADD COLUMN IF NOT EXISTS subscription_plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 3. Trainer <-> member assignments
CREATE TABLE IF NOT EXISTS public.trainer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, member_id)
);
CREATE INDEX IF NOT EXISTS trainer_assignments_trainer_idx ON public.trainer_assignments(trainer_id);
CREATE INDEX IF NOT EXISTS trainer_assignments_member_idx  ON public.trainer_assignments(member_id);
CREATE INDEX IF NOT EXISTS trainer_assignments_gym_idx     ON public.trainer_assignments(gym_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainer_assignments TO authenticated;
GRANT ALL ON public.trainer_assignments TO service_role;

ALTER TABLE public.trainer_assignments ENABLE ROW LEVEL SECURITY;

-- 4. Security-definer helpers
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'super_admin'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION public.is_gym_manager(_gym_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin() OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND gym_id  = _gym_id
      AND role    = 'gym_owner'::public.app_role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_trainer(_member_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trainer_assignments
    WHERE trainer_id = auth.uid()
      AND member_id  = _member_id
  )
$$;

CREATE OR REPLACE FUNCTION public.can_access_member(_member_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    _member_id = auth.uid()
    OR public.is_assigned_trainer(_member_id)
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = _member_id
        AND public.is_gym_manager(p.gym_id)
    )
$$;

-- Update legacy is_gym_staff so the gym_owner label resolves; semantic unchanged
CREATE OR REPLACE FUNCTION public.is_gym_staff(_gym_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin() OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND gym_id  = _gym_id
      AND role IN ('gym_owner'::public.app_role, 'trainer'::public.app_role)
  )
$$;

-- 5. RLS for trainer_assignments
DROP POLICY IF EXISTS "trainer_assignments_select" ON public.trainer_assignments;
CREATE POLICY "trainer_assignments_select" ON public.trainer_assignments
  FOR SELECT TO authenticated
  USING (
    trainer_id = auth.uid()
    OR member_id = auth.uid()
    OR public.is_gym_manager(gym_id)
  );

DROP POLICY IF EXISTS "trainer_assignments_write" ON public.trainer_assignments;
CREATE POLICY "trainer_assignments_write" ON public.trainer_assignments
  FOR ALL TO authenticated
  USING (public.is_gym_manager(gym_id))
  WITH CHECK (public.is_gym_manager(gym_id));

-- 6. Rewrite policies for tenant + role scoping
-- gyms: super_admin sees all, members/staff see their gym only (active gyms)
DROP POLICY IF EXISTS "Anyone authed can view their gym" ON public.gyms;
DROP POLICY IF EXISTS "Gym admins update their gym" ON public.gyms;
DROP POLICY IF EXISTS "Super admins insert gyms" ON public.gyms;

CREATE POLICY "gyms_select" ON public.gyms
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (is_active AND (
      id = public.current_user_gym_id()
      OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.gym_id = gyms.id)
    ))
  );
CREATE POLICY "gyms_insert" ON public.gyms
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());
CREATE POLICY "gyms_update" ON public.gyms
  FOR UPDATE TO authenticated USING (public.is_gym_manager(id));
CREATE POLICY "gyms_delete" ON public.gyms
  FOR DELETE TO authenticated USING (public.is_super_admin());

-- profiles
DROP POLICY IF EXISTS "Insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.is_gym_manager(gym_id)
    OR public.is_assigned_trainer(id)
  );
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_gym_manager(gym_id));
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR public.is_gym_manager(gym_id)
    OR public.is_assigned_trainer(id)
  );

-- user_roles
DROP POLICY IF EXISTS "View own roles" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_super_admin()
    OR public.is_gym_manager(gym_id)
  );
CREATE POLICY "user_roles_write" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.is_gym_manager(gym_id))
  WITH CHECK (public.is_super_admin() OR public.is_gym_manager(gym_id));

-- workout_plans
DROP POLICY IF EXISTS "Members see own plans, staff see all in gym" ON public.workout_plans;
DROP POLICY IF EXISTS "Staff create plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Staff delete plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Staff update plans" ON public.workout_plans;

CREATE POLICY "workout_plans_select" ON public.workout_plans
  FOR SELECT TO authenticated
  USING (
    member_id = auth.uid()
    OR public.is_gym_manager(gym_id)
    OR (member_id IS NOT NULL AND public.is_assigned_trainer(member_id))
    OR (is_template AND public.is_gym_staff(gym_id))
  );
CREATE POLICY "workout_plans_insert" ON public.workout_plans
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_gym_manager(gym_id)
    OR (
      public.is_gym_staff(gym_id)
      AND (member_id IS NULL OR public.is_assigned_trainer(member_id))
    )
  );
CREATE POLICY "workout_plans_update" ON public.workout_plans
  FOR UPDATE TO authenticated
  USING (
    public.is_gym_manager(gym_id)
    OR (member_id IS NOT NULL AND public.is_assigned_trainer(member_id))
  );
CREATE POLICY "workout_plans_delete" ON public.workout_plans
  FOR DELETE TO authenticated
  USING (public.is_gym_manager(gym_id));

-- fitness_assessments
DROP POLICY IF EXISTS "Members see own assessments, staff see all" ON public.fitness_assessments;
DROP POLICY IF EXISTS "Staff create assessments" ON public.fitness_assessments;
DROP POLICY IF EXISTS "Staff update assessments" ON public.fitness_assessments;

CREATE POLICY "assessments_select" ON public.fitness_assessments
  FOR SELECT TO authenticated
  USING (
    member_id = auth.uid()
    OR public.is_gym_manager(gym_id)
    OR public.is_assigned_trainer(member_id)
  );
CREATE POLICY "assessments_insert" ON public.fitness_assessments
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_gym_manager(gym_id)
    OR public.is_assigned_trainer(member_id)
  );
CREATE POLICY "assessments_update" ON public.fitness_assessments
  FOR UPDATE TO authenticated
  USING (
    public.is_gym_manager(gym_id)
    OR public.is_assigned_trainer(member_id)
  );

-- workout_logs
DROP POLICY IF EXISTS "Member create own logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Member update own logs" ON public.workout_logs;
DROP POLICY IF EXISTS "View own/gym logs" ON public.workout_logs;

CREATE POLICY "workout_logs_select" ON public.workout_logs
  FOR SELECT TO authenticated
  USING (
    member_id = auth.uid()
    OR public.can_access_member(member_id)
  );
CREATE POLICY "workout_logs_insert" ON public.workout_logs
  FOR INSERT TO authenticated
  WITH CHECK (member_id = auth.uid());
CREATE POLICY "workout_logs_update" ON public.workout_logs
  FOR UPDATE TO authenticated
  USING (member_id = auth.uid());

-- attendance
DROP POLICY IF EXISTS "Member check-in" ON public.attendance;
DROP POLICY IF EXISTS "Staff update attendance" ON public.attendance;
DROP POLICY IF EXISTS "View attendance" ON public.attendance;

CREATE POLICY "attendance_select" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    member_id = auth.uid()
    OR public.is_gym_manager(gym_id)
    OR public.is_assigned_trainer(member_id)
  );
CREATE POLICY "attendance_insert" ON public.attendance
  FOR INSERT TO authenticated
  WITH CHECK (
    member_id = auth.uid()
    OR public.is_gym_manager(gym_id)
    OR public.is_assigned_trainer(member_id)
  );
CREATE POLICY "attendance_update" ON public.attendance
  FOR UPDATE TO authenticated
  USING (
    member_id = auth.uid()
    OR public.is_gym_manager(gym_id)
  );
