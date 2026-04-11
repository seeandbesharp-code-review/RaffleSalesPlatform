import { GiftViewDto } from './gift.model';

export interface DonorViewDto {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  gifts: GiftViewDto[];
}

export interface DonorCreateDto {
  name: string;
  email?: string | null;
  phone: string;
}

export interface DonorUpdateDto {
  id: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}
