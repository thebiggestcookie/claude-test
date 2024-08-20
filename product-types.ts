export interface Category {
  id: number;
  name: string;
}

export interface Attribute {
  id: number;
  name: string;
  value: string;
  dataType: string;
  isRequired: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  category: Category;
  attributes: Attribute[];
  aiConfidence?: number;
}

export interface GradingStats {
  reviewed: number;
  accuracy: number;
}

export interface GradingSubmission {
  productId: number;
  attributes: Attribute[];
  approved: boolean;
}

export interface GradingResponse {
  message: string;
  stats: GradingStats;
}
