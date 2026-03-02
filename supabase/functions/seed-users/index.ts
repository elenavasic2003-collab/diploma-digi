import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEST_USERS = [
  // Students
  { email: "student1@test.com", password: "Test1234!", full_name: "Marko Petrović", role: "student" },
  { email: "student2@test.com", password: "Test1234!", full_name: "Ana Jovanović", role: "student" },
  { email: "student3@test.com", password: "Test1234!", full_name: "Nikola Đorđević", role: "student" },
  { email: "student4@test.com", password: "Test1234!", full_name: "Jelena Nikolić", role: "student" },
  { email: "student5@test.com", password: "Test1234!", full_name: "Stefan Ilić", role: "student" },
  { email: "student6@test.com", password: "Test1234!", full_name: "Milica Stanković", role: "student" },
  // Institutions
  { email: "institution1@test.com", password: "Test1234!", full_name: "Univerzitet u Beogradu", role: "institution" },
  { email: "institution2@test.com", password: "Test1234!", full_name: "Univerzitet u Novom Sadu", role: "institution" },
  { email: "institution3@test.com", password: "Test1234!", full_name: "Univerzitet u Nišu", role: "institution" },
  // Businesses
  { email: "business1@test.com", password: "Test1234!", full_name: "TechCorp d.o.o.", role: "business" },
  { email: "business2@test.com", password: "Test1234!", full_name: "FinanceHub a.d.", role: "business" },
  { email: "business3@test.com", password: "Test1234!", full_name: "MediGroup d.o.o.", role: "business" },
  { email: "business4@test.com", password: "Test1234!", full_name: "EduSoft d.o.o.", role: "business" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const createdUsers: any[] = [];

    // Create auth users (trigger will create profiles)
    for (const user of TEST_USERS) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.full_name, role: user.role },
      });
      if (error) {
        // User might already exist
        if (error.message.includes("already been registered")) {
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existing = existingUsers?.users?.find((u: any) => u.email === user.email);
          if (existing) createdUsers.push({ ...user, id: existing.id });
          continue;
        }
        console.error(`Error creating ${user.email}:`, error.message);
        continue;
      }
      createdUsers.push({ ...user, id: data.user.id });
    }

    // Wait for triggers to complete
    await new Promise((r) => setTimeout(r, 2000));

    const students = createdUsers.filter((u) => u.role === "student");
    const institutions = createdUsers.filter((u) => u.role === "institution");
    const businesses = createdUsers.filter((u) => u.role === "business");

    // Create student records
    for (const s of students) {
      await supabase.from("students").upsert({
        owner_user_id: s.id,
        date_of_birth: "1998-05-15",
        university_index: `${Math.floor(Math.random() * 9000) + 1000}/${new Date().getFullYear() - 4}`,
      }, { onConflict: "owner_user_id" });
    }

    // Create institution records
    const instData = [
      { name: "Univerzitet u Beogradu", country: "Srbija", city: "Beograd", website: "https://bg.ac.rs", verified: true },
      { name: "Univerzitet u Novom Sadu", country: "Srbija", city: "Novi Sad", website: "https://uns.ac.rs", verified: true },
      { name: "Univerzitet u Nišu", country: "Srbija", city: "Niš", website: "https://ni.ac.rs", verified: false },
    ];
    const institutionIds: string[] = [];
    for (let i = 0; i < institutions.length; i++) {
      const { data } = await supabase.from("institutions").upsert({
        owner_user_id: institutions[i].id,
        ...instData[i],
      }, { onConflict: "owner_user_id" }).select("id").single();
      if (data) institutionIds.push(data.id);
    }

    // Create business records
    const bizData = [
      { name: "TechCorp d.o.o.", industry: "IT", website: "https://techcorp.rs" },
      { name: "FinanceHub a.d.", industry: "Finansije", website: "https://financehub.rs" },
      { name: "MediGroup d.o.o.", industry: "Zdravstvo", website: "https://medigroup.rs" },
      { name: "EduSoft d.o.o.", industry: "Edukacija", website: "https://edusoft.rs" },
    ];
    const businessIds: string[] = [];
    for (let i = 0; i < businesses.length; i++) {
      const { data } = await supabase.from("businesses").upsert({
        owner_user_id: businesses[i].id,
        ...bizData[i],
      }, { onConflict: "owner_user_id" }).select("id").single();
      if (data) businessIds.push(data.id);
    }

    // Create verification requests (10+)
    const programs = ["Informatika", "Elektrotehnika", "Mašinstvo", "Ekonomija", "Pravo", "Medicina"];
    const degrees = ["Osnovne studije", "Master studije"];
    const statuses = ["submitted", "submitted", "approved", "approved", "approved", "approved", "rejected", "submitted", "approved", "submitted"];
    
    const requestIds: string[] = [];
    for (let i = 0; i < 10; i++) {
      const studentIdx = i % students.length;
      const instIdx = i % institutionIds.length;
      const { data } = await supabase.from("verification_requests").insert({
        student_user_id: students[studentIdx].id,
        institution_id: institutionIds[instIdx],
        status: statuses[i],
        program_name: programs[i % programs.length],
        degree_level: degrees[i % degrees.length],
        graduation_date: `202${i % 5}-06-30`,
        notes: i % 3 === 0 ? "Molim hitnu verifikaciju" : null,
        decided_at: ["approved", "rejected"].includes(statuses[i]) ? new Date().toISOString() : null,
        decision_reason: statuses[i] === "rejected" ? "Nepotpuna dokumentacija" : statuses[i] === "approved" ? "Sve u redu" : null,
      }).select("id").single();
      if (data) requestIds.push(data.id);
    }

    // Create request_documents (20+)
    const docTypes = ["diploma_scan", "transcript", "id_document", "other"];
    for (let i = 0; i < 20; i++) {
      const reqIdx = i % requestIds.length;
      const studentIdx = i % students.length;
      await supabase.from("request_documents").insert({
        request_id: requestIds[reqIdx],
        uploader_user_id: students[studentIdx].id,
        doc_type: docTypes[i % docTypes.length],
        file_path: `documents/${students[studentIdx].id}/${requestIds[reqIdx]}/document_${i}.pdf`,
        file_name: `document_${i}.pdf`,
        mime_type: "application/pdf",
        size_bytes: Math.floor(Math.random() * 5000000) + 100000,
      });
    }

    // Create diplomas for approved requests
    const approvedRequests = statuses.map((s, i) => s === "approved" ? i : -1).filter(i => i >= 0);
    const diplomaIds: string[] = [];
    for (const i of approvedRequests) {
      if (!requestIds[i]) continue;
      const studentIdx = i % students.length;
      const instIdx = i % institutionIds.length;
      const encoder = new TextEncoder();
      const data2 = encoder.encode(`${students[studentIdx].id}-${programs[i % programs.length]}-202${i % 5}-06-30`);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data2);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      const { data } = await supabase.from("diplomas").insert({
        student_user_id: students[studentIdx].id,
        institution_id: institutionIds[instIdx],
        request_id: requestIds[i],
        program_name: programs[i % programs.length],
        degree_level: degrees[i % degrees.length],
        graduation_date: `202${i % 5}-06-30`,
        diploma_number: `DIP-${2020 + i}-${String(i + 1).padStart(4, "0")}`,
        hash,
      }).select("id").single();
      if (data) diplomaIds.push(data.id);
    }

    // Create business_verification_requests (8+)
    const bvrStatuses = ["submitted", "approved", "rejected", "submitted", "approved", "submitted", "approved", "submitted"];
    const bvrIds: string[] = [];
    for (let i = 0; i < 8; i++) {
      const bizIdx = i % businessIds.length;
      const studentIdx = i % students.length;
      const instIdx = i % institutionIds.length;
      const { data } = await supabase.from("business_verification_requests").insert({
        business_id: businessIds[bizIdx],
        student_user_id: students[studentIdx].id,
        institution_id: institutionIds[instIdx],
        purpose: ["Provera za zaposlenje", "Due diligence", "Verifikacija kvalifikacija", "Provera diplome"][i % 4],
        status: bvrStatuses[i],
        decided_at: ["approved", "rejected"].includes(bvrStatuses[i]) ? new Date().toISOString() : null,
        decision_reason: bvrStatuses[i] === "approved" ? "Odobreno" : bvrStatuses[i] === "rejected" ? "Odbijeno - nema saglasnost studenta" : null,
      }).select("id").single();
      if (data) bvrIds.push(data.id);
    }

    // Create access_grants for approved business requests
    const approvedBvrs = bvrStatuses.map((s, i) => s === "approved" ? i : -1).filter(i => i >= 0);
    for (const i of approvedBvrs) {
      if (!bvrIds[i] || diplomaIds.length === 0) continue;
      const diplomaIdx = i % diplomaIds.length;
      const instIdx = i % institutionIds.length;
      await supabase.from("access_grants").insert({
        business_request_id: bvrIds[i],
        diploma_id: diplomaIds[diplomaIdx],
        approved_by_institution_id: institutionIds[instIdx],
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return new Response(JSON.stringify({
      success: true,
      summary: {
        users_created: createdUsers.length,
        students: students.length,
        institutions: institutions.length,
        businesses: businesses.length,
        verification_requests: requestIds.length,
        documents: 20,
        diplomas: diplomaIds.length,
        business_requests: bvrIds.length,
        access_grants: approvedBvrs.length,
      },
      test_accounts: TEST_USERS.map(u => ({ email: u.email, password: u.password, role: u.role, name: u.full_name })),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
