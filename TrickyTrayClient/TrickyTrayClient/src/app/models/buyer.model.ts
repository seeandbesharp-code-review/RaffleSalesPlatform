export type UserRole = 0 | 1; // User=0, Admin=1

export interface BuyerViewDto {
  id: number;
  identityNumber: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
}

export interface BuyerCreateDto {
  identityNumber: string;
  role: UserRole;
  name: string;
  password: string;
  email: string;
  phone: string;
}

export interface BuyerUpdateDto {
  id: number;
  name?: string | null;
  password?: string | null;
  email?: string | null;
  phone?: string | null;
}
