export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          locale: 'fr' | 'en';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          locale?: 'fr' | 'en';
        };
        Update: {
          email?: string | null;
          locale?: 'fr' | 'en';
        };
        Relationships: [];
      };
      watchlist_items: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          company_name: string | null;
          exchange: 'TSX' | 'NEO' | 'NASDAQ' | 'NYSE' | null;
          currency: 'CAD' | 'USD' | null;
          position: number;
          reference_price: number | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          company_name?: string | null;
          exchange?: 'TSX' | 'NEO' | 'NASDAQ' | 'NYSE' | null;
          currency?: 'CAD' | 'USD' | null;
          position?: number;
          reference_price?: number | null;
          added_at?: string;
        };
        Update: {
          symbol?: string;
          company_name?: string | null;
          exchange?: 'TSX' | 'NEO' | 'NASDAQ' | 'NYSE' | null;
          currency?: 'CAD' | 'USD' | null;
          position?: number;
          reference_price?: number | null;
        };
        Relationships: [];
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          type: 'price_above' | 'price_below' | 'buy_zone' | 'earnings' | 'ex_dividend';
          rule: 'fixed_price' | 'pct_below_high' | 'pct_below_reference' | null;
          value: number | null;
          status: 'active' | 'triggered' | 'paused';
          triggered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          type: 'price_above' | 'price_below' | 'buy_zone' | 'earnings' | 'ex_dividend';
          rule?: 'fixed_price' | 'pct_below_high' | 'pct_below_reference' | null;
          value?: number | null;
          status?: 'active' | 'triggered' | 'paused';
          triggered_at?: string | null;
        };
        Update: {
          type?: 'price_above' | 'price_below' | 'buy_zone' | 'earnings' | 'ex_dividend';
          rule?: 'fixed_price' | 'pct_below_high' | 'pct_below_reference' | null;
          value?: number | null;
          status?: 'active' | 'triggered' | 'paused';
          triggered_at?: string | null;
        };
        Relationships: [];
      };
      quotes_cache: {
        Row: {
          symbol: string;
          name: string | null;
          exchange: string | null;
          currency: string | null;
          price: number | null;
          prev_close: number | null;
          high_52w: number | null;
          sparkline: Json;
          updated_at: string;
        };
        Insert: {
          symbol: string;
          name?: string | null;
          exchange?: string | null;
          currency?: string | null;
          price?: number | null;
          prev_close?: number | null;
          high_52w?: number | null;
          sparkline?: Json;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          exchange?: string | null;
          currency?: string | null;
          price?: number | null;
          prev_close?: number | null;
          high_52w?: number | null;
          sparkline?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      events_cache: {
        Row: {
          id: string;
          symbol: string;
          type: 'earnings' | 'ex_dividend';
          date: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          type: 'earnings' | 'ex_dividend';
          date: string;
        };
        Update: {
          symbol?: string;
          type?: 'earnings' | 'ex_dividend';
          date?: string;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          platform: 'ios' | 'android';
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          platform: 'ios' | 'android';
        };
        Update: {
          token?: string;
          platform?: 'ios' | 'android';
        };
        Relationships: [];
      };
      alert_runs: {
        Row: {
          id: string;
          kind: 'quote_eval' | 'events_refresh' | 'weekly_digest' | 'push_receipts';
          status: 'ok' | 'error';
          started_at: string;
          finished_at: string | null;
          symbols_processed: number;
          alerts_triggered: number;
          error: string | null;
          details: Json | null;
        };
        Insert: {
          id?: string;
          kind: 'quote_eval' | 'events_refresh' | 'weekly_digest' | 'push_receipts';
          status: 'ok' | 'error';
          started_at?: string;
          finished_at?: string | null;
          symbols_processed?: number;
          alerts_triggered?: number;
          error?: string | null;
          details?: Json | null;
        };
        Update: {
          status?: 'ok' | 'error';
          finished_at?: string | null;
          symbols_processed?: number;
          alerts_triggered?: number;
          error?: string | null;
          details?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
