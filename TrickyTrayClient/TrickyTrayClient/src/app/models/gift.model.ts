export interface GiftViewDto {
  id: number;
  name: string;
  price: number;
  donorName: string;
  imageUrl?: string | null;
  category: string;
}

export interface GiftCreateDto {
  name: string;
  description: string;
  price: number;
  donorId?: number | null;
  imageUrl?: string | null;
  category: string;
}

export interface GiftUpdateDto {
  id: number;
  name?: string | null;
  description?: string | null;
  price: number;
  donorId?: number | null;
  imageUrl?: string | null;
  category?: string | null;
}
