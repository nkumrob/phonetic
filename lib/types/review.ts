/**
 * Review System Types
 */

export interface Review {
  id: string;
  name: string;
  email?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified?: boolean;
  approved?: boolean;
  helpful?: number;
  location?: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewFormData {
  name: string;
  email?: string;
  rating: number;
  title: string;
  comment: string;
}

