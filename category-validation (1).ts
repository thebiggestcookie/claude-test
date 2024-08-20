export interface CategoryFormData {
  name: string;
  departmentId: string;
  parentCategoryId?: string;
}

export interface ValidationErrors {
  name?: string;
  departmentId?: string;
  parentCategoryId?: string;
}

export function validateCategoryForm(data: CategoryFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Category name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Category name must be 100 characters or less';
  }

  if (!data.departmentId) {
    errors.departmentId = 'Department is required';
  }

  if (data.parentCategoryId && data.parentCategoryId === data.departmentId) {
    errors.parentCategoryId = 'Parent category cannot be in the same department';
  }

  return errors;
}
