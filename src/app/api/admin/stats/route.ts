import { json } from "../../_utils";
import { db } from "../../_utils";

/**
 * GET /api/admin/stats
 * Returns counts for models, templates, products.
 */
export async function GET() {
  const [models, templates, products] = await Promise.all([
    db.listModels().catch(() => []),
    db.listTemplates().catch(() => []),
    db.listProducts().catch(() => []),
  ]);
  return json({
    models: models.length,
    templates: templates.length,
    products: products.length,
  });
}