
-- Create role enum type
CREATE TYPE public.app_role AS ENUM ('student', 'institution', 'business');

-- 1) profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security definer function to get role without recursion
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id;
$$;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2) institutions
CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES public.profiles(id) UNIQUE NOT NULL,
  name text NOT NULL,
  country text,
  city text,
  website text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution owner can select" ON public.institutions FOR SELECT USING (owner_user_id = auth.uid());
CREATE POLICY "Institution owner can update" ON public.institutions FOR UPDATE USING (owner_user_id = auth.uid());
CREATE POLICY "Institution owner can insert" ON public.institutions FOR INSERT WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Students can view institutions" ON public.institutions FOR SELECT USING (public.get_user_role(auth.uid()) = 'student');
CREATE POLICY "Business can view institutions" ON public.institutions FOR SELECT USING (public.get_user_role(auth.uid()) = 'business');

-- 3) businesses
CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES public.profiles(id) UNIQUE NOT NULL,
  name text NOT NULL,
  industry text,
  website text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business owner can select" ON public.businesses FOR SELECT USING (owner_user_id = auth.uid());
CREATE POLICY "Business owner can update" ON public.businesses FOR UPDATE USING (owner_user_id = auth.uid());
CREATE POLICY "Business owner can insert" ON public.businesses FOR INSERT WITH CHECK (owner_user_id = auth.uid());

-- 4) students
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES public.profiles(id) UNIQUE NOT NULL,
  date_of_birth date,
  university_index text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student owner can select" ON public.students FOR SELECT USING (owner_user_id = auth.uid());
CREATE POLICY "Student owner can update" ON public.students FOR UPDATE USING (owner_user_id = auth.uid());
CREATE POLICY "Student owner can insert" ON public.students FOR INSERT WITH CHECK (owner_user_id = auth.uid());

-- 5) verification_requests
CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  institution_id uuid REFERENCES public.institutions(id) NOT NULL,
  status text CHECK (status IN ('draft','submitted','approved','rejected')) DEFAULT 'submitted',
  program_name text NOT NULL,
  degree_level text NOT NULL,
  graduation_date date NOT NULL,
  notes text,
  submitted_at timestamptz DEFAULT now(),
  decided_at timestamptz,
  decision_reason text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_vr_institution_status ON public.verification_requests(institution_id, status);
CREATE INDEX idx_vr_student ON public.verification_requests(student_user_id);

CREATE POLICY "Student can view own requests" ON public.verification_requests FOR SELECT USING (student_user_id = auth.uid());
CREATE POLICY "Student can insert own requests" ON public.verification_requests FOR INSERT WITH CHECK (student_user_id = auth.uid());
CREATE POLICY "Institution can view their requests" ON public.verification_requests FOR SELECT USING (
  institution_id IN (SELECT id FROM public.institutions WHERE owner_user_id = auth.uid())
);
CREATE POLICY "Institution can update their requests" ON public.verification_requests FOR UPDATE USING (
  institution_id IN (SELECT id FROM public.institutions WHERE owner_user_id = auth.uid())
);

-- 6) request_documents
CREATE TABLE public.request_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.verification_requests(id) ON DELETE CASCADE,
  uploader_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  doc_type text CHECK (doc_type IN ('diploma_scan','transcript','id_document','other')) NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.request_documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_rd_request ON public.request_documents(request_id);

CREATE POLICY "Uploader can view own docs" ON public.request_documents FOR SELECT USING (uploader_user_id = auth.uid());
CREATE POLICY "Uploader can insert own docs" ON public.request_documents FOR INSERT WITH CHECK (uploader_user_id = auth.uid());
CREATE POLICY "Institution can view request docs" ON public.request_documents FOR SELECT USING (
  request_id IN (
    SELECT vr.id FROM public.verification_requests vr
    JOIN public.institutions i ON vr.institution_id = i.id
    WHERE i.owner_user_id = auth.uid()
  )
);

