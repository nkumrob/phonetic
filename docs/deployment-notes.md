# Deployment Notes

## Analytics dashboard deploy order (2026-07-06)

The analytics schema adds `country` and `city` columns to both `events` and `tool_usage`, and rebuilds the `events` table to remove the legacy `CHECK` constraint. The migration is transactional and idempotent — it is safe to run multiple times — but the **migration must run before the new code goes live**.

If new code is deployed before the migration, incoming events will be silently dropped on the missing geo columns.

### Required steps (in order)

1. **Run `npm run db:init` against the production Turso database first.**
   Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in your shell before running the script.
   The script detects the old schema and performs the table rebuild/column additions automatically.

2. **Verify Vercel environment variables are set:**
   - `ADMIN_PASSWORD` — admin login password
   - `ADMIN_SESSION_SECRET` — session signing secret (min 32 chars)

3. **Deploy to Vercel.** Once the migration is confirmed the app can be deployed normally.

### Note on MODEL_PRICES

`lib/constants/model-prices.ts` keys on **dated snapshot model IDs** (e.g. `'claude-haiku-4-5'`).
If you add a new model, add a corresponding entry with `inputPerMTok` and `outputPerMTok` values.
Models absent from the table will show `null` for cost estimates in the AI Ops dashboard.
