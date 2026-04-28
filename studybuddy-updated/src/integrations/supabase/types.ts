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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          receiver_id: string
          sender_id: string
          shared_location: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          receiver_id: string
          sender_id: string
          shared_location?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          receiver_id?: string
          sender_id?: string
          shared_location?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          course_name: string
          id: string
        }
        Insert: {
          course_name: string
          id?: string
        }
        Update: {
          course_name?: string
          id?: string
        }
        Relationships: []
      }
      matching_preferences: {
        Row: {
          proximity: string | null
          user_id: string
        }
        Insert: {
          proximity?: string | null
          user_id: string
        }
        Update: {
          proximity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability_status: boolean | null
          available_until: string | null
          avatar_url: string | null
          created_at: string | null
          current_location: string | null
          email: string
          full_name: string
          id: string
          major: string | null
        }
        Insert: {
          availability_status?: boolean | null
          available_until?: string | null
          avatar_url?: string | null
          created_at?: string | null
          current_location?: string | null
          email: string
          full_name: string
          id: string
          major?: string | null
        }
        Update: {
          availability_status?: boolean | null
          available_until?: string | null
          avatar_url?: string | null
          created_at?: string | null
          current_location?: string | null
          email?: string
          full_name?: string
          id?: string
          major?: string | null
        }
        Relationships: []
      }
      study_requests: {
        Row: {
          course_name: string | null
          created_at: string | null
          id: string
          receiver_id: string
          sender_id: string
          session_id: string | null
          status: string | null
        }
        Insert: {
          course_name?: string | null
          created_at?: string | null
          id?: string
          receiver_id: string
          sender_id: string
          session_id?: string | null
          status?: string | null
        }
        Update: {
          course_name?: string | null
          created_at?: string | null
          id?: string
          receiver_id?: string
          sender_id?: string
          session_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          checklist_progress: Json | null
          completed_at: string | null
          course_name: string | null
          created_at: string | null
          feedback_rating: number | null
          id: string
          notes: string | null
          quiz_score: number | null
          timer_duration: number | null
          user1_id: string
          user2_id: string | null
        }
        Insert: {
          checklist_progress?: Json | null
          completed_at?: string | null
          course_name?: string | null
          created_at?: string | null
          feedback_rating?: number | null
          id?: string
          notes?: string | null
          quiz_score?: number | null
          timer_duration?: number | null
          user1_id: string
          user2_id?: string | null
        }
        Update: {
          checklist_progress?: Json | null
          completed_at?: string | null
          course_name?: string | null
          created_at?: string | null
          feedback_rating?: number | null
          id?: string
          notes?: string | null
          quiz_score?: number | null
          timer_duration?: number | null
          user1_id?: string
          user2_id?: string | null
        }
        Relationships: []
      }
      user_courses: {
        Row: {
          course_id: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
