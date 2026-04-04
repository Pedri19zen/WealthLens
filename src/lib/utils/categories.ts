import {
  Briefcase,
  Home,
  UtensilsCrossed,
  Car,
  HeartPulse,
  Film,
  ShoppingBag,
  Zap,
  GraduationCap,
  Plane,
  CreditCard,
  MoreHorizontal,
  TrendingUp,
  Gift,
  Coins
} from 'lucide-react';

export const INCOME_CATEGORIES = [
  { name: 'Salary', icon: Briefcase },
  { name: 'Freelance', icon: TrendingUp },
  { name: 'Investment', icon: Coins },
  { name: 'Gift', icon: Gift },
  { name: 'Other Income', icon: MoreHorizontal },
];

export const EXPENSE_CATEGORIES = [
  { name: 'Housing', icon: Home },
  { name: 'Food & Groceries', icon: UtensilsCrossed },
  { name: 'Transport', icon: Car },
  { name: 'Health', icon: HeartPulse },
  { name: 'Entertainment', icon: Film },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Utilities', icon: Zap },
  { name: 'Education', icon: GraduationCap },
  { name: 'Travel', icon: Plane },
  { name: 'Subscriptions', icon: CreditCard },
  { name: 'Other', icon: MoreHorizontal },
];

export const CATEGORY_ICONS: Record<string, React.ElementType> = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].reduce(
  (acc, cat) => ({ ...acc, [cat.name]: cat.icon }),
  {} as Record<string, React.ElementType>
);
