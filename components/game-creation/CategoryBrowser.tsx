"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  displayOrder: number;
  questionSetCount: number;
}

interface CategoryBrowserProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId: string | null;
}

export default function CategoryBrowser({
  onCategorySelect,
  selectedCategoryId,
}: CategoryBrowserProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/question-sets/categories");
      if (!response.ok) {
        throw new Error("Failed to load categories");
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchCategories}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No categories available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Select a Category
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`p-6 border-2 rounded-lg text-left transition-all ${
              selectedCategoryId === category.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white hover:border-gray-400"
            }`}
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {category.name}
            </h4>
            <p className="text-sm text-gray-600">
              {category.questionSetCount} question set
              {category.questionSetCount !== 1 ? "s" : ""}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
