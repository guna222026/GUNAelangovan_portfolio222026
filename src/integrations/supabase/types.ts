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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          date: string | null
          description: string
          id: string
          issuer: string
          published: boolean
          sort_order: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string
          id?: string
          issuer?: string
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string
          id?: string
          issuer?: string
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree: string
          description: string
          end_date: string | null
          field: string
          highlights: string[]
          id: string
          institution: string
          location: string
          published: boolean
          sort_order: number
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          degree: string
          description?: string
          end_date?: string | null
          field?: string
          highlights?: string[]
          id?: string
          institution?: string
          location?: string
          published?: boolean
          sort_order?: number
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          degree?: string
          description?: string
          end_date?: string | null
          field?: string
          highlights?: string[]
          id?: string
          institution?: string
          location?: string
          published?: boolean
          sort_order?: number
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          bullets: string[]
          created_at: string
          description: string
          end_date: string | null
          id: string
          kind: string
          location: string
          organization: string
          published: boolean
          sort_order: number
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bullets?: string[]
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          kind?: string
          location?: string
          organization?: string
          published?: boolean
          sort_order?: number
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bullets?: string[]
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          kind?: string
          location?: string
          organization?: string
          published?: boolean
          sort_order?: number
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          company: string
          created_at: string
          email: string
          id: string
          is_read: boolean
          name: string
          subject: string
        }
        Insert: {
          body: string
          company?: string
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          name: string
          subject?: string
        }
        Update: {
          body?: string
          company?: string
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          name?: string
          subject?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          about: string
          available: boolean
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          github_url: string
          headline: string
          id: string
          interests: string[]
          languages: string[]
          linkedin_url: string
          location: string
          phone: string
          resume_updated_at: string | null
          resume_url: string
          summary: string
          tagline: string
          title: string
          updated_at: string
        }
        Insert: {
          about?: string
          available?: boolean
          avatar_url?: string
          created_at?: string
          email?: string
          full_name?: string
          github_url?: string
          headline?: string
          id?: string
          interests?: string[]
          languages?: string[]
          linkedin_url?: string
          location?: string
          phone?: string
          resume_updated_at?: string | null
          resume_url?: string
          summary?: string
          tagline?: string
          title?: string
          updated_at?: string
        }
        Update: {
          about?: string
          available?: boolean
          avatar_url?: string
          created_at?: string
          email?: string
          full_name?: string
          github_url?: string
          headline?: string
          id?: string
          interests?: string[]
          languages?: string[]
          linkedin_url?: string
          location?: string
          phone?: string
          resume_updated_at?: string | null
          resume_url?: string
          summary?: string
          tagline?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_media: {
        Row: {
          caption: string
          created_at: string
          id: string
          kind: string
          project_id: string
          sort_order: number
          url: string
        }
        Insert: {
          caption?: string
          created_at?: string
          id?: string
          kind?: string
          project_id: string
          sort_order?: number
          url: string
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          kind?: string
          project_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          architecture_steps: string[]
          category: string
          cover_url: string
          created_at: string
          demo_url: string
          end_date: string | null
          featured: boolean
          features: string[]
          github_url: string
          highlights: string[]
          id: string
          implementation: string
          outcome: string
          problem: string
          published: boolean
          slug: string
          solution: string
          sort_order: number
          start_date: string | null
          subtitle: string
          summary: string
          tech_stack: string[]
          title: string
          updated_at: string
        }
        Insert: {
          architecture_steps?: string[]
          category?: string
          cover_url?: string
          created_at?: string
          demo_url?: string
          end_date?: string | null
          featured?: boolean
          features?: string[]
          github_url?: string
          highlights?: string[]
          id?: string
          implementation?: string
          outcome?: string
          problem?: string
          published?: boolean
          slug: string
          solution?: string
          sort_order?: number
          start_date?: string | null
          subtitle?: string
          summary?: string
          tech_stack?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          architecture_steps?: string[]
          category?: string
          cover_url?: string
          created_at?: string
          demo_url?: string
          end_date?: string | null
          featured?: boolean
          features?: string[]
          github_url?: string
          highlights?: string[]
          id?: string
          implementation?: string
          outcome?: string
          problem?: string
          published?: boolean
          slug?: string
          solution?: string
          sort_order?: number
          start_date?: string | null
          subtitle?: string
          summary?: string
          tech_stack?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      skill_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "skill_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      stats: {
        Row: {
          created_at: string
          icon: string
          id: string
          label: string
          published: boolean
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          label: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          label?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
