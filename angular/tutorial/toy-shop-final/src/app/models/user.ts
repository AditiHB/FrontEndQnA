export interface User {
  email: string;
  name: string;
  role: 'shopper' | 'admin';
  token: string;
}
