export interface ProductSizeStock {
  size: string;
  stock: number;
}

export interface ProductVariant {
  color: string;
  sizes: ProductSizeStock[];
  image?: string; // Optional: allow different images per color
} 