// ─── Formula sections (order matters for display) ────────────────────────────
export const FORMULA_SECTIONS = [
  'Active',
  'Base',
  'Color',
  'Flavor',
  'Flavor Enhancers',
  'Blockers',
  'Acids',
  'Other',
] as const;

export type FormulaSection = (typeof FORMULA_SECTIONS)[number];

// ─── Formula version statuses ─────────────────────────────────────────────────
export const FORMULA_VERSION_STATUSES = [
  'build',
  'lab_ready',
  'cook_deposit',
  'cure',
  'evaluate',
  'sample_feedback',
  'sign_off',
  'quote_ready',
  'archived',
] as const;

export type FormulaVersionStatus = (typeof FORMULA_VERSION_STATUSES)[number];

export function statusLabel(status: FormulaVersionStatus): string {
  const map: Record<FormulaVersionStatus, string> = {
    build: 'Build',
    lab_ready: 'Lab Ready',
    cook_deposit: 'Cook & Deposit',
    cure: 'Cure',
    evaluate: 'Evaluate',
    sample_feedback: 'Sample Feedback',
    sign_off: 'Sign-Off',
    quote_ready: 'Quote Ready',
    archived: 'Archived',
  };
  return map[status];
}

// ─── Ingredient supply types ──────────────────────────────────────────────────
export const SUPPLY_TYPES = [
  'aura_supplied',
  'customer_supplied',
  'customer_supplied_consigned',
  'customer_nominated_supplier',
  'pass_through',
  'customer_supplied_packaging',
  'aura_supplied_packaging',
] as const;

export type SupplyType = (typeof SUPPLY_TYPES)[number];

export function supplyTypeLabel(t: SupplyType): string {
  const map: Record<SupplyType, string> = {
    aura_supplied: 'Aura Supplied',
    customer_supplied: 'Customer Supplied',
    customer_supplied_consigned: 'Customer Supplied / Consigned',
    customer_nominated_supplier: 'Customer Nominated Supplier',
    pass_through: 'Pass-Through',
    customer_supplied_packaging: 'Customer Supplied Packaging',
    aura_supplied_packaging: 'Aura Supplied Packaging',
  };
  return map[t];
}

