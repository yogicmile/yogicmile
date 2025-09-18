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
      ab_test_assignments: {
        Row: {
          assigned_at: string
          conversion_events: Json | null
          id: string
          test_id: string
          user_id: string
          variant: string
        }
        Insert: {
          assigned_at?: string
          conversion_events?: Json | null
          id?: string
          test_id: string
          user_id: string
          variant: string
        }
        Update: {
          assigned_at?: string
          conversion_events?: Json | null
          id?: string
          test_id?: string
          user_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ab_test_assignments_test_id"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          allocation_percentage: number | null
          assigned_users: Json | null
          created_at: string
          created_by: string
          end_date: string | null
          experiment_name: string
          feature_name: string
          id: string
          results: Json | null
          start_date: string
          status: string
          success_metrics: Json | null
          updated_at: string
          variant_a: Json
          variant_b: Json
        }
        Insert: {
          allocation_percentage?: number | null
          assigned_users?: Json | null
          created_at?: string
          created_by: string
          end_date?: string | null
          experiment_name: string
          feature_name: string
          id?: string
          results?: Json | null
          start_date?: string
          status?: string
          success_metrics?: Json | null
          updated_at?: string
          variant_a: Json
          variant_b: Json
        }
        Update: {
          allocation_percentage?: number | null
          assigned_users?: Json | null
          created_at?: string
          created_by?: string
          end_date?: string | null
          experiment_name?: string
          feature_name?: string
          id?: string
          results?: Json | null
          start_date?: string
          status?: string
          success_metrics?: Json | null
          updated_at?: string
          variant_a?: Json
          variant_b?: Json
        }
        Relationships: []
      }
      account_deletion_requests: {
        Row: {
          admin_approval: boolean | null
          admin_user_id: string | null
          completion_date: string | null
          created_at: string
          deletion_type: string
          grace_period_end: string
          id: string
          reason: string | null
          request_date: string
          status: string
          user_id: string
        }
        Insert: {
          admin_approval?: boolean | null
          admin_user_id?: string | null
          completion_date?: string | null
          created_at?: string
          deletion_type?: string
          grace_period_end?: string
          id?: string
          reason?: string | null
          request_date?: string
          status?: string
          user_id: string
        }
        Update: {
          admin_approval?: boolean | null
          admin_user_id?: string | null
          completion_date?: string | null
          created_at?: string
          deletion_type?: string
          grace_period_end?: string
          id?: string
          reason?: string | null
          request_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
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
      activity_feed: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
          visibility?: string | null
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
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
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
      app_crashes: {
        Row: {
          app_version: string
          created_at: string
          device_info: Json
          error_context: Json | null
          error_message: string
          id: string
          os_version: string | null
          resolved_status: string
          severity: string
          stack_trace: string | null
          timestamp: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string
          created_at?: string
          device_info?: Json
          error_context?: Json | null
          error_message: string
          id?: string
          os_version?: string | null
          resolved_status?: string
          severity?: string
          stack_trace?: string | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string
          created_at?: string
          device_info?: Json
          error_context?: Json | null
          error_message?: string
          id?: string
          os_version?: string | null
          resolved_status?: string
          severity?: string
          stack_trace?: string | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      battery_usage_logs: {
        Row: {
          background_activity_level: string
          battery_level: number | null
          charging_status: boolean | null
          created_at: string
          id: string
          sync_interval_seconds: number
          timestamp: string
          user_id: string | null
        }
        Insert: {
          background_activity_level?: string
          battery_level?: number | null
          charging_status?: boolean | null
          created_at?: string
          id?: string
          sync_interval_seconds?: number
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          background_activity_level?: string
          battery_level?: number | null
          charging_status?: boolean | null
          created_at?: string
          id?: string
          sync_interval_seconds?: number
          timestamp?: string
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
      boost_purchases: {
        Row: {
          amount_cents: number
          boost_type: string
          created_at: string
          currency: string
          expires_at: string | null
          gateway_payment_id: string
          id: string
          metadata: Json | null
          payment_gateway: Database["public"]["Enums"]["payment_gateway"]
          status: Database["public"]["Enums"]["payment_status"]
          used_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          boost_type: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          gateway_payment_id: string
          id?: string
          metadata?: Json | null
          payment_gateway: Database["public"]["Enums"]["payment_gateway"]
          status?: Database["public"]["Enums"]["payment_status"]
          used_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          boost_type?: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          gateway_payment_id?: string
          id?: string
          metadata?: Json | null
          payment_gateway?: Database["public"]["Enums"]["payment_gateway"]
          status?: Database["public"]["Enums"]["payment_status"]
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cache_status: {
        Row: {
          cache_key: string
          cache_type: string
          created_at: string
          expiry_time: string
          id: string
          last_updated: string
          size_bytes: number | null
          user_id: string | null
        }
        Insert: {
          cache_key: string
          cache_type: string
          created_at?: string
          expiry_time: string
          id?: string
          last_updated?: string
          size_bytes?: number | null
          user_id?: string | null
        }
        Update: {
          cache_key?: string
          cache_type?: string
          created_at?: string
          expiry_time?: string
          id?: string
          last_updated?: string
          size_bytes?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          current_contribution: number | null
          id: string
          is_admin: boolean | null
          joined_date: string | null
          rank_position: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          current_contribution?: number | null
          id?: string
          is_admin?: boolean | null
          joined_date?: string | null
          rank_position?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          current_contribution?: number | null
          id?: string
          is_admin?: boolean | null
          joined_date?: string | null
          rank_position?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          end_date: string
          goal_type: string
          group_chat_id: string | null
          id: string
          participant_limit: number | null
          privacy_setting: string | null
          start_date: string
          status: string | null
          target_value: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          end_date: string
          goal_type: string
          group_chat_id?: string | null
          id?: string
          participant_limit?: number | null
          privacy_setting?: string | null
          start_date: string
          status?: string | null
          target_value: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          end_date?: string
          goal_type?: string
          group_chat_id?: string | null
          id?: string
          participant_limit?: number | null
          privacy_setting?: string | null
          start_date?: string
          status?: string | null
          target_value?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      collectibles: {
        Row: {
          animation_type: string | null
          awarded_count: number | null
          collection_series: string | null
          created_at: string | null
          description: string | null
          design_url: string | null
          id: string
          name: string
          rarity: string
          unlock_criteria: Json
        }
        Insert: {
          animation_type?: string | null
          awarded_count?: number | null
          collection_series?: string | null
          created_at?: string | null
          description?: string | null
          design_url?: string | null
          id?: string
          name: string
          rarity?: string
          unlock_criteria?: Json
        }
        Update: {
          animation_type?: string | null
          awarded_count?: number | null
          collection_series?: string | null
          created_at?: string | null
          description?: string | null
          design_url?: string | null
          id?: string
          name?: string
          rarity?: string
          unlock_criteria?: Json
        }
        Relationships: []
      }
      community_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          badge_icon: string
          coins_awarded: number | null
          description: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          badge_icon: string
          coins_awarded?: number | null
          description: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          badge_icon?: string
          coins_awarded?: number | null
          description?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_bookmarks: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      content_votes: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
          vote_type?: string
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
      crash_analytics: {
        Row: {
          affected_users: number
          crash_count: number
          created_at: string
          date: string
          device_breakdown: Json
          id: string
          os_breakdown: Json
          top_errors: Json
        }
        Insert: {
          affected_users?: number
          crash_count?: number
          created_at?: string
          date?: string
          device_breakdown?: Json
          id?: string
          os_breakdown?: Json
          top_errors?: Json
        }
        Update: {
          affected_users?: number
          crash_count?: number
          created_at?: string
          date?: string
          device_breakdown?: Json
          id?: string
          os_breakdown?: Json
          top_errors?: Json
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          created_at: string
          date: string
          dau: number | null
          id: string
          new_users: number | null
          retention_day1: number | null
          retention_day30: number | null
          retention_day7: number | null
          session_duration_avg: number | null
          top_feature: string | null
          top_location: string | null
          total_earnings_paisa: number | null
          total_steps: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          dau?: number | null
          id?: string
          new_users?: number | null
          retention_day1?: number | null
          retention_day30?: number | null
          retention_day7?: number | null
          session_duration_avg?: number | null
          top_feature?: string | null
          top_location?: string | null
          total_earnings_paisa?: number | null
          total_steps?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          dau?: number | null
          id?: string
          new_users?: number | null
          retention_day1?: number | null
          retention_day30?: number | null
          retention_day7?: number | null
          session_duration_avg?: number | null
          top_feature?: string | null
          top_location?: string | null
          total_earnings_paisa?: number | null
          total_steps?: number | null
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
      data_export_requests: {
        Row: {
          created_at: string
          download_token: string | null
          downloaded_at: string | null
          expires_at: string | null
          export_type: string
          file_path: string | null
          id: string
          ip_address: unknown | null
          request_timestamp: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          download_token?: string | null
          downloaded_at?: string | null
          expires_at?: string | null
          export_type?: string
          file_path?: string | null
          id?: string
          ip_address?: unknown | null
          request_timestamp?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          download_token?: string | null
          downloaded_at?: string | null
          expires_at?: string | null
          export_type?: string
          file_path?: string | null
          id?: string
          ip_address?: unknown | null
          request_timestamp?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      device_trust_scores: {
        Row: {
          created_at: string
          device_fingerprint: string
          device_info: Json
          id: string
          is_trusted: boolean | null
          last_seen: string
          risk_factors: Json | null
          trust_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint: string
          device_info?: Json
          id?: string
          is_trusted?: boolean | null
          last_seen?: string
          risk_factors?: Json | null
          trust_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          device_info?: Json
          id?: string
          is_trusted?: boolean | null
          last_seen?: string
          risk_factors?: Json | null
          trust_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          added_by: string | null
          added_date: string
          family_plan_id: string
          id: string
          member_user_id: string
          parental_controls_enabled: boolean | null
          role: string
        }
        Insert: {
          added_by?: string | null
          added_date?: string
          family_plan_id: string
          id?: string
          member_user_id: string
          parental_controls_enabled?: boolean | null
          role?: string
        }
        Update: {
          added_by?: string | null
          added_date?: string
          family_plan_id?: string
          id?: string
          member_user_id?: string
          parental_controls_enabled?: boolean | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_plan_id_fkey"
            columns: ["family_plan_id"]
            isOneToOne: false
            referencedRelation: "family_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      family_plans: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          max_members: number
          payment_gateway: Database["public"]["Enums"]["payment_gateway"] | null
          plan_name: string
          primary_user_id: string
          razorpay_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          max_members?: number
          payment_gateway?:
            | Database["public"]["Enums"]["payment_gateway"]
            | null
          plan_name?: string
          primary_user_id: string
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          max_members?: number
          payment_gateway?:
            | Database["public"]["Enums"]["payment_gateway"]
            | null
          plan_name?: string
          primary_user_id?: string
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faq_votes: {
        Row: {
          created_at: string
          faq_id: string
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          faq_id: string
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          faq_id?: string
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_faq_votes_faq_id"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "faqs"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          helpful_votes: number | null
          id: string
          is_published: boolean | null
          question: string
          search_keywords: string[] | null
          unhelpful_votes: number | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          helpful_votes?: number | null
          id?: string
          is_published?: boolean | null
          question: string
          search_keywords?: string[] | null
          unhelpful_votes?: number | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          helpful_votes?: number | null
          id?: string
          is_published?: boolean | null
          question?: string
          search_keywords?: string[] | null
          unhelpful_votes?: number | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          downvotes: number | null
          id: string
          parent_comment_id: string | null
          post_id: string
          status: string | null
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_comment_id?: string | null
          post_id: string
          status?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          status?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string
          category: string
          comments_count: number | null
          content: string
          created_at: string | null
          downvotes: number | null
          id: string
          image_urls: string[] | null
          is_featured: boolean | null
          is_pinned: boolean | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          author_id: string
          category: string
          comments_count?: number | null
          content: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          image_urls?: string[] | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          author_id?: string
          category?: string
          comments_count?: number | null
          content?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          image_urls?: string[] | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: []
      }
      fraud_detection: {
        Row: {
          admin_reviewed: boolean | null
          admin_user_id: string | null
          auto_action_taken: string | null
          created_at: string
          detection_data: Json
          detection_timestamp: string
          fraud_type: string
          id: string
          resolution_notes: string | null
          resolution_status: string | null
          severity_level: string
          user_id: string
        }
        Insert: {
          admin_reviewed?: boolean | null
          admin_user_id?: string | null
          auto_action_taken?: string | null
          created_at?: string
          detection_data?: Json
          detection_timestamp?: string
          fraud_type: string
          id?: string
          resolution_notes?: string | null
          resolution_status?: string | null
          severity_level?: string
          user_id: string
        }
        Update: {
          admin_reviewed?: boolean | null
          admin_user_id?: string | null
          auto_action_taken?: string | null
          created_at?: string
          detection_data?: Json
          detection_timestamp?: string
          fraud_type?: string
          id?: string
          resolution_notes?: string | null
          resolution_status?: string | null
          severity_level?: string
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          accepted_at: string | null
          addressee_id: string
          created_at: string | null
          id: string
          request_message: string | null
          requester_id: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          addressee_id: string
          created_at?: string | null
          id?: string
          request_message?: string | null
          requester_id: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          addressee_id?: string
          created_at?: string | null
          id?: string
          request_message?: string | null
          requester_id?: string
          status?: string | null
        }
        Relationships: []
      }
      gamification_settings: {
        Row: {
          animation_enabled: boolean | null
          celebration_style: string | null
          created_at: string | null
          id: string
          notification_preferences: Json | null
          reduced_motion: boolean | null
          sharing_preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          animation_enabled?: boolean | null
          celebration_style?: string | null
          created_at?: string | null
          id?: string
          notification_preferences?: Json | null
          reduced_motion?: boolean | null
          sharing_preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          animation_enabled?: boolean | null
          celebration_style?: string | null
          created_at?: string | null
          id?: string
          notification_preferences?: Json | null
          reduced_motion?: boolean | null
          sharing_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      geographic_analytics: {
        Row: {
          ad_revenue: number | null
          city: string | null
          country: string | null
          coupon_redemptions: number | null
          created_at: string
          date: string
          id: string
          state: string | null
          total_earnings_paisa: number | null
          total_steps: number | null
          user_count: number | null
        }
        Insert: {
          ad_revenue?: number | null
          city?: string | null
          country?: string | null
          coupon_redemptions?: number | null
          created_at?: string
          date?: string
          id?: string
          state?: string | null
          total_earnings_paisa?: number | null
          total_steps?: number | null
          user_count?: number | null
        }
        Update: {
          ad_revenue?: number | null
          city?: string | null
          country?: string | null
          coupon_redemptions?: number | null
          created_at?: string
          date?: string
          id?: string
          state?: string | null
          total_earnings_paisa?: number | null
          total_steps?: number | null
          user_count?: number | null
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          category: string
          coins_earned: number | null
          created_at: string | null
          id: string
          location_filter: string | null
          period: string
          rank_position: number
          steps: number | null
          updated_at: string | null
          user_id: string
          weeks_active: number | null
        }
        Insert: {
          category: string
          coins_earned?: number | null
          created_at?: string | null
          id?: string
          location_filter?: string | null
          period: string
          rank_position: number
          steps?: number | null
          updated_at?: string | null
          user_id: string
          weeks_active?: number | null
        }
        Update: {
          category?: string
          coins_earned?: number | null
          created_at?: string | null
          id?: string
          location_filter?: string | null
          period?: string
          rank_position?: number
          steps?: number | null
          updated_at?: string | null
          user_id?: string
          weeks_active?: number | null
        }
        Relationships: []
      }
      load_time_analytics: {
        Row: {
          connection_type: string | null
          created_at: string
          device_type: string | null
          id: string
          load_time_ms: number
          page_name: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          connection_type?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          load_time_ms: number
          page_name: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          connection_type?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          load_time_ms?: number
          page_name?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          clicked_count: number | null
          conversion_count: number | null
          created_at: string
          created_by: string
          delivered_count: number | null
          id: string
          message: string
          name: string
          opened_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          status: string
          target_audience: Json | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          clicked_count?: number | null
          conversion_count?: number | null
          created_at?: string
          created_by: string
          delivered_count?: number | null
          id?: string
          message: string
          name: string
          opened_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          target_audience?: Json | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          clicked_count?: number | null
          conversion_count?: number | null
          created_at?: string
          created_by?: string
          delivered_count?: number | null
          id?: string
          message?: string
          name?: string
          opened_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          target_audience?: Json | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          message_text: string
          message_type: string | null
          read_status: boolean | null
          recipient_id: string | null
          reply_to_id: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          message_text: string
          message_type?: string | null
          read_status?: boolean | null
          recipient_id?: string | null
          reply_to_id?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          message_text?: string
          message_type?: string | null
          read_status?: boolean | null
          recipient_id?: string | null
          reply_to_id?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_photos: {
        Row: {
          achievement_id: string | null
          caption: string | null
          celebration_viewed: boolean | null
          id: string
          milestone_type: string
          milestone_value: number | null
          photo_url: string
          shared_count: number | null
          upload_date: string | null
          user_id: string
        }
        Insert: {
          achievement_id?: string | null
          caption?: string | null
          celebration_viewed?: boolean | null
          id?: string
          milestone_type: string
          milestone_value?: number | null
          photo_url: string
          shared_count?: number | null
          upload_date?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string | null
          caption?: string | null
          celebration_viewed?: boolean | null
          id?: string
          milestone_type?: string
          milestone_value?: number | null
          photo_url?: string
          shared_count?: number | null
          upload_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_photos_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_reports: {
        Row: {
          admin_action: string | null
          content_type: string
          created_at: string | null
          id: string
          report_details: string | null
          report_reason: string
          reported_content_id: string
          reporter_id: string
          resolved_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          admin_action?: string | null
          content_type: string
          created_at?: string | null
          id?: string
          report_details?: string | null
          report_reason: string
          reported_content_id: string
          reporter_id: string
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          admin_action?: string | null
          content_type?: string
          created_at?: string | null
          id?: string
          report_details?: string | null
          report_reason?: string
          reported_content_id?: string
          reporter_id?: string
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          fcm_token: string
          id: string
          notification_id: string
          opened_at: string | null
          sent_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          fcm_token: string
          id?: string
          notification_id: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          fcm_token?: string
          id?: string
          notification_id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          achievement_notifications: boolean | null
          coin_expiry_alerts: boolean | null
          created_at: string | null
          fcm_token: string | null
          id: string
          location_deals_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          reminder_frequency: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          walking_reminders_enabled: boolean | null
        }
        Insert: {
          achievement_notifications?: boolean | null
          coin_expiry_alerts?: boolean | null
          created_at?: string | null
          fcm_token?: string | null
          id?: string
          location_deals_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_frequency?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          walking_reminders_enabled?: boolean | null
        }
        Update: {
          achievement_notifications?: boolean | null
          coin_expiry_alerts?: boolean | null
          created_at?: string | null
          fcm_token?: string | null
          id?: string
          location_deals_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_frequency?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          walking_reminders_enabled?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          created_by_admin: string
          deep_link: string | null
          id: string
          image_url: string | null
          message: string
          schedule_time: string | null
          status: string | null
          target_criteria: Json | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_admin: string
          deep_link?: string | null
          id?: string
          image_url?: string | null
          message: string
          schedule_time?: string | null
          status?: string | null
          target_criteria?: Json | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_admin?: string
          deep_link?: string | null
          id?: string
          image_url?: string | null
          message?: string
          schedule_time?: string | null
          status?: string | null
          target_criteria?: Json | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications_inbox: {
        Row: {
          created_at: string | null
          deep_link: string | null
          id: string
          image_url: string | null
          message: string
          notification_id: string | null
          read_status: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deep_link?: string | null
          id?: string
          image_url?: string | null
          message: string
          notification_id?: string | null
          read_status?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deep_link?: string | null
          id?: string
          image_url?: string | null
          message?: string
          notification_id?: string | null
          read_status?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_inbox_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completed: boolean | null
          completion_date: string | null
          created_at: string | null
          current_step: string | null
          id: string
          steps_completed: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          current_step?: string | null
          id?: string
          steps_completed?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          current_step?: string | null
          id?: string
          steps_completed?: Json | null
          updated_at?: string | null
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
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          family_plan_id: string | null
          gateway_payment_id: string
          id: string
          invoice_id: string | null
          metadata: Json | null
          payment_gateway: Database["public"]["Enums"]["payment_gateway"]
          payment_method_details: Json | null
          processed_at: string | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          family_plan_id?: string | null
          gateway_payment_id: string
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          payment_gateway: Database["public"]["Enums"]["payment_gateway"]
          payment_method_details?: Json | null
          processed_at?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          family_plan_id?: string | null
          gateway_payment_id?: string
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          payment_gateway?: Database["public"]["Enums"]["payment_gateway"]
          payment_method_details?: Json | null
          processed_at?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_family_plan_id_fkey"
            columns: ["family_plan_id"]
            isOneToOne: false
            referencedRelation: "family_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          api_response_time: number | null
          average_load_time: number | null
          bounce_rate: number | null
          created_at: string
          date: string
          error_rate: number | null
          id: string
          page_name: string
          user_count: number | null
        }
        Insert: {
          api_response_time?: number | null
          average_load_time?: number | null
          bounce_rate?: number | null
          created_at?: string
          date?: string
          error_rate?: number | null
          id?: string
          page_name: string
          user_count?: number | null
        }
        Update: {
          api_response_time?: number | null
          average_load_time?: number | null
          bounce_rate?: number | null
          created_at?: string
          date?: string
          error_rate?: number | null
          id?: string
          page_name?: string
          user_count?: number | null
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
      premium_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          current_progress: number | null
          id: string
          is_completed: boolean | null
          started_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          started_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "premium_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_challenges: {
        Row: {
          badge_icon: string | null
          challenge_type: string
          created_at: string
          description: string
          duration_days: number
          end_date: string | null
          id: string
          is_active: boolean | null
          is_seasonal: boolean | null
          metadata: Json | null
          min_tier: Database["public"]["Enums"]["subscription_plan"]
          reward_paisa: number
          start_date: string | null
          target_value: number
          title: string
        }
        Insert: {
          badge_icon?: string | null
          challenge_type: string
          created_at?: string
          description: string
          duration_days: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_seasonal?: boolean | null
          metadata?: Json | null
          min_tier?: Database["public"]["Enums"]["subscription_plan"]
          reward_paisa?: number
          start_date?: string | null
          target_value: number
          title: string
        }
        Update: {
          badge_icon?: string | null
          challenge_type?: string
          created_at?: string
          description?: string
          duration_days?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_seasonal?: boolean | null
          metadata?: Json | null
          min_tier?: Database["public"]["Enums"]["subscription_plan"]
          reward_paisa?: number
          start_date?: string | null
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      premium_rewards: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean | null
          is_experience: boolean | null
          metadata: Json | null
          min_tier: Database["public"]["Enums"]["subscription_plan"]
          partner_brand: string | null
          redemption_cost_paisa: number
          stock_quantity: number | null
          title: string
          updated_at: string
          value_inr: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_experience?: boolean | null
          metadata?: Json | null
          min_tier?: Database["public"]["Enums"]["subscription_plan"]
          partner_brand?: string | null
          redemption_cost_paisa: number
          stock_quantity?: number | null
          title: string
          updated_at?: string
          value_inr: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_experience?: boolean | null
          metadata?: Json | null
          min_tier?: Database["public"]["Enums"]["subscription_plan"]
          partner_brand?: string | null
          redemption_cost_paisa?: number
          stock_quantity?: number | null
          title?: string
          updated_at?: string
          value_inr?: number
        }
        Relationships: []
      }
      privacy_settings: {
        Row: {
          analytics_tracking: boolean | null
          created_at: string
          data_collection: boolean | null
          id: string
          location_tracking: boolean | null
          login_notifications: boolean | null
          marketing_emails: boolean | null
          profile_visibility: string
          security_alerts: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_tracking?: boolean | null
          created_at?: string
          data_collection?: boolean | null
          id?: string
          location_tracking?: boolean | null
          login_notifications?: boolean | null
          marketing_emails?: boolean | null
          profile_visibility?: string
          security_alerts?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_tracking?: boolean | null
          created_at?: string
          data_collection?: boolean | null
          id?: string
          location_tracking?: boolean | null
          login_notifications?: boolean | null
          marketing_emails?: boolean | null
          profile_visibility?: string
          security_alerts?: boolean | null
          updated_at?: string
          user_id?: string
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
      revenue_analytics: {
        Row: {
          ad_revenue: number | null
          amount_paisa: number
          coupon_commissions: number | null
          created_at: string
          date: string
          earning_source: string
          geographic_location: string | null
          id: string
          referral_bonuses: number | null
          user_id: string | null
        }
        Insert: {
          ad_revenue?: number | null
          amount_paisa?: number
          coupon_commissions?: number | null
          created_at?: string
          date?: string
          earning_source: string
          geographic_location?: string | null
          id?: string
          referral_bonuses?: number | null
          user_id?: string | null
        }
        Update: {
          ad_revenue?: number | null
          amount_paisa?: number
          coupon_commissions?: number | null
          created_at?: string
          date?: string
          earning_source?: string
          geographic_location?: string | null
          id?: string
          referral_bonuses?: number | null
          user_id?: string | null
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
      seasonal_challenge_participants: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completion_date: string | null
          id: string
          joined_date: string | null
          progress: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completion_date?: string | null
          id?: string
          joined_date?: string | null
          progress?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completion_date?: string | null
          id?: string
          joined_date?: string | null
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "seasonal_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_challenges: {
        Row: {
          background_color: string | null
          created_at: string | null
          description: string | null
          end_date: string
          exclusive_badge_id: string | null
          goal_target: number
          id: string
          name: string
          participant_count: number | null
          reward_description: string | null
          start_date: string
          status: string | null
          theme: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          exclusive_badge_id?: string | null
          goal_target: number
          id?: string
          name: string
          participant_count?: number | null
          reward_description?: string | null
          start_date: string
          status?: string | null
          theme: string
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          exclusive_badge_id?: string | null
          goal_target?: number
          id?: string
          name?: string
          participant_count?: number | null
          reward_description?: string | null
          start_date?: string
          status?: string | null
          theme?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action_taken: string | null
          additional_data: Json | null
          admin_id: string | null
          created_at: string
          device_info: Json | null
          event_id: string
          event_timestamp: string
          event_type: string
          id: string
          ip_address: unknown | null
          result_status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          additional_data?: Json | null
          admin_id?: string | null
          created_at?: string
          device_info?: Json | null
          event_id: string
          event_timestamp?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          result_status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          additional_data?: Json | null
          admin_id?: string | null
          created_at?: string
          device_info?: Json | null
          event_id?: string
          event_timestamp?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          result_status?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      step_analytics: {
        Row: {
          active_users: number | null
          average_steps: number | null
          created_at: string
          date: string
          goal_completions: number | null
          id: string
          new_user_signups: number | null
          streak_achievements: number | null
          total_steps: number | null
        }
        Insert: {
          active_users?: number | null
          average_steps?: number | null
          created_at?: string
          date?: string
          goal_completions?: number | null
          id?: string
          new_user_signups?: number | null
          streak_achievements?: number | null
          total_steps?: number | null
        }
        Update: {
          active_users?: number | null
          average_steps?: number | null
          created_at?: string
          date?: string
          goal_completions?: number | null
          id?: string
          new_user_signups?: number | null
          streak_achievements?: number | null
          total_steps?: number | null
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
      subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          family_plan_id: string | null
          id: string
          payment_gateway: Database["public"]["Enums"]["payment_gateway"] | null
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          razorpay_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          family_plan_id?: string | null
          id?: string
          payment_gateway?:
            | Database["public"]["Enums"]["payment_gateway"]
            | null
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          family_plan_id?: string | null
          id?: string
          payment_gateway?:
            | Database["public"]["Enums"]["payment_gateway"]
            | null
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_subscriptions_family_plan"
            columns: ["family_plan_id"]
            isOneToOne: false
            referencedRelation: "family_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_analytics: {
        Row: {
          avg_response_time: number | null
          created_at: string
          date: string
          id: string
          resolved_tickets: number | null
          satisfaction_score: number | null
          total_tickets: number | null
        }
        Insert: {
          avg_response_time?: number | null
          created_at?: string
          date: string
          id?: string
          resolved_tickets?: number | null
          satisfaction_score?: number | null
          total_tickets?: number | null
        }
        Update: {
          avg_response_time?: number | null
          created_at?: string
          date?: string
          id?: string
          resolved_tickets?: number | null
          satisfaction_score?: number | null
          total_tickets?: number | null
        }
        Relationships: []
      }
      support_chats: {
        Row: {
          admin_id: string | null
          id: string
          is_read: boolean | null
          message: string
          priority: string | null
          sender_type: string
          status: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          sender_type: string
          status?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          sender_type?: string
          status?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          attachments: Json | null
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          category: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_queue: {
        Row: {
          action_type: string
          created_at: string
          data_payload: Json
          id: string
          max_retries: number
          next_retry_at: string | null
          priority: number
          retry_count: number
          sync_status: string
          timestamp: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          data_payload: Json
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          priority?: number
          retry_count?: number
          sync_status?: string
          timestamp?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          data_payload?: Json
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          priority?: number
          retry_count?: number
          sync_status?: string
          timestamp?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      ticket_responses: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          message: string
          responder_id: string
          responder_type: string
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          message: string
          responder_id: string
          responder_type: string
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          message?: string
          responder_id?: string
          responder_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
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
      tutorial_views: {
        Row: {
          completed: boolean | null
          id: string
          tutorial_id: string
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          tutorial_id: string
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          tutorial_id?: string
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tutorial_views_tutorial_id"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "video_tutorials"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          celebration_viewed: boolean | null
          id: string
          progress_percentage: number | null
          shared_count: number | null
          unlocked_date: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          celebration_viewed?: boolean | null
          id?: string
          progress_percentage?: number | null
          shared_count?: number | null
          unlocked_date?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          celebration_viewed?: boolean | null
          id?: string
          progress_percentage?: number | null
          shared_count?: number | null
          unlocked_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_collectibles: {
        Row: {
          collectible_id: string
          earned_date: string | null
          id: string
          milestone_value: number | null
          shared_count: number | null
          user_id: string
        }
        Insert: {
          collectible_id: string
          earned_date?: string | null
          id?: string
          milestone_value?: number | null
          shared_count?: number | null
          user_id: string
        }
        Update: {
          collectible_id?: string
          earned_date?: string | null
          id?: string
          milestone_value?: number | null
          shared_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collectibles_collectible_id_fkey"
            columns: ["collectible_id"]
            isOneToOne: false
            referencedRelation: "collectibles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consent: {
        Row: {
          consent_type: string
          consent_version: string
          created_at: string
          granted: boolean
          granted_at: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
          withdrawn_at: string | null
        }
        Insert: {
          consent_type: string
          consent_version?: string
          created_at?: string
          granted?: boolean
          granted_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
          withdrawn_at?: string | null
        }
        Update: {
          consent_type?: string
          consent_version?: string
          created_at?: string
          granted?: boolean
          granted_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      user_engagement_scores: {
        Row: {
          challenge_completion_score: number | null
          created_at: string
          daily_usage_score: number | null
          date: string
          feature_interaction_score: number | null
          id: string
          percentile_rank: number | null
          social_sharing_score: number | null
          total_engagement_score: number | null
          user_id: string
        }
        Insert: {
          challenge_completion_score?: number | null
          created_at?: string
          daily_usage_score?: number | null
          date?: string
          feature_interaction_score?: number | null
          id?: string
          percentile_rank?: number | null
          social_sharing_score?: number | null
          total_engagement_score?: number | null
          user_id: string
        }
        Update: {
          challenge_completion_score?: number | null
          created_at?: string
          daily_usage_score?: number | null
          date?: string
          feature_interaction_score?: number | null
          id?: string
          percentile_rank?: number | null
          social_sharing_score?: number | null
          total_engagement_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_metrics: {
        Row: {
          active_flag: boolean | null
          created_at: string
          date: string
          features_used: Json | null
          id: string
          last_active_at: string | null
          login_count: number | null
          pages_visited: Json | null
          retention_day: number | null
          session_duration: number | null
          steps_logged: number | null
          user_id: string
        }
        Insert: {
          active_flag?: boolean | null
          created_at?: string
          date?: string
          features_used?: Json | null
          id?: string
          last_active_at?: string | null
          login_count?: number | null
          pages_visited?: Json | null
          retention_day?: number | null
          session_duration?: number | null
          steps_logged?: number | null
          user_id: string
        }
        Update: {
          active_flag?: boolean | null
          created_at?: string
          date?: string
          features_used?: Json | null
          id?: string
          last_active_at?: string | null
          login_count?: number | null
          pages_visited?: Json | null
          retention_day?: number | null
          session_duration?: number | null
          steps_logged?: number | null
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
      user_profiles: {
        Row: {
          achievements_count: number | null
          activity_status: string | null
          activity_visible: boolean | null
          avatar_url: string | null
          bio: string | null
          coins_earned: number | null
          community_activity_score: number | null
          created_at: string | null
          current_phase: string | null
          display_name: string
          id: string
          last_active: string | null
          location_city: string | null
          location_state: string | null
          privacy_setting: string | null
          profile_picture_url: string | null
          profile_visibility: string | null
          stats_visible: boolean | null
          total_steps: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements_count?: number | null
          activity_status?: string | null
          activity_visible?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          coins_earned?: number | null
          community_activity_score?: number | null
          created_at?: string | null
          current_phase?: string | null
          display_name: string
          id?: string
          last_active?: string | null
          location_city?: string | null
          location_state?: string | null
          privacy_setting?: string | null
          profile_picture_url?: string | null
          profile_visibility?: string | null
          stats_visible?: boolean | null
          total_steps?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements_count?: number | null
          activity_status?: string | null
          activity_visible?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          coins_earned?: number | null
          community_activity_score?: number | null
          created_at?: string | null
          current_phase?: string | null
          display_name?: string
          id?: string
          last_active?: string | null
          location_city?: string | null
          location_state?: string | null
          privacy_setting?: string | null
          profile_picture_url?: string | null
          profile_visibility?: string | null
          stats_visible?: boolean | null
          total_steps?: number | null
          updated_at?: string | null
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
          role: string | null
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
          role?: string | null
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
          role?: string | null
          used_referral_code?: string | null
        }
        Relationships: []
      }
      video_tutorials: {
        Row: {
          category: string
          created_at: string
          description: string
          duration: number | null
          embed_code: string
          helpful_votes: number | null
          id: string
          is_published: boolean | null
          thumbnail_url: string | null
          title: string
          unhelpful_votes: number | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          duration?: number | null
          embed_code: string
          helpful_votes?: number | null
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title: string
          unhelpful_votes?: number | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          duration?: number | null
          embed_code?: string
          helpful_votes?: number | null
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title?: string
          unhelpful_votes?: number | null
          updated_at?: string
          views_count?: number | null
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
      get_user_subscription_status: {
        Args: { p_user_id: string }
        Returns: {
          expires_at: string
          is_family_member: boolean
          is_premium: boolean
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
        }[]
      }
      has_active_boost: {
        Args: { p_boost_type: string; p_user_id: string }
        Returns: boolean
      }
      hash_otp: {
        Args: { plain_otp: string }
        Returns: string
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_new_values?: Json
          p_old_values?: Json
          p_record_id?: string
          p_table_name?: string
        }
        Returns: undefined
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
      billing_cycle: "monthly" | "yearly"
      payment_gateway: "stripe" | "razorpay"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      redemption_status: "pending" | "completed" | "failed"
      reward_type: "voucher" | "coupon" | "bill_payment" | "cashout" | "special"
      subscription_plan: "free" | "premium" | "family"
      subscription_status: "active" | "past_due" | "canceled" | "paused"
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
      billing_cycle: ["monthly", "yearly"],
      payment_gateway: ["stripe", "razorpay"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      redemption_status: ["pending", "completed", "failed"],
      reward_type: ["voucher", "coupon", "bill_payment", "cashout", "special"],
      subscription_plan: ["free", "premium", "family"],
      subscription_status: ["active", "past_due", "canceled", "paused"],
      transaction_type: ["earning", "redeem", "bonus", "refund"],
    },
  },
} as const
