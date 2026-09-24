export interface Customer {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "customer";
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}
