export type Category = 'cars' | 'soft' | 'puzzles' | 'games';

export interface Product {
  id: number;
  name: string;
  emoji: string;
  price: number;
  category: Category;
  stock: number;
  rating: number;
  description: string;
}
