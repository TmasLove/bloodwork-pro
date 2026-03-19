import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "APPROVED":
      return "text-green-600 bg-green-50 border-green-200";
    case "REJECTED":
      return "text-red-600 bg-red-50 border-red-200";
    case "PENDING":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "PROCESSING":
      return "text-blue-600 bg-blue-50 border-blue-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}
