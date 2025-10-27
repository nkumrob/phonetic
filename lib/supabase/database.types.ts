/**
 * Supabase Database Types
 * Auto-generated types for type-safe database queries
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      reviews: {
        Row: {
          id: string
          name: string
          email: string | null
          rating: number
          title: string
          comment: string
          date: string
          verified: boolean
          approved: boolean
          helpful: number
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          rating: number
          title: string
          comment: string
          date?: string
          verified?: boolean
          approved?: boolean
          helpful?: number
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          rating?: number
          title?: string
          comment?: string
          date?: string
          verified?: boolean
          approved?: boolean
          helpful?: number
          location?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}

