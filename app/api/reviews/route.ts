/**
 * Reviews API Route
 * Handles fetching and creating reviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ReviewFormData } from '@/lib/types/review';

// GET /api/reviews - Fetch all approved reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rating = searchParams.get('rating');
    const limit = searchParams.get('limit');
    const approved = searchParams.get('approved') !== 'false'; // Default to true

    let query = supabase
      .from('reviews')
      .select('*')
      .order('date', { ascending: false });

    // Filter by approved status
    if (approved) {
      query = query.eq('approved', true);
    }

    // Filter by rating if provided
    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }

    // Limit results if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (error) {
    console.error('Error in GET /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body: ReviewFormData = await request.json();

    // Validation
    if (!body.name || !body.rating || !body.title || !body.comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Insert review (will be unapproved by default)
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          name: body.name,
          email: body.email || null,
          rating: body.rating,
          title: body.title,
          comment: body.comment,
          date: new Date().toISOString(),
          approved: false, // Requires moderation
          verified: false,
          helpful: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ review: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

