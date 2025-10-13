import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          name: string;
          location: string;
          email: string | null;
          contact_number: string;
          order: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          email?: string | null;
          contact_number: string;
          order: string;
          quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          email?: string | null;
          contact_number?: string;
          order?: string;
          quantity?: number;
          created_at?: string;
        };
      };
    };
  };
};