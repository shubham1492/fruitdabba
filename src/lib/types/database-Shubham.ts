export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          role: 'customer' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin'
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin'
          avatar_url?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          unit: string
          image_url: string | null
          category_id: string | null
          in_stock: boolean
          is_featured: boolean
          nutritional_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          unit?: string
          image_url?: string | null
          category_id?: string | null
          in_stock?: boolean
          is_featured?: boolean
          nutritional_info?: Json | null
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          price?: number
          unit?: string
          image_url?: string | null
          category_id?: string | null
          in_stock?: boolean
          is_featured?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          image_url?: string | null
        }
        Update: {
          name?: string
          slug?: string
          image_url?: string | null
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          duration_days: number
          discount_pct: number
          delivery_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
          features: Json | null
          is_popular: boolean
          created_at: string
          plan_type: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          duration_days: number
          discount_pct?: number
          delivery_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
          features?: Json | null
          is_popular?: boolean
          plan_type?: string
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          duration_days?: number
          discount_pct?: number
          is_popular?: boolean
          plan_type?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          quantity?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          subscription_id: string | null
          address_id: string | null
          subtotal: number
          discount: number
          delivery_fee: number
          total: number
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          subscription_id?: string | null
          address_id?: string | null
          subtotal: number
          discount?: number
          delivery_fee?: number
          total: number
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          razorpay_order_id?: string | null
          notes?: string | null
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_image: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_image?: string | null
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: Record<string, never>
      }
      order_tracking: {
        Row: {
          id: string
          order_id: string
          status: string
          note: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          note?: string | null
          created_by?: string | null
        }
        Update: Record<string, never>
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string | null
          line1: string
          line2: string | null
          city: string
          state: string
          pincode: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string | null
          line1: string
          line2?: string | null
          city: string
          state: string
          pincode: string
          is_default?: boolean
        }
        Update: {
          label?: string | null
          line1?: string
          line2?: string | null
          city?: string
          state?: string
          pincode?: string
          is_default?: boolean
        }
      }
      notifications_log: {
        Row: {
          id: string
          user_id: string | null
          order_id: string | null
          channel: string
          message_type: string
          phone: string | null
          status: 'sent' | 'failed' | 'pending'
          response_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_id?: string | null
          channel?: string
          message_type: string
          phone?: string | null
          status?: 'sent' | 'failed' | 'pending'
          response_data?: Json | null
        }
        Update: {
          status?: 'sent' | 'failed' | 'pending'
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderTracking = Database['public']['Tables']['order_tracking']['Row']
export type Address = Database['public']['Tables']['addresses']['Row']
export type NotificationsLog = Database['public']['Tables']['notifications_log']['Row']
