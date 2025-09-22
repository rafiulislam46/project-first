import { NextRequest } from "next/server";
import { POST as postCredits } from "../../credits/route";

/**
 * POST /api/user/credits/use
 * Delegates to /api/user/credits POST implementation.
 */
export async function POST(req: NextRequest) {
  return postCredits(req);
}