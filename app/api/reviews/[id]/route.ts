/**
 * Individual Review API Route — Turso-backed.
 * Thin Next.js wrapper; all logic (including auth) lives in handler.ts.
 * Auth is enforced by middleware AND by an in-handler check (defense-in-depth).
 */

import { NextRequest } from 'next/server';
import { createPatchHandler, createDeleteHandler } from './handler';

const patchHandler = createPatchHandler();
const deleteHandler = createDeleteHandler();

// PATCH /api/reviews/[id] - Update a review (approve, verify, etc.)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return patchHandler(request, context);
}

// DELETE /api/reviews/[id] - Delete a review
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return deleteHandler(request, context);
}
