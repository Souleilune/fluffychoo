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
    name: "Mochi Brownies Classic",
    price: 2.99,
    image: "/products/classicchoos.png",
    description: "Classic brownies with fluffy feeling"
  },
  {
    id: 2,
    name: "Soon",
    price: 0.00,
    image: "/products/packaging.png",
    description: "You deserve softness!"
  },
  {
    id: 3,
    name: "Soon",
    price: 0.00,
    image: "/products/packaging.png",
    description: "You deserve softness!"
  },
  {
    id: 4,
    name: "Soon",
    price: 0.00,
    image: "/products/packaging.png",
    description: "You deserve softness!"
  }
];