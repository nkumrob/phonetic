/**
 * Review Statistics API Route
 * Calculates and returns review statistics
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { ReviewStats } from '@/lib/types/review';

export async function GET() {
  try {
    // Fetch all approved reviews
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('approved', true);

    if (error) {
      console.error('Error fetching review stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    const stats: ReviewStats = {
      totalReviews: reviews?.length || 0,
      averageRating: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ stats });
    }

    // Calculate distribution and average
    let totalRating = 0;
    reviews.forEach((review) => {
      const rating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
      stats.ratingDistribution[rating]++;
      totalRating += review.rating;
    });

    stats.averageRating = totalRating / reviews.length;

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in GET /api/reviews/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