// ─── Core types ───────────────────────────────────────────────────────────────
export interface FormulaFamily {
  id: string;
  name: string;
  customer: string;
  customerId: string | null;
  productForm: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaVersion {
  id: string;
  formulaFamilyId: string;
  formulaNameSnapshot: string;
  customerNameSnapshot: string | null;
  customerId: string | null;
  versionCode: string;       // e.g. "v1.3"
  versionNumber: number;     // e.g. 3
  status: FormulaVersionStatus;
  dosageForm: string;
  pilotNumber: string | null;
  servingSize: string | null;        // e.g. "2 gummies"
  gummiesPerServing: number | null;
  wetPieceWeightG: number | null;    // target wet piece weight in grams
  batchSizeGummies: number | null;   // number of gummies in this lab run
  batchSizeG: number | null;         // batch size in grams
  targetWeightMg: number | null;     // target finished weight mg per gummy
  estimatedCureLossPct: number | null;
  notes: string | null;
  changeReason: string | null;       // why this version was created
  parentVersionId: string | null;
  qrToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaMaterial {
  id: string;
  formulaVersionId: string;
  section: FormulaSection;
  itemNumber: string | null;
  rawMaterialName: string;
  supplyType: SupplyType;
  inputClaimMg: number | null;   // input / claim mg
  purityPercent: number | null;  // purity %
  overagePercent: number | null; // overage %
  // computed fields (not stored in DB, calculated on the fly):
  unitWeightMg?: number | null;  // = inputClaimMg / (purityPct/100) * (1 + overagePct/100)
  labRunG?: number | null;       // = unitWeightMg * batchSizeGummies / 1000
  pctWeight?: number | null;     // = unitWeightMg / totalUnitWeightMg * 100
  notes: string | null;
  sortOrder: number;
}

export interface AuriSuggestion {
  id: string;
  formulaVersionId: string;
  ingredient: string | null;
  suggestion: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  source: string;
  dismissed: boolean;
  createdAt: string;
}

export interface SupplementFactsRow {
  name: string;
  amountPerServing: string;
  dailyValuePct: string | null;
  isBlankRow?: boolean;
}

export interface GeneratedSupplementFacts {
  servingSize: string;
  servingsPerContainer: string;
  calories: number | null;
  rows: SupplementFactsRow[];
  otherIngredients: string[];
  warnings: string[];
  reviewFlags: string[];
}

// ─── Formula calculations ─────────────────────────────────────────────────────

/**
 * Unit weight mg = (inputClaimMg / purityFraction) × (1 + overageFraction)
 *
 * For Base / non-active rows, inputClaimMg is the raw inclusion weight,
 * purity is typically 100%, and overage is 0%.
 */
export function calcUnitWeightMg(
  inputClaimMg: number | null,
  purityPercent: number | null,
  overagePercent: number | null,
): number | null {
  if (inputClaimMg == null) return null;
  const purity = (purityPercent ?? 100) / 100;
  const overage = (overagePercent ?? 0) / 100;
  if (purity <= 0) return null;
  return (inputClaimMg / purity) * (1 + overage);
}

/**
 * Lab run g = unitWeightMg × batchSizeGummies / 1000
 */
export function calcLabRunG(
  unitWeightMg: number | null,
  batchSizeGummies: number | null,
): number | null {
  if (unitWeightMg == null || batchSizeGummies == null) return null;
  return (unitWeightMg * batchSizeGummies) / 1000;
}

/**
 * Derive all computed columns for every material row.
 */
export function calculateMaterials(
  materials: FormulaMaterial[],
  batchSizeGummies: number | null,
): FormulaMaterial[] {
  const withUnit = materials.map((m) => ({
    ...m,
    unitWeightMg: calcUnitWeightMg(m.inputClaimMg, m.purityPercent, m.overagePercent),
  }));

  const totalUnitWeight = withUnit.reduce((sum, m) => sum + (m.unitWeightMg ?? 0), 0);

  return withUnit.map((m) => ({
    ...m,
    labRunG: calcLabRunG(m.unitWeightMg, batchSizeGummies),
    pctWeight: totalUnitWeight > 0 && m.unitWeightMg != null
      ? (m.unitWeightMg / totalUnitWeight) * 100
      : null,
  }));
}

/**
 * Generate a draft Supplement Facts panel from formula materials.
 */
export function generateSupplementFacts(
  materials: FormulaMaterial[],
  version: Pick<FormulaVersion, 'servingSize' | 'gummiesPerServing' | 'targetWeightMg'>,
): GeneratedSupplementFacts {
  const warnings: string[] = [];
  const reviewFlags: string[] = [];

  if (!version.servingSize) warnings.push('Serving size not set');
  if (!version.gummiesPerServing) warnings.push('Gummies per serving not set');

  const activeRows = materials.filter((m) => m.section === 'Active');
  if (activeRows.length === 0) {
    warnings.push('No active ingredients in formula');
  }

  const rows: SupplementFactsRow[] = [];

  for (const mat of activeRows) {
    if (!mat.inputClaimMg) {
      reviewFlags.push(`${mat.rawMaterialName}: claim mg not set`);
      continue;
    }
    const perServing = mat.inputClaimMg * (version.gummiesPerServing ?? 1);
    const perServingLabel =
      perServing >= 1000
        ? `${(perServing / 1000).toFixed(2)} g`
        : `${Math.round(perServing)} mg`;

    rows.push({
      name: mat.rawMaterialName || 'Unknown ingredient',
      amountPerServing: perServingLabel,
      dailyValuePct: null, // DV lookup not yet implemented
    });
  }

  if (rows.some((r) => r.dailyValuePct === null)) {
    reviewFlags.push('Daily Value % not populated — requires regulatory mapping');
  }

  // Other ingredients = non-Active, non-empty
  const otherIngredients = materials
    .filter((m) => m.section !== 'Active' && m.rawMaterialName.trim())
    .map((m) => m.rawMaterialName.trim());

  return {
    servingSize: version.servingSize ?? '—',
    servingsPerContainer: '—',
    calories: null,
    rows,
    otherIngredients,
    warnings,
    reviewFlags,
  };
}
