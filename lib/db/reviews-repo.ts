import { randomUUID } from 'node:crypto';
import type { Review, ReviewFormData, ReviewStats } from '@/lib/types/review';

/**
 * Turso-backed data access for reviews. All functions accept an injectable
 * db (tests pass plain-object fakes); production resolves the singleton.
 */

export interface DbLike {
  execute(stmt: { sql: string; args?: unknown[] }): Promise<{
    rows: unknown[];
    rowsAffected: number;
  }>;
}

interface ReviewRow {
  id: string;
  name: string;
  email: string | null;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: number;
  approved: number;
  helpful: number;
  location: string | null;
}

const UPDATABLE_FIELDS = [
  'name',
  'email',
  'rating',
  'title',
  'comment',
  'verified',
  'approved',
  'helpful',
  'location',
] as const;

async function resolveDb(deps?: { db?: DbLike }): Promise<DbLike> {
  if (deps?.db) return deps.db;
  const { getDb } = await import('./client');
  return getDb() as unknown as DbLike;
}

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    rating: row.rating,
    title: row.title,
    comment: row.comment,
    date: row.date,
    verified: Boolean(row.verified),
    approved: Boolean(row.approved),
    helpful: row.helpful,
    location: row.location ?? undefined,
  };
}

export async function listReviews(
  options: { approvedOnly?: boolean; rating?: number; limit?: number },
  deps?: { db?: DbLike }
): Promise<Review[]> {
  const db = await resolveDb(deps);
  const clauses: string[] = [];
  const args: unknown[] = [];

  if (options.approvedOnly) clauses.push('approved = 1');
  if (options.rating !== undefined) {
    clauses.push('rating = ?');
    args.push(options.rating);
  }

  let sql = `select * from reviews${clauses.length ? ` where ${clauses.join(' and ')}` : ''} order by date desc`;
  if (options.limit !== undefined) {
    sql += ' limit ?';
    args.push(options.limit);
  }

  const { rows } = await db.execute({ sql, args });
  return (rows as ReviewRow[]).map(toReview);
}

export async function createReview(
  formData: ReviewFormData,
  deps?: { db?: DbLike }
): Promise<Review> {
  const db = await resolveDb(deps);
  const { rows } = await db.execute({
    sql: `insert into reviews (id, name, email, rating, title, comment, date, verified, approved, helpful)
          values (?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
          returning *`,
    args: [
      randomUUID(),
      formData.name,
      formData.email ?? null,
      formData.rating,
      formData.title,
      formData.comment,
      new Date().toISOString(),
    ],
  });
  return toReview(rows[0] as ReviewRow);
}

export async function updateReview(
  id: string,
  updates: Partial<Review>,
  deps?: { db?: DbLike }
): Promise<Review | null> {
  const fields = UPDATABLE_FIELDS.filter((field) => updates[field] !== undefined);
  if (fields.length === 0) return null;

  const db = await resolveDb(deps);
  const setClause = fields.map((field) => `${field} = ?`).join(', ');
  const args = fields.map((field) => {
    const value = updates[field];
    return typeof value === 'boolean' ? (value ? 1 : 0) : (value ?? null);
  });

  const { rows } = await db.execute({
    sql: `update reviews set ${setClause}, updated_at = datetime('now') where id = ? returning *`,
    args: [...args, id],
  });

  const row = rows[0] as ReviewRow | undefined;
  return row ? toReview(row) : null;
}

export async function deleteReview(id: string, deps?: { db?: DbLike }): Promise<boolean> {
  const db = await resolveDb(deps);
  const { rowsAffected } = await db.execute({
    sql: 'delete from reviews where id = ?',
    args: [id],
  });
  return rowsAffected > 0;
}

export async function getReviewStats(deps?: { db?: DbLike }): Promise<ReviewStats> {
  const db = await resolveDb(deps);
  const { rows } = await db.execute({
    sql: 'select rating from reviews where approved = 1',
    args: [],
  });

  const stats: ReviewStats = {
    totalReviews: rows.length,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  if (rows.length === 0) return stats;

  let total = 0;
  for (const row of rows as Array<{ rating: number }>) {
    const rating = Math.round(row.rating) as 1 | 2 | 3 | 4 | 5;
    if (stats.ratingDistribution[rating] !== undefined) {
      stats.ratingDistribution[rating]++;
    }
    total += row.rating;
  }
  stats.averageRating = total / rows.length;

  return stats;
}
