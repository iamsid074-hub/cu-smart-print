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
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    hostel_block: string | null
                    phone_number: string | null
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    hostel_block?: string | null
                    phone_number?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    hostel_block?: string | null
                    phone_number?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    seller_id: string
                    title: string
                    price: number
                    category: string
                    condition: string
                    reason_for_selling: string | null
                    original_price: number | null
                    age: string | null
                    image_url: string | null
                    is_trending: boolean
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    seller_id: string
                    title: string
                    price: number
                    category: string
                    condition: string
                    reason_for_selling?: string | null
                    original_price?: number | null
                    age?: string | null
                    image_url?: string | null
                    is_trending?: boolean
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    seller_id?: string
                    title?: string
                    price?: number
                    category?: string
                    condition?: string
                    reason_for_selling?: string | null
                    original_price?: number | null
                    age?: string | null
                    image_url?: string | null
                    is_trending?: boolean
                    status?: string
                    created_at?: string
                }
            }
        }
    }
} 
