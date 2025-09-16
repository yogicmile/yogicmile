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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string
          emoji: string
          id: string
          progress_data: Json | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description: string
          emoji: string
          id?: string
          progress_data?: Json | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string
          emoji?: string
          id?: string
          progress_data?: Json | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ad_logs: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          location: Json | null
          page: string
          session_id: string | null
          timestamp: string
          type: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          location?: Json | null
          page: string
          session_id?: string | null
          timestamp?: string
          type: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          location?: Json | null
          page?: string
          session_id?: string | null
          timestamp?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_logs_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          active_from: string
          active_to: string
          advertiser: string
          created_at: string
          id: string
          image_url: string
          link_url: string
          regions: string[]
          status: string
          text: string
          updated_at: string
        }
        Insert: {
          active_from?: string
          active_to?: string
          advertiser: string
          created_at?: string
          id?: string
          image_url: string
          link_url: string
          regions?: string[]
          status?: string
          text: string
          updated_at?: string
        }
        Update: {
          active_from?: string
          active_to?: string
          advertiser?: string
          created_at?: string
          id?: string
          image_url?: string
          link_url?: string
          regions?: string[]
          status?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bonus_logs: {
        Row: {
          amount_paisa: number
          bonus_type: string
          created_at: string
          date_earned: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount_paisa: number
          bonus_type: string
          created_at?: string
          date_earned?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount_paisa?: number
          bonus_type?: string
          created_at?: string
          date_earned?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          id: string
          redemption_code: string | null
          status: string
          timestamp: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          id?: string
          redemption_code?: string | null
          status?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          id?: string
          redemption_code?: string | null
          status?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          created_at: string
          description: string
          discount_percent: number
          expiry_date: string
          id: string
          image_url: string | null
          merchant_name: string
          min_steps_required: number
          regions: string[]
          status: string
          terms: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          discount_percent: number
          expiry_date: string
          id?: string
          image_url?: string | null
          merchant_name: string
          min_steps_required?: number
          regions?: string[]
          status?: string
          terms?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discount_percent?: number
          expiry_date?: string
          id?: string
          image_url?: string | null
          merchant_name?: string
          min_steps_required?: number
          regions?: string[]
          status?: string
          terms?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_steps: {
        Row: {
          capped_steps: number
          created_at: string
          date: string
          id: string
          is_redeemed: boolean | null
          paisa_earned: number
          phase_id: number
          phase_rate: number
          redeemed_at: string | null
          steps: number
          units_earned: number
          user_id: string
        }
        Insert: {
          capped_steps?: number
          created_at?: string
          date: string
          id?: string
          is_redeemed?: boolean | null
          paisa_earned?: number
          phase_id?: number
          phase_rate?: number
          redeemed_at?: string | null
          steps?: number
          units_earned?: number
          user_id: string
        }
        Update: {
          capped_steps?: number
          created_at?: string
          date?: string
          id?: string
          is_redeemed?: boolean | null
          paisa_earned?: number
          phase_id?: number
          phase_rate?: number
          redeemed_at?: string | null
          steps?: number
          units_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      otp_logs: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_used: boolean | null
          mobile_number: string
          otp: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          mobile_number: string
          otp: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          mobile_number?: string
          otp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "otp_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otp_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_wallet"
            referencedColumns: ["user_id"]
          },
        ]
      }
      otp_rate_limits: {
        Row: {
          attempts: number
          blocked_until: string | null
          created_at: string
          id: string
          mobile_number: string
          updated_at: string
          window_start: string
        }
        Insert: {
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          mobile_number: string
          updated_at?: string
          window_start?: string
        }
        Update: {
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          mobile_number?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      phases: {
        Row: {
          days_limit: number
          id: number
          name: string
          paisa_rate: number
          step_goal: number
          symbol: string | null
        }
        Insert: {
          days_limit: number
          id?: number
          name: string
          paisa_rate: number
          step_goal: number
          symbol?: string | null
        }
        Update: {
          days_limit?: number
          id?: number
          name?: string
          paisa_rate?: number
          step_goal?: number
          symbol?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          coins_spent: number
          created_at: string | null
          id: number
          reward_id: number | null
          status: Database["public"]["Enums"]["redemption_status"] | null
          user_id: string | null
        }
        Insert: {
          coins_spent: number
          created_at?: string | null
          id?: number
          reward_id?: number | null
          status?: Database["public"]["Enums"]["redemption_status"] | null
          user_id?: string | null
        }
        Update: {
          coins_spent?: number
          created_at?: string | null
          id?: number
          reward_id?: number | null
          status?: Database["public"]["Enums"]["redemption_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_wallet"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_paisa: number | null
          created_at: string | null
          id: number
          referred_id: string | null
          referrer_id: string | null
        }
        Insert: {
          bonus_paisa?: number | null
          created_at?: string | null
          id?: number
          referred_id?: string | null
          referrer_id?: string | null
        }
        Update: {
          bonus_paisa?: number | null
          created_at?: string | null
          id?: number
          referred_id?: string | null
          referrer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "v_user_wallet"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "v_user_wallet"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referrals_new: {
        Row: {
          created_at: string
          id: string
          referee_bonus_paisa: number
          referee_mobile: string
          referrer_bonus_paisa: number
          referrer_mobile: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          referee_bonus_paisa?: number
          referee_mobile: string
          referrer_bonus_paisa?: number
          referrer_mobile: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referee_bonus_paisa?: number
          referee_mobile?: string
          referrer_bonus_paisa?: number
          referrer_mobile?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          created_at: string | null
          expiry_date: string | null
          id: number
          is_active: boolean | null
          name: string
          required_paisa: number
          type: Database["public"]["Enums"]["reward_type"]
        }
        Insert: {
          created_at?: string | null
          expiry_date?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          required_paisa: number
          type: Database["public"]["Enums"]["reward_type"]
        }
        Update: {
          created_at?: string | null
          expiry_date?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          required_paisa?: number
          type?: Database["public"]["Enums"]["reward_type"]
        }
        Relationships: []
      }
      share_logs: {
        Row: {
          content_shared: string | null
          created_at: string
          id: string
          platform: string | null
          share_context: string | null
          share_type: string
          timestamp: string
          user_id: string
        }
        Insert: {
          content_shared?: string | null
          created_at?: string
          id?: string
          platform?: string | null
          share_context?: string | null
          share_type: string
          timestamp?: string
          user_id: string
        }
        Update: {
          content_shared?: string | null
          created_at?: string
          id?: string
          platform?: string | null
          share_context?: string | null
          share_type?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      spin_results: {
        Row: {
          created_at: string
          date: string
          id: string
          reward_amount: number | null
          reward_description: string
          reward_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          reward_amount?: number | null
          reward_description: string
          reward_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          reward_amount?: number | null
          reward_description?: string
          reward_type?: string
          user_id?: string
        }
        Relationships: []
      }
      step_logs: {
        Row: {
          coins_earned: number
          created_at: string | null
          date: string
          id: number
          steps: number
          user_id: string | null
          validated: boolean | null
        }
        Insert: {
          coins_earned?: number
          created_at?: string | null
          date: string
          id?: number
          steps: number
          user_id?: string | null
          validated?: boolean | null
        }
        Update: {
          coins_earned?: number
          created_at?: string | null
          date?: string
          id?: number
          steps?: number
          user_id?: string | null
          validated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "step_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_wallet"
            referencedColumns: ["user_id"]
          },
        ]
      }
      streaks: {
        Row: {
          bonus_eligibility: boolean
          created_at: string
          current_streak_days: number
          id: string
          last_5k_steps_date: string | null
          last_activity_date: string | null
          longest_streak: number
          streak_bonus_earned_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_eligibility?: boolean
          created_at?: string
          current_streak_days?: number
          id?: string
          last_5k_steps_date?: string | null
          last_activity_date?: string | null
          longest_streak?: number
          streak_bonus_earned_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_eligibility?: boolean
          created_at?: string
          current_streak_days?: number
          id?: string
          last_5k_steps_date?: string | null
          last_activity_date?: string | null
          longest_streak?: number
          streak_bonus_earned_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          item_name: string | null
          metadata: Json | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          item_name?: string | null
          metadata?: Json | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          item_name?: string | null
          metadata?: Json | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_phases: {
        Row: {
          created_at: string
          current_phase: number
          current_phase_steps: number
          current_streak: number
          id: string
          longest_streak: number
          phase_start_date: string
          total_lifetime_steps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_phase?: number
          current_phase_steps?: number
          current_streak?: number
          id?: string
          longest_streak?: number
          phase_start_date?: string
          total_lifetime_steps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_phase?: number
          current_phase_steps?: number
          current_streak?: number
          id?: string
          longest_streak?: number
          phase_start_date?: string
          total_lifetime_steps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_guest: boolean | null
          mobile_number: string
          password_hash: string | null
          phase: string | null
          referral_code: string | null
          referred_by: string | null
          used_referral_code: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          is_guest?: boolean | null
          mobile_number: string
          password_hash?: string | null
          phase?: string | null
          referral_code?: string | null
          referred_by?: string | null
          used_referral_code?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_guest?: boolean | null
          mobile_number?: string
          password_hash?: string | null
          phase?: string | null
          referral_code?: string | null
          referred_by?: string | null
          used_referral_code?: string | null
        }
        Relationships: []
      }
      wallet_balances: {
        Row: {
          id: string
          last_updated: string
          total_balance: number
          total_earned: number
          total_redeemed: number
          user_id: string
        }
        Insert: {
          id?: string
          last_updated?: string
          total_balance?: number
          total_earned?: number
          total_redeemed?: number
          user_id: string
        }
        Update: {
          id?: string
          last_updated?: string
          total_balance?: number
          total_earned?: number
          total_redeemed?: number
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance_paisa: number
          balance_rupees: number | null
          id: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance_paisa?: number
          balance_rupees?: number | null
          id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance_paisa?: number
          balance_rupees?: number | null
          id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_wallet"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      v_daily_summary: {
        Row: {
          daily_coins: number | null
          daily_steps: number | null
          date: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "step_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_wallet"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_redemption_history: {
        Row: {
          coins_spent: number | null
          created_at: string | null
          redemption_id: number | null
          reward_name: string | null
          status: Database["public"]["Enums"]["redemption_status"] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_wallet"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_user_wallet: {
        Row: {
          balance_paisa: number | null
          balance_rupees: number | null
          full_name: string | null
          phase: string | null
          total_steps: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      earn_steps: {
        Args: { p_steps: number; p_user_id: string }
        Returns: string
      }
      generate_otp: {
        Args: { p_mobile_number: string }
        Returns: string
      }
      generate_otp_with_rate_limit: {
        Args: {
          p_ip_address?: unknown
          p_mobile_number: string
          p_user_agent?: string
        }
        Returns: Json
      }
      hash_otp: {
        Args: { plain_otp: string }
        Returns: string
      }
      verify_hashed_otp: {
        Args: { hashed_otp: string; plain_otp: string }
        Returns: boolean
      }
      verify_otp: {
        Args: { p_mobile_number: string; p_otp: string }
        Returns: boolean
      }
      verify_otp_with_audit: {
        Args: {
          p_ip_address?: unknown
          p_mobile_number: string
          p_otp: string
          p_user_agent?: string
        }
        Returns: Json
      }
    }
    Enums: {
      redemption_status: "pending" | "completed" | "failed"
      reward_type: "voucher" | "coupon" | "bill_payment" | "cashout" | "special"
      transaction_type: "earning" | "redeem" | "bonus" | "refund"
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
      redemption_status: ["pending", "completed", "failed"],
      reward_type: ["voucher", "coupon", "bill_payment", "cashout", "special"],
      transaction_type: ["earning", "redeem", "bonus", "refund"],
    },
  },
} as const
