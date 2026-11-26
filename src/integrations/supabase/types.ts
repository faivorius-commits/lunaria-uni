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
    PostgrestVersion: "17.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          event_date: string
          id: string
          note: string
          start_time: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          note?: string
          start_time?: string | null
          title: string
          user_id?: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          note?: string
          start_time?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description: string
          emoji: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          emoji?: string
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string
          emoji?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          created_at: string
          day: string
          gratitude: string
          id: string
          intention: string
          mood: string
          user_id: string
          water: number
        }
        Insert: {
          created_at?: string
          day?: string
          gratitude?: string
          id?: string
          intention?: string
          mood?: string
          user_id?: string
          water?: number
        }
        Update: {
          created_at?: string
          day?: string
          gratitude?: string
          id?: string
          intention?: string
          mood?: string
          user_id?: string
          water?: number
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          body: string
          created_at: string
          id: string
          mood: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          mood?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          mood?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      explore_links: {
        Row: {
          created_at: string
          id: string
          note: string
          title: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string
          title: string
          url: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      garden_habits: {
        Row: {
          created_at: string
          emoji: string
          frequency: string
          frequency_mode: string
          frequency_target: number
          id: string
          name: string
          target_days: number[]
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          frequency?: string
          frequency_mode?: string
          frequency_target?: number
          id?: string
          name: string
          target_days?: number[]
          user_id?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          frequency?: string
          frequency_mode?: string
          frequency_target?: number
          id?: string
          name?: string
          target_days?: number[]
          user_id?: string
        }
        Relationships: []
      }
      habit_checkins: {
        Row: {
          day: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          day?: string
          habit_id: string
          id?: string
          user_id?: string
        }
        Update: {
          day?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_checkins_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "garden_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          tags?: string[]
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lunaria_tasks: {
        Row: {
          assigned_by: string
          completed_at: string | null
          created_at: string
          description: string
          done: boolean
          due_date: string | null
          id: string
          labels: string[]
          progress: number
          status: string
          task_type: string
          title: string
          user_id: string
        }
        Insert: {
          assigned_by?: string
          completed_at?: string | null
          created_at?: string
          description?: string
          done?: boolean
          due_date?: string | null
          id?: string
          labels?: string[]
          progress?: number
          status?: string
          task_type?: string
          title: string
          user_id?: string
        }
        Update: {
          assigned_by?: string
          completed_at?: string | null
          created_at?: string
          description?: string
          done?: boolean
          due_date?: string | null
          id?: string
          labels?: string[]
          progress?: number
          status?: string
          task_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_emoji: string
          created_at: string
          display_name: string
          id: string
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_emoji?: string
          created_at?: string
          display_name?: string
          id: string
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_emoji?: string
          created_at?: string
          display_name?: string
          id?: string
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          category: string
          cook_minutes: number
          created_at: string
          description: string
          difficulty: string
          id: string
          ingredients: string[]
          prep_minutes: number
          steps: string[]
          title: string
          tools: string[]
          user_id: string
        }
        Insert: {
          category?: string
          cook_minutes?: number
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          ingredients?: string[]
          prep_minutes?: number
          steps?: string[]
          title: string
          tools?: string[]
          user_id?: string
        }
        Update: {
          category?: string
          cook_minutes?: number
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          ingredients?: string[]
          prep_minutes?: number
          steps?: string[]
          title?: string
          tools?: string[]
          user_id?: string
        }
        Relationships: []
      }
      task_progress_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          progress_note: string
          progress_percent: number
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          progress_note: string
          progress_percent?: number
          task_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          progress_note?: string
          progress_percent?: number
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_progress_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lunaria_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_files: {
        Row: {
          caption: string
          category: string
          collection_id: string | null
          created_at: string
          id: string
          memory_category: string
          memory_date: string | null
          memory_location: string
          memory_tags: string[]
          memory_title: string
          mime_type: string
          name: string
          size_bytes: number
          storage_path: string
          user_id: string
        }
        Insert: {
          caption?: string
          category?: string
          collection_id?: string | null
          created_at?: string
          id?: string
          memory_category?: string
          memory_date?: string | null
          memory_location?: string
          memory_tags?: string[]
          memory_title?: string
          mime_type?: string
          name: string
          size_bytes?: number
          storage_path: string
          user_id?: string
        }
        Update: {
          caption?: string
          category?: string
          collection_id?: string | null
          created_at?: string
          id?: string
          memory_category?: string
          memory_date?: string | null
          memory_location?: string
          memory_tags?: string[]
          memory_title?: string
          mime_type?: string
          name?: string
          size_bytes?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_files_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
