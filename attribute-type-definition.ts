export interface Attribute {
  id: number;
  name: string;
  dataType: string;
  isRequired: boolean;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
}
