
-- =========== ENUMS ===========
CREATE TYPE public.app_role AS ENUM ('super_admin', 'gym_admin', 'trainer', 'member');
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- =========== GYMS ===========
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#ff6b35',
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gyms TO authenticated;
GRANT ALL ON public.gyms TO service_role;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  -- Member fitness data
  date_of_birth DATE,
  gender public.gender_type,
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),
  goals TEXT,
  medical_notes TEXT,
  -- Trainer info
  bio TEXT,
  specialties TEXT[],
  certifications TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========== USER ROLES ===========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, gym_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =========== SECURITY HELPERS ===========
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.current_user_gym_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT gym_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_gym_staff(_gym_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND gym_id = _gym_id
      AND role IN ('gym_admin', 'trainer')
  ) OR public.has_role(auth.uid(), 'super_admin')
$$;

-- =========== EXERCISES ===========
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  muscle_group TEXT,
  equipment TEXT,
  difficulty TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- =========== WORKOUT PLANS ===========
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_template BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_plans TO authenticated;
GRANT ALL ON public.workout_plans TO service_role;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workout_plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  day_of_week INT,
  sets INT,
  reps TEXT,
  rest_seconds INT,
  weight_kg NUMERIC(6,2),
  order_index INT NOT NULL DEFAULT 0,
  notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_plan_exercises TO authenticated;
GRANT ALL ON public.workout_plan_exercises TO service_role;
ALTER TABLE public.workout_plan_exercises ENABLE ROW LEVEL SECURITY;

-- =========== FITNESS ASSESSMENTS ===========
CREATE TABLE public.fitness_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,2),
  body_fat_pct NUMERIC(4,1),
  muscle_mass_kg NUMERIC(5,2),
  chest_cm NUMERIC(5,1),
  waist_cm NUMERIC(5,1),
  hips_cm NUMERIC(5,1),
  arms_cm NUMERIC(5,1),
  thighs_cm NUMERIC(5,1),
  resting_hr INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fitness_assessments TO authenticated;
GRANT ALL ON public.fitness_assessments TO service_role;
ALTER TABLE public.fitness_assessments ENABLE ROW LEVEL SECURITY;

-- =========== ATTENDANCE ===========
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- =========== WORKOUT LOGS ===========
CREATE TABLE public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_exercise_id UUID REFERENCES public.workout_plan_exercises(id) ON DELETE SET NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sets_completed INT,
  reps_completed TEXT,
  weight_kg NUMERIC(6,2),
  notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_logs TO authenticated;
GRANT ALL ON public.workout_logs TO service_role;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- =========== POLICIES ===========

-- gyms: staff of gym or super_admin can see; gym_admins can update; super_admin can insert
CREATE POLICY "Anyone authed can view their gym" ON public.gyms FOR SELECT TO authenticated
  USING (id = public.current_user_gym_id() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins insert gyms" ON public.gyms FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Gym admins update their gym" ON public.gyms FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR (id = public.current_user_gym_id() AND EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND gym_id = gyms.id AND role = 'gym_admin'
  )));

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_gym_staff(gym_id));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_gym_staff(gym_id));
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_gym_staff(gym_id));

-- user_roles: users can view their own roles; super_admin can view all
CREATE POLICY "View own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin') OR public.is_gym_staff(gym_id));

-- exercises: gym staff manage gym exercises; everyone in gym can read
CREATE POLICY "View gym exercises" ON public.exercises FOR SELECT TO authenticated
  USING (gym_id IS NULL OR gym_id = public.current_user_gym_id());
CREATE POLICY "Staff manage exercises" ON public.exercises FOR INSERT TO authenticated
  WITH CHECK (public.is_gym_staff(gym_id));
CREATE POLICY "Staff update exercises" ON public.exercises FOR UPDATE TO authenticated
  USING (public.is_gym_staff(gym_id));
CREATE POLICY "Staff delete exercises" ON public.exercises FOR DELETE TO authenticated
  USING (public.is_gym_staff(gym_id));

-- workout_plans
CREATE POLICY "Members see own plans, staff see all in gym" ON public.workout_plans FOR SELECT TO authenticated
  USING (member_id = auth.uid() OR public.is_gym_staff(gym_id));
CREATE POLICY "Staff create plans" ON public.workout_plans FOR INSERT TO authenticated
  WITH CHECK (public.is_gym_staff(gym_id));
CREATE POLICY "Staff update plans" ON public.workout_plans FOR UPDATE TO authenticated
  USING (public.is_gym_staff(gym_id));
CREATE POLICY "Staff delete plans" ON public.workout_plans FOR DELETE TO authenticated
  USING (public.is_gym_staff(gym_id));

-- workout_plan_exercises (scoped via plan)
CREATE POLICY "View plan exercises" ON public.workout_plan_exercises FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workout_plans p WHERE p.id = plan_id AND (p.member_id = auth.uid() OR public.is_gym_staff(p.gym_id))));
CREATE POLICY "Staff manage plan exercises insert" ON public.workout_plan_exercises FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_plans p WHERE p.id = plan_id AND public.is_gym_staff(p.gym_id)));
CREATE POLICY "Staff manage plan exercises update" ON public.workout_plan_exercises FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workout_plans p WHERE p.id = plan_id AND public.is_gym_staff(p.gym_id)));
CREATE POLICY "Staff manage plan exercises delete" ON public.workout_plan_exercises FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workout_plans p WHERE p.id = plan_id AND public.is_gym_staff(p.gym_id)));

-- fitness_assessments
CREATE POLICY "Members see own assessments, staff see all" ON public.fitness_assessments FOR SELECT TO authenticated
  USING (member_id = auth.uid() OR public.is_gym_staff(gym_id));
CREATE POLICY "Staff create assessments" ON public.fitness_assessments FOR INSERT TO authenticated
  WITH CHECK (public.is_gym_staff(gym_id));
CREATE POLICY "Staff update assessments" ON public.fitness_assessments FOR UPDATE TO authenticated
  USING (public.is_gym_staff(gym_id));

-- attendance
CREATE POLICY "View attendance" ON public.attendance FOR SELECT TO authenticated
  USING (member_id = auth.uid() OR public.is_gym_staff(gym_id));
CREATE POLICY "Member check-in" ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (member_id = auth.uid() OR public.is_gym_staff(gym_id));
CREATE POLICY "Staff update attendance" ON public.attendance FOR UPDATE TO authenticated
  USING (public.is_gym_staff(gym_id) OR member_id = auth.uid());

-- workout_logs
CREATE POLICY "View own/gym logs" ON public.workout_logs FOR SELECT TO authenticated
  USING (member_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = member_id AND public.is_gym_staff(p.gym_id)
  ));
CREATE POLICY "Member create own logs" ON public.workout_logs FOR INSERT TO authenticated
  WITH CHECK (member_id = auth.uid());
CREATE POLICY "Member update own logs" ON public.workout_logs FOR UPDATE TO authenticated
  USING (member_id = auth.uid());

-- =========== TRIGGERS ===========
CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_gyms_updated BEFORE UPDATE ON public.gyms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.workout_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile + member role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
