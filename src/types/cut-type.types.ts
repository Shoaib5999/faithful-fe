export type CutType = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CutTypeInput = {
  name: string;
  slug?: string;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};
