/**
 * @file database.ts
 * @description TypeScript types for Supabase database schema.
 * These types should be regenerated using `npx supabase gen types typescript`
 * after applying migrations.
 *
 * @exports Database - Main database type
 * @exports Tables - Table row types
 * @exports Enums - Enum types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      action_logs: {
        Row: {
          id: string
          document_id: string
          user_id: string
          action: Database['public']['Enums']['action_type']
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          action: Database['public']['Enums']['action_type']
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          action?: Database['public']['Enums']['action_type']
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'action_logs_document_id_fkey'
            columns: ['document_id']
            isOneToOne: false
            referencedRelation: 'documents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'action_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      documents: {
        Row: {
          id: string
          firm_id: string
          created_by: string
          template_id: string | null
          title: string
          content: Json
          status: Database['public']['Enums']['document_status']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firm_id: string
          created_by: string
          template_id?: string | null
          title: string
          content?: Json
          status?: Database['public']['Enums']['document_status']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          firm_id?: string
          created_by?: string
          template_id?: string | null
          title?: string
          content?: Json
          status?: Database['public']['Enums']['document_status']
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documents_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_firm_id_fkey'
            columns: ['firm_id']
            isOneToOne: false
            referencedRelation: 'firms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'templates'
            referencedColumns: ['id']
          },
        ]
      }
      firm_users: {
        Row: {
          id: string
          firm_id: string
          user_id: string
          role: Database['public']['Enums']['user_role']
          created_at: string
        }
        Insert: {
          id?: string
          firm_id: string
          user_id: string
          role?: Database['public']['Enums']['user_role']
          created_at?: string
        }
        Update: {
          id?: string
          firm_id?: string
          user_id?: string
          role?: Database['public']['Enums']['user_role']
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'firm_users_firm_id_fkey'
            columns: ['firm_id']
            isOneToOne: false
            referencedRelation: 'firms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'firm_users_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      firms: {
        Row: {
          id: string
          name: string
          invite_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      source_files: {
        Row: {
          id: string
          document_id: string
          firm_id: string
          uploaded_by: string
          storage_path: string
          original_name: string
          mime_type: string
          size_bytes: number
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          firm_id: string
          uploaded_by: string
          storage_path: string
          original_name: string
          mime_type: string
          size_bytes: number
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          firm_id?: string
          uploaded_by?: string
          storage_path?: string
          original_name?: string
          mime_type?: string
          size_bytes?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'source_files_document_id_fkey'
            columns: ['document_id']
            isOneToOne: false
            referencedRelation: 'documents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'source_files_firm_id_fkey'
            columns: ['firm_id']
            isOneToOne: false
            referencedRelation: 'firms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'source_files_uploaded_by_fkey'
            columns: ['uploaded_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      templates: {
        Row: {
          id: string
          firm_id: string
          created_by: string
          name: string
          description: string | null
          content: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firm_id: string
          created_by: string
          name: string
          description?: string | null
          content?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          firm_id?: string
          created_by?: string
          name?: string
          description?: string | null
          content?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'templates_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'templates_firm_id_fkey'
            columns: ['firm_id']
            isOneToOne: false
            referencedRelation: 'firms'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      document_latest_action: {
        Row: {
          document_id: string | null
          action: Database['public']['Enums']['action_type'] | null
          user_id: string | null
          created_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'action_logs_document_id_fkey'
            columns: ['document_id']
            isOneToOne: false
            referencedRelation: 'documents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'action_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
      log_document_action: {
        Args: {
          p_document_id: string
          p_action: Database['public']['Enums']['action_type']
          p_metadata?: Json
        }
        Returns: string
      }
    }
    Enums: {
      action_type: 'generated' | 'edited' | 'exported'
      document_status: 'draft' | 'generated' | 'edited' | 'exported'
      user_role: 'admin' | 'attorney' | 'paralegal'
    }
  }
}

// =============================================================================
// CONVENIENCE TYPES
// =============================================================================

/** Shorthand for table row types */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

/** Shorthand for table insert types */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

/** Shorthand for table update types */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

/** Shorthand for enum types */
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// =============================================================================
// ENTITY TYPES
// =============================================================================

/** Firm entity */
export type Firm = Tables<'firms'>

/** User profile entity */
export type Profile = Tables<'profiles'>

/** Firm user membership entity */
export type FirmUser = Tables<'firm_users'>

/** Document entity */
export type Document = Tables<'documents'>

/** Template entity */
export type Template = Tables<'templates'>

/** Source file entity */
export type SourceFile = Tables<'source_files'>

/** Action log entity */
export type ActionLog = Tables<'action_logs'>

/** User role enum type */
export type UserRole = Enums<'user_role'>

/** Document status enum type */
export type DocumentStatus = Enums<'document_status'>

/** Action type enum type */
export type ActionType = Enums<'action_type'>

