export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_grants: {
        Row: {
          approved_at: string | null
          approved_by_institution_id: string
          business_request_id: string | null
          diploma_id: string
          expires_at: string | null
          id: string
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by_institution_id: string
          business_request_id?: string | null
          diploma_id: string
          expires_at?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by_institution_id?: string
          business_request_id?: string | null
          diploma_id?: string
          expires_at?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_grants_approved_by_institution_id_fkey"
            columns: ["approved_by_institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_grants_business_request_id_fkey"
            columns: ["business_request_id"]
            isOneToOne: false
            referencedRelation: "business_verification_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_grants_diploma_id_fkey"
            columns: ["diploma_id"]
            isOneToOne: false
            referencedRelation: "diplomas"
            referencedColumns: ["id"]
          },
        ]
      }
      business_verification_requests: {
        Row: {
          business_id: string
          created_at: string | null
          decided_at: string | null
          decision_reason: string | null
          id: string
          institution_id: string
          purpose: string | null
          status: string | null
          student_user_id: string
          submitted_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          decided_at?: string | null
          decision_reason?: string | null
          id?: string
          institution_id: string
          purpose?: string | null
          status?: string | null
          student_user_id: string
          submitted_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          decided_at?: string | null
          decision_reason?: string | null
          id?: string
          institution_id?: string
          purpose?: string | null
          status?: string | null
          student_user_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_verification_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verification_requests_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verification_requests_student_user_id_fkey"
            columns: ["student_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          name: string
          owner_user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          owner_user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          owner_user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diplomas: {
        Row: {
          degree_level: string
          diploma_number: string | null
          graduation_date: string
          hash: string | null
          id: string
          institution_id: string
          issued_at: string | null
          program_name: string
          request_id: string | null
          revoke_reason: string | null
          revoked_at: string | null
          status: string | null
          student_user_id: string
        }
        Insert: {
          degree_level: string
          diploma_number?: string | null
          graduation_date: string
          hash?: string | null
          id?: string
          institution_id: string
          issued_at?: string | null
          program_name: string
          request_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          status?: string | null
          student_user_id: string
        }
        Update: {
          degree_level?: string
          diploma_number?: string | null
          graduation_date?: string
          hash?: string | null
          id?: string
          institution_id?: string
          issued_at?: string | null
          program_name?: string
          request_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          status?: string | null
          student_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diplomas_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diplomas_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diplomas_student_user_id_fkey"
            columns: ["student_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          name: string
          owner_user_id: string
          verified: boolean | null
          website: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          name: string
          owner_user_id: string
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          name?: string
          owner_user_id?: string
          verified?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutions_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      request_documents: {
        Row: {
          created_at: string | null
          doc_type: string
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          request_id: string | null
          size_bytes: number | null
          uploader_user_id: string
        }
        Insert: {
          created_at?: string | null
          doc_type: string
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          request_id?: string | null
          size_bytes?: number | null
          uploader_user_id: string
        }
        Update: {
          created_at?: string | null
          doc_type?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          request_id?: string | null
          size_bytes?: number | null
          uploader_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_documents_uploader_user_id_fkey"
            columns: ["uploader_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          id: string
          owner_user_id: string
          university_index: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          owner_user_id: string
          university_index?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          owner_user_id?: string
          university_index?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          created_at: string | null
          decided_at: string | null
          decision_reason: string | null
          degree_level: string
          graduation_date: string
          id: string
          institution_id: string
          notes: string | null
          program_name: string
          status: string | null
          student_user_id: string
          submitted_at: string | null
        }
        Insert: {
          created_at?: string | null
          decided_at?: string | null
          decision_reason?: string | null
          degree_level: string
          graduation_date: string
          id?: string
          institution_id: string
          notes?: string | null
          program_name: string
          status?: string | null
          student_user_id: string
          submitted_at?: string | null
        }
        Update: {
          created_at?: string | null
          decided_at?: string | null
          decision_reason?: string | null
          degree_level?: string
          graduation_date?: string
          id?: string
          institution_id?: string
          notes?: string | null
          program_name?: string
          status?: string | null
          student_user_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_student_user_id_fkey"
            columns: ["student_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "student" | "institution" | "business"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "institution", "business"],
    },
  },
} as const
