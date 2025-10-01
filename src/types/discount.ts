export type DiscountType = 'PERCENT' | 'AMOUNT';

export interface Discount {
  id: string;
  item_id: string;
  type: DiscountType;
  value: number;
  starts_at: string;
  ends_at: string;
  is_featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface DiscountForm {
  type: DiscountType;
  value: string;
  starts_at: string;
  ends_at: string;
  is_featured: boolean;
  active: boolean;
}

export interface FlashSaleItem {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  basePrice: number;
  salePrice: number;
  percentOff: number;
  endsAt: string;
  inventory: number;
}

export interface FlashSalesResponse {
  items: FlashSaleItem[];
  serverTime: string;
}