-- 7) diplomas
CREATE TABLE public.diplomas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  institution_id uuid REFERENCES public.institutions(id) NOT NULL,
  request_id uuid REFERENCES public.verification_requests(id) UNIQUE,
  program_name text NOT NULL,
  degree_level text NOT NULL,
  graduation_date date NOT NULL,
  diploma_number text,
  status text CHECK (status IN ('active','revoked')) DEFAULT 'active',
  hash text,
  issued_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  revoke_reason text
);
ALTER TABLE public.diplomas ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_diplomas_student ON public.diplomas(student_user_id);
CREATE INDEX idx_diplomas_institution ON public.diplomas(institution_id);

CREATE POLICY "Student can view own diplomas" ON public.diplomas FOR SELECT USING (student_user_id = auth.uid());
CREATE POLICY "Institution can view issued diplomas" ON public.diplomas FOR SELECT USING (
  institution_id IN (SELECT id FROM public.institutions WHERE owner_user_id = auth.uid())
);
CREATE POLICY "Institution can insert diplomas" ON public.diplomas FOR INSERT WITH CHECK (
  institution_id IN (SELECT id FROM public.institutions WHERE owner_user_id = auth.uid())
);
CREATE POLICY "Institution can update diplomas" ON public.diplomas FOR UPDATE USING (
  institution_id IN (SELECT id FROM public.institutions WHERE owner_user_id = auth.uid())
);

-- 8) business_verification_requests
CREATE TABLE public.business_verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) NOT NULL,
  student_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  institution_id uuid REFERENCES public.institutions(id) NOT NULL,
  purpose text,
  status text CHECK (status IN ('submitted','approved','rejected')) DEFAULT 'submitted',
  submitted_at timestamptz DEFAULT now(),
  decided_at timestamptz,
  decision_reason text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.business_verification_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_bvr_business ON public.business_verification_requests(business_id);
CREATE INDEX idx_bvr_student_inst ON public.business_verification_requests(student_user_id, institution_id);

CREATE POLICY "Business can view own requests" ON public.business_verification_requests FOR SELECT USING (
  business_id IN (SELECT id FROM public.businesses WHERE owner_user_id = auth.uid())
);
CREATE POLICY "Business can insert own requests" ON public.business_verification_requests FOR INSERT WITH CHECK (
  business_id IN (SELECT id FROM public.businesses WHERE owner_user_id = auth.uid())
);
CREATE POLICY "Institution can view business requests" ON public.business_verification_requests FOR SELECT USING (
  institution_id IN (SELECT id FROM public.institutions WHERE owner_user_id = auth.uid())
);
CREATE POLICY "Institution can update business requests" ON public.business_verification_requests FOR UPDATE USING (
  institution_id IN (SELECT id FROM public.institutions WHERE owner_user_id = auth.uid())
);

-- 9) access_grants
CREATE TABLE public.access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_request_id uuid REFERENCES public.business_verification_requests(id) ON DELETE CASCADE,
  diploma_id uuid REFERENCES public.diplomas(id) NOT NULL,
  approved_by_institution_id uuid REFERENCES public.institutions(id) NOT NULL,
  approved_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  status text CHECK (status IN ('active','expired','revoked')) DEFAULT 'active'
);
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ag_diploma ON public.access_grants(diploma_id);
CREATE INDEX idx_ag_business_request ON public.access_grants(business_request_id);

CREATE POLICY "Institution can manage access grants" ON public.access_grants FOR ALL USING (
  approved_by_institution_id IN (SELECT id FROM public.institutions WHERE owner_user_id = auth.uid())
);
CREATE POLICY "Business can view own grants" ON public.access_grants FOR SELECT USING (
  business_request_id IN (
    SELECT bvr.id FROM public.business_verification_requests bvr
    JOIN public.businesses b ON bvr.business_id = b.id
    WHERE b.owner_user_id = auth.uid()
  )
);

-- Business can view diplomas they have active grants for
CREATE POLICY "Business can view granted diplomas" ON public.diplomas FOR SELECT USING (
  id IN (
    SELECT ag.diploma_id FROM public.access_grants ag
    JOIN public.business_verification_requests bvr ON ag.business_request_id = bvr.id
    JOIN public.businesses b ON bvr.business_id = b.id
    WHERE b.owner_user_id = auth.uid() AND ag.status = 'active'
  )
);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Institution can view request documents" ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT vr.student_user_id FROM public.verification_requests vr
    JOIN public.institutions i ON vr.institution_id = i.id
    WHERE i.owner_user_id = auth.uid()
  )
);

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
