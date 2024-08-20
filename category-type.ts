export interface Category {
  id: number;
  name: string;
  departmentId: number;
  department: {
    id: number;
    name: string;
  };
  parentCategoryId: number | null;
  parentCategory?: {
    id: number;
    name: string;
  };
  subCategories?: Category[];
}
