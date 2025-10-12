export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Golden Elegance Watch",
    price: 299.99,
    image: "/products/watch.jpg",
    description: "Luxury timepiece with golden accents"
  },
  {
    id: 2,
    name: "Amber Crystal Necklace",
    price: 189.99,
    image: "/products/necklace.jpg",
    description: "Handcrafted amber jewelry piece"
  },
  {
    id: 3,
    name: "Vintage Gold Ring",
    price: 249.99,
    image: "/products/ring.jpg",
    description: "Timeless gold ring design"
  },
  {
    id: 4,
    name: "Luxury Gift Set",
    price: 399.99,
    image: "/products/giftset.jpg",
    description: "Premium gift collection"
  }
];