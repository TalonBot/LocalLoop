export type ProductImage = {
  id: string;
  image_url: string;
  product_id: string;
};

export type Product = {
  discountedPrice: number;
  id: string;
  producer_id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity_available: number;
  unit: string;
  is_available: boolean;
  created_at: string;
  modified_at: string;
  product_images: ProductImage[];
};
