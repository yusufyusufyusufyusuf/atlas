import { useState, useMemo } from 'react';
import {
  ArrowLeft, Plus, Save, Trash2, Sparkles, ChevronDown, ChevronRight,
  QrCode, CheckCircle2, AlertTriangle, X, GitBranch,
  FileText, MoreHorizontal, Shield,
} from 'lucide-react';
import { cn, uuid, formatNumber, parseOptionalNumber } from '@/lib/utils';
import {
  FORMULA_SECTIONS,
  SUPPLY_TYPES,
  statusLabel,
  supplyTypeLabel,
  calculateMaterials,
  generateSupplementFacts,
  calcUnitWeightMg,
  calcLabRunG,
  type FormulaVersion,
  type FormulaMaterial,
  type FormulaSection,
  type SupplyType,
  type AuriSuggestion,
} from '@/domain/rndFormula';

// ─── Primary color helper ─────────────────────────────────────────────────────
const P = 'hsl(337,62%,32%)';   // maroon
const P_LIGHT = 'hsl(337,62%,96%)';
const P_BORDER = 'hsl(337,62%,80%)';

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_VERSION: FormulaVersion = {
  id: 'ver-1',
  formulaFamilyId: 'fam-1',
  formulaNameSnapshot: 'Husayn Dev Gummy Formula',
  customerNameSnapshot: 'Husayn Dev Test Customer',
  customerId: 'cust-1',
  versionCode: 'v1.3',
  versionNumber: 3,
  status: 'build',
  dosageForm: 'gummy',
  pilotNumber: 'HDG-PILOT-001',
  servingSize: '2 gummies',
  gummiesPerServing: 2,
  wetPieceWeightG: 5,
  batchSizeGummies: 12000,
  batchSizeG: null,
  targetWeightMg: 5000,
  estimatedCureLossPct: 10,
  notes: 'Based on v1.2 · 4 changes since previous version',
  changeReason: 'Adjusted blocker and matcha load.',
  parentVersionId: 'ver-2',
  qrToken: 'HDG-v1.3-secure-token',
  createdAt: '2026-06-10T00:00:00Z',
  updatedAt: '2026-06-17T00:00:00Z',
};

const DEMO_MATERIALS: FormulaMaterial[] = [
  { id: uuid(), formulaVersionId: 'ver-1', section: 'Active', itemNumber: 'HDG-AC', rawMaterialName: 'Vitamin C 80% Ascorbic Acid', supplyType: 'aura_supplied', inputClaimMg: 120, purityPercent: 80, overagePercent: 10, notes: '', sortOrder: 0 },
  { id: uuid(), formulaVersionId: 'ver-1', section: 'Base', itemNumber: 'HDG-BA', rawMaterialName: 'Organic Tapioca Syrup', supplyType: 'aura_supplied', inputClaimMg: null, purityPercent: 100, overagePercent: 0, notes: 'Base allocation', sortOrder: 1 },
  { id: uuid(), formulaVersionId: 'ver-1', section: 'Flavor', itemNumber: 'HDG-FL', rawMaterialName: 'Natural Mixed Berry Flavor', supplyType: 'aura_supplied', inputClaimMg: null, purityPercent: 100, overagePercent: 0, notes: '', sortOrder: 2 },
];

const DEMO_SUGGESTIONS: AuriSuggestion[] = [
  { id: 's1', formulaVersionId: 'ver-1', ingredient: null, suggestion: 'Review active load against flavor bitterness before Lab Ready.', reason: 'Current actives can drive bitterness and may require flavor/acid balancing before sample prep.', confidence: 'medium', source: 'Formula Composition rows + Build-stage review rules', dismissed: false, createdAt: '2026-06-17T00:00:00Z' },
  { id: 's2', formulaVersionId: 'ver-1', ingredient: null, suggestion: 'Confirm pectin, acid, and solids balance after formula lock.', reason: 'Texture risk should be reviewed before downstream lab/production workflows are opened.', confidence: 'medium', source: 'Gummy formulation heuristic; requires R&D confirmation', dismissed: false, createdAt: '2026-06-17T00:00:00Z' },
  { id: 's3', formulaVersionId: 'ver-1', ingredient: null, suggestion: 'Review open Build-readiness items before creating the next version.', reason: '2 blocking/review item(s) are still open.', confidence: 'high', source: 'Auri warning checks on current composition', dismissed: false, createdAt: '2026-06-17T00:00:00Z' },
];

const VERSION_HISTORY = [
  { code: 'v1.0', change: 'Initial formula', outcome: 'failed texture', date: '2026-01-10' },
  { code: 'v1.1', change: 'Increased pectin', outcome: 'better chew, too sticky', date: '2026-02-14' },
  { code: 'v1.2', change: 'Reduced water', outcome: 'better Brix, flavor too bitter', date: '2026-04-22' },
  { code: 'v1.3', change: 'adjusted blocker and matcha load', outcome: 'Current', date: '2026-06-10', isCurrent: true },
];

// ─── Main component ───────────────────────────────────────────────────────────
export function BuildPage() {
  const [version, setVersion] = useState<FormulaVersion>(DEMO_VERSION);
  const [materials, setMaterials] = useState<FormulaMaterial[]>(DEMO_MATERIALS);
  const [suggestions, setSuggestions] = useState<AuriSuggestion[]>(DEMO_SUGGESTIONS);
  const [showAddSlideOver, setShowAddSlideOver] = useState(false);
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const calculated = useMemo(
    () => calculateMaterials(materials, version.batchSizeGummies),
    [materials, version.batchSizeGummies],
  );

  const supplementFacts = useMemo(
    () => generateSupplementFacts(calculated, version),
    [calculated, version],
  );

  const activeSuggestions = suggestions.filter((s) => !s.dismissed);
  const totalUnitWeightMg = calculated.reduce((s, m) => s + (m.unitWeightMg ?? 0), 0);

  function patchVersion(patch: Partial<FormulaVersion>) {
    setVersion((v) => ({ ...v, ...patch }));
  }

  function patchMaterial(id: string, patch: Partial<FormulaMaterial>) {
    setMaterials((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeMaterial(id: string) {
    setMaterials((rows) => rows.filter((r) => r.id !== id));
  }

  function addMaterial(m: FormulaMaterial) {
    setMaterials((rows) => [...rows, m]);
    setShowAddSlideOver(false);
  }

  function dismissSuggestion(id: string) {
    setSuggestions((list) => list.map((s) => (s.id === id ? { ...s, dismissed: true } : s)));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSavedAt('Saved just now');
  }

  return (
    <div className="relative min-h-full">
      {/* ── Slide-over backdrop ── */}
      {showAddSlideOver && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setShowAddSlideOver(false)}
        />
      )}

      {/* ── Add Ingredient slide-over ── */}
      {showAddSlideOver && (
        <AddIngredientSlideOver
          version={version}
          existingMaterials={calculated}
          onAdd={addMaterial}
          onClose={() => setShowAddSlideOver(false)}
        />
      )}

      <div className="mx-auto max-w-[1400px] px-6 py-5">
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-1.5 text-xs text-muted">
          <button className="flex items-center gap-1 hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" />
            Formula Builder
          </button>
        </div>

        {/* Page badge */}
        <div className="mb-3">
          <span className="rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: P, borderColor: P_BORDER, backgroundColor: P_LIGHT }}>
            Formula Builder — Build Page
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-ink mb-1">{version.formulaNameSnapshot}</h1>

        {/* Subtitle row */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted mb-4">
          <span>Current: {version.versionCode} · R&D Stage: {statusLabel(version.status)} · Commercial Status: Quote Created · Based on v1.2 · 4 changes since previous version</span>
          <DosageBadge label="Gummy" />
          <StatusChip label="R&D Stage" value={statusLabel(version.status)} />
          <StatusChip label="Commercial Status" value="Quote Created" />
        </div>

        {/* QR + Actions row */}
        <div className="mb-4 flex flex-wrap items-start gap-3">
          {/* QR card */}
          <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded border border-line bg-canvas">
              <QrCode className="h-5 w-5 text-muted" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Formula Version QR</div>
              <button className="text-xs font-medium hover:underline" style={{ color: P }}>View QR / Print QR</button>
              <div className="text-[10px] text-muted">{version.qrToken}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <PrimaryButton onClick={() => {}}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Move to Lab Ready / Lock Formula
            </PrimaryButton>
            <OutlineButton onClick={() => {}}>
              <FileText className="h-3.5 w-3.5" />
              Open Quote
            </OutlineButton>
            <OutlineButton onClick={() => {}}>
              <MoreHorizontal className="h-3.5 w-3.5" />
              More Actions
            </OutlineButton>
          </div>

          {/* Save status */}
          {savedAt && (
            <span className="ml-auto self-center text-xs text-muted">{savedAt}</span>
          )}
        </div>

        {/* Info cards */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { label: 'Customer', value: version.customerNameSnapshot ?? '—' },
            { label: 'Version', value: version.versionCode },
            { label: 'Serving Size', value: version.servingSize ?? '—' },
            { label: 'Wet Piece Weight', value: version.wetPieceWeightG ? `${version.wetPieceWeightG} g/gummy` : '—' },
            { label: 'Pilot / Lot Code', value: version.pilotNumber ?? '—' },
            { label: 'Formula Version QR', value: 'View / Print from QR card' },
            { label: 'R&D Stage', value: statusLabel(version.status) },
            { label: 'Commercial Status', value: 'Quote Created' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-line bg-white px-3 py-2.5">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted">{label}</div>
              <div className="mt-0.5 text-xs font-semibold text-ink leading-snug">{value}</div>
            </div>
          ))}
        </div>

        {/* More details collapsible */}
        <div className="mb-5 rounded-lg border border-line bg-white">
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-ink hover:bg-canvas-alt/50 rounded-lg"
            onClick={() => setMoreDetailsOpen((v) => !v)}
          >
            More Details
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Version metadata, customer, dosage form, and notes</span>
              {moreDetailsOpen ? <ChevronDown className="h-4 w-4 text-muted" /> : <ChevronRight className="h-4 w-4 text-muted" />}
            </div>
          </button>
          {moreDetailsOpen && (
            <div className="border-t border-line px-4 py-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <EditField label="Serving size" value={version.servingSize ?? ''} onChange={(v) => patchVersion({ servingSize: v })} />
              <EditField label="Gummies / serving" type="number" value={String(version.gummiesPerServing ?? '')} onChange={(v) => patchVersion({ gummiesPerServing: parseOptionalNumber(v) })} />
              <EditField label="Wet piece weight (g)" type="number" value={String(version.wetPieceWeightG ?? '')} onChange={(v) => patchVersion({ wetPieceWeightG: parseOptionalNumber(v) })} />
              <EditField label="Lab run (# gummies)" type="number" value={String(version.batchSizeGummies ?? '')} onChange={(v) => patchVersion({ batchSizeGummies: parseOptionalNumber(v) })} />
              <EditField label="Target weight mg" type="number" value={String(version.targetWeightMg ?? '')} onChange={(v) => patchVersion({ targetWeightMg: parseOptionalNumber(v) })} />
              <EditField label="Est. cure loss %" type="number" value={String(version.estimatedCureLossPct ?? '')} onChange={(v) => patchVersion({ estimatedCureLossPct: parseOptionalNumber(v) })} />
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Notes</label>
                <textarea
                  className="w-full rounded-md border border-line bg-white px-3 py-2 text-xs text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': P } as React.CSSProperties}
                  rows={2}
                  value={version.notes ?? ''}
                  onChange={(e) => patchVersion({ notes: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main content: grid + right sidebar */}
        <div className="flex gap-5 items-start">
          {/* LEFT: Formula composition */}
          <div className="min-w-0 flex-1">
            {/* Build Workbench header */}
            <div className="mb-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: P }}>
                Build Workbench
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">Formula Composition</h2>
                  <p className="text-xs text-muted">Build-stage formula composition with section dividers, calculated weights, and customer-supplied exception tags.</p>
                </div>
                <PrimaryButton onClick={() => setShowAddSlideOver(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Ingredient
                </PrimaryButton>
              </div>
            </div>

            {/* Save status bar */}
            <div className="mb-2 flex items-center gap-2 text-[10px] text-muted">
              <span className="text-success font-medium">● Saved just now</span>
              <span>·</span>
              <span>possible states: Saving… / Unsaved changes / Save failed</span>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-line bg-white overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-line bg-canvas-alt">
                    <th className="px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-wider text-muted w-[110px]">Section</th>
                    <th className="px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-wider text-muted w-[90px]">Item #</th>
                    <th className="px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-wider text-muted">Ingredient</th>
                    <th className="px-3 py-2.5 text-right text-[9px] font-semibold uppercase tracking-wider text-muted w-[100px]">Input / Claim (mg)</th>
                    <th className="px-3 py-2.5 text-right text-[9px] font-semibold uppercase tracking-wider text-muted w-[80px]">Purity %</th>
                    <th className="px-3 py-2.5 text-right text-[9px] font-semibold uppercase tracking-wider text-muted w-[80px]">Overage %</th>
                    <th className="px-3 py-2.5 text-right text-[9px] font-semibold uppercase tracking-wider text-muted w-[90px]">Unit Wt (mg)</th>
                    <th className="px-3 py-2.5 text-right text-[9px] font-semibold uppercase tracking-wider text-muted w-[80px]">Lab Run (g)</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {FORMULA_SECTIONS.map((section) => {
                    const rows = calculated.filter((m) => m.section === section);
                    return (
                      <SectionRows
                        key={section}
                        section={section}
                        rows={rows}
                        onPatch={patchMaterial}
                        onRemove={removeMaterial}
                        onAdd={() => setShowAddSlideOver(true)}
                      />
                    );
                  })}
                </tbody>
              </table>

              {/* Total row + save */}
              <div className="flex items-center justify-between border-t border-line bg-canvas-alt px-4 py-2.5">
                <span className="text-xs font-medium text-ink">
                  Total unit weight: <span className="tabular-nums">{formatNumber(totalUnitWeightMg, 0)} mg</span>
                </span>
                <PrimaryButton onClick={handleSave} disabled={saving}>
                  <Save className="h-3.5 w-3.5" />
                  {saving ? 'Saving…' : 'Save composition'}
                </PrimaryButton>
              </div>
            </div>

            {/* Version History */}
            <div className="mt-5 rounded-lg border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h3 className="text-sm font-semibold text-ink">Version History</h3>
                <OutlineButton onClick={() => {}}>
                  <GitBranch className="h-3.5 w-3.5" />
                  Compare Versions
                </OutlineButton>
              </div>
              <div className="divide-y divide-line">
                {VERSION_HISTORY.map((v) => (
                  <div key={v.code} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                    <span className={cn('font-semibold w-8', v.isCurrent ? 'text-ink' : 'text-muted')}>
                      {v.code}
                    </span>
                    <span className="text-muted">—</span>
                    <span className="text-ink">{v.change}</span>
                    {v.outcome && (
                      <>
                        <span className="text-muted">—</span>
                        <span className={cn('text-muted', v.isCurrent && 'font-semibold text-ink')}>{v.outcome}</span>
                      </>
                    )}
                    <span className="ml-auto text-muted">{v.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Build Page Scope */}
            <div className="mt-5 rounded-lg border border-line bg-white">
              <div className="border-b border-line px-4 py-3">
                <h3 className="text-sm font-semibold text-ink">Build Page Scope</h3>
              </div>
              <div className="grid grid-cols-3 gap-0 divide-x divide-line">
                {[
                  { heading: 'Build Page Scope', body: 'Formula composition, calculated weights, Supplement Facts preview, Auri suggestions, and version comparison.' },
                  { heading: 'Primary Next Action', body: 'Move to Lab Ready / Lock Formula — the downstream lab page is intentionally outside this PR.' },
                  { heading: 'Commercial Status', body: 'Quote Ready / Quote Created stays separate from R&D Stage and does not imply Lab Ready.' },
                ].map(({ heading, body }) => (
                  <div key={heading} className="px-4 py-3">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-muted mb-1">{heading}</div>
                    <p className="text-xs text-ink">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Supplement Facts + Auri Suggestions */}
          <div className="w-[320px] shrink-0 space-y-4">
            {/* Supplement Facts */}
            <div className="rounded-lg border border-line bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" style={{ color: P }} />
                  <span className="text-xs font-semibold text-ink">Auri Generated Supplement Facts</span>
                  <Sparkles className="h-3 w-3" style={{ color: P }} />
                </div>
                <span className="text-[9px] font-semibold text-warning bg-warning/10 border border-warning/20 rounded px-1.5 py-0.5">
                  QA/Regulatory review required
                </span>
              </div>

              <div className="p-4">
                {/* Nutrition label */}
                <div className="border-2 border-ink rounded overflow-hidden font-sans mb-3">
                  <div className="bg-ink text-white px-3 py-1.5">
                    <div className="text-lg font-black tracking-tight leading-tight">Supplement Facts</div>
                  </div>
                  <div className="px-3 py-1.5 border-b-4 border-ink">
                    <div className="text-[10px]"><span className="font-bold">Serving Size</span> {version.servingSize ?? '2 gummies'}</div>
                    <div className="text-[10px]">Servings Per Container TBD</div>
                  </div>
                  <div className="px-3 py-1 border-b border-ink flex justify-between text-[9px] font-bold uppercase">
                    <span>Amount Per Serving</span>
                    <span>% Daily Value</span>
                  </div>
                  <div className="px-3 py-1 text-[10px] border-b border-line flex justify-between">
                    <span>Calories TBD</span>
                  </div>
                  <div className="px-3 py-1 text-[10px] border-b border-line flex justify-between">
                    <span>Total Carbohydrate TBD</span><span>TBD</span>
                  </div>
                  <div className="px-3 py-1 text-[10px] border-b border-line flex justify-between">
                    <span>Total Sugars TBD</span>
                  </div>
                  <div className="px-3 pl-5 py-1 text-[10px] border-b border-line flex justify-between">
                    <span>Includes Added Sugars TBD</span><span>TBD</span>
                  </div>
                  <div className="px-3 py-1 text-[10px] border-b border-line flex justify-between">
                    <span>Sodium TBD</span><span>TBD</span>
                  </div>
                  {supplementFacts.rows.map((row, i) => (
                    <div key={i} className="px-3 py-1 text-[10px] border-b border-line flex justify-between">
                      <span className="font-bold">{row.name} {row.amountPerServing}</span>
                      <span>{row.dailyValuePct ?? '†'}</span>
                    </div>
                  ))}
                  <div className="px-3 py-1 text-[9px] text-muted">
                    * Percent Daily Values are based on a 2,000 calorie diet.<br />
                    † Daily Value not established.
                  </div>
                </div>

                {/* Other ingredients */}
                {supplementFacts.otherIngredients.length > 0 && (
                  <div className="mb-3 text-[10px]">
                    <span className="font-bold text-ink">Other Ingredients: </span>
                    <span className="text-muted">{supplementFacts.otherIngredients.join(', ')}.</span>
                  </div>
                )}

                <p className="text-[9px] text-muted">Structured from formula/material rows where possible; Auri does not create final label copy or bypass QA/Regulatory review.</p>

                {/* Warnings */}
                {supplementFacts.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-warning">Missing data warnings</div>
                    {supplementFacts.warnings.map((w) => (
                      <div key={w} className="text-[10px] text-warning">{w}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Auri Suggestions */}
            <div className="rounded-lg border border-line bg-white overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-line">
                <Sparkles className="h-3.5 w-3.5" style={{ color: P }} />
                <span className="text-xs font-semibold text-ink">Auri Suggestions</span>
                <Sparkles className="h-3 w-3" style={{ color: P }} />
                <span className="ml-auto text-[9px] text-muted italic">Never auto-applies</span>
              </div>
              <div className="divide-y divide-line">
                {activeSuggestions.map((s) => (
                  <div key={s.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-ink leading-snug">{s.suggestion}</p>
                      <button onClick={() => dismissSuggestion(s.id)} className="shrink-0 text-muted hover:text-ink">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted">
                      <span className="font-semibold text-ink">Reason:</span> {s.reason}
                    </p>
                    <p className="text-[10px] text-muted">
                      <span className="font-semibold text-ink">Source/citation:</span> {s.source}
                    </p>
                    <p className="text-[10px] text-muted">
                      <span className="font-semibold text-ink">Confidence:</span> {s.confidence.charAt(0).toUpperCase() + s.confidence.slice(1)}
                    </p>
                    <PrimaryButton className="w-full justify-center text-[10px] h-7" onClick={() => {}}>
                      Create new version
                    </PrimaryButton>
                  </div>
                ))}
                {activeSuggestions.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-muted">No active suggestions.</div>
                )}
              </div>
              <div className="border-t border-line px-4 py-2 text-[9px] text-muted">
                Auri suggestions are advisory only. Auri never auto-changes the formula.
              </div>
            </div>

            {/* Blocking / Review Warnings */}
            <div className="rounded-lg border border-line bg-white overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-line">
                <Shield className="h-3.5 w-3.5 text-muted" />
                <span className="text-xs font-semibold text-ink">Blocking / Review Warnings</span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-muted mb-1">Blocking Issues</div>
                  <div className="rounded border border-success/20 bg-success/5 px-3 py-2 text-xs text-success font-medium">
                    Blocking: none.
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-muted mb-1">Review Items</div>
                  <div className="space-y-1.5">
                    <div className="rounded border border-warning/30 bg-warning/5 px-3 py-2 text-[10px] text-warning">
                      Active bitterness risk should be reviewed before Lab Ready.
                    </div>
                    <div className="rounded border border-warning/30 bg-warning/5 px-3 py-2 text-[10px] text-warning">
                      Pectin / acid / solids balance should be confirmed during formula lock.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section rows ─────────────────────────────────────────────────────────────
function SectionRows({
  section,
  rows,
  onPatch,
  onRemove,
  onAdd,
}: {
  section: FormulaSection;
  rows: FormulaMaterial[];
  onPatch: (id: string, p: Partial<FormulaMaterial>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <>
      {/* Section header */}
      <tr className="border-t border-line">
        <td colSpan={9} className="px-3 py-2">
          <span
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: P }}
          >
            {section}
          </span>
        </td>
      </tr>

      {/* Rows */}
      {rows.map((row) => (
        <tr key={row.id} className="group border-t border-line hover:bg-canvas-alt/40">
          <td className="px-2 py-1.5">
            <select
              className="h-7 w-full rounded border border-transparent bg-transparent px-1 text-xs hover:border-line focus:border-line focus:outline-none"
              value={row.section}
              onChange={(e) => onPatch(row.id, { section: e.target.value as FormulaSection })}
            >
              {FORMULA_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </td>
          <td className="px-2 py-1.5">
            <input
              className="h-7 w-full rounded border border-transparent bg-transparent px-2 text-xs hover:border-line focus:border-line focus:outline-none"
              value={row.itemNumber ?? ''}
              onChange={(e) => onPatch(row.id, { itemNumber: e.target.value })}
              placeholder="RM-####"
            />
          </td>
          <td className="px-2 py-1.5">
            <div className="flex items-center gap-1">
              {row.supplyType.startsWith('customer') && (
                <AlertTriangle className="h-3 w-3 shrink-0 text-warning" />
              )}
              <input
                className="h-7 w-full rounded border border-transparent bg-transparent px-2 text-xs hover:border-line focus:border-line focus:outline-none"
                value={row.rawMaterialName}
                onChange={(e) => onPatch(row.id, { rawMaterialName: e.target.value })}
                placeholder="Ingredient name"
              />
            </div>
          </td>
          <td className="px-2 py-1.5">
            <input
              type="number"
              step="any"
              className="h-7 w-full rounded border border-transparent bg-transparent px-2 text-right text-xs tabular-nums hover:border-line focus:border-line focus:outline-none"
              value={row.inputClaimMg ?? ''}
              onChange={(e) => onPatch(row.id, { inputClaimMg: parseOptionalNumber(e.target.value) })}
              placeholder="—"
            />
          </td>
          <td className="px-2 py-1.5">
            <input
              type="number"
              step="any"
              className="h-7 w-full rounded border border-transparent bg-transparent px-2 text-right text-xs tabular-nums hover:border-line focus:border-line focus:outline-none"
              value={row.purityPercent ?? ''}
              onChange={(e) => onPatch(row.id, { purityPercent: parseOptionalNumber(e.target.value) })}
            />
          </td>
          <td className="px-2 py-1.5">
            <input
              type="number"
              step="any"
              className="h-7 w-full rounded border border-transparent bg-transparent px-2 text-right text-xs tabular-nums hover:border-line focus:border-line focus:outline-none"
              value={row.overagePercent ?? ''}
              onChange={(e) => onPatch(row.id, { overagePercent: parseOptionalNumber(e.target.value) })}
            />
          </td>
          {/* Computed — read-only */}
          <td className="px-3 py-1.5 text-right tabular-nums text-xs font-medium text-ink">
            {row.unitWeightMg != null ? formatNumber(row.unitWeightMg, 0) : '—'}
          </td>
          <td className="px-3 py-1.5 text-right tabular-nums text-xs font-medium text-ink">
            {row.labRunG != null ? `${formatNumber(row.labRunG, 3)}` : '—'}
          </td>
          <td className="px-2 py-1.5">
            <button
              className="opacity-0 group-hover:opacity-100 text-danger hover:text-danger/80 transition-opacity"
              onClick={() => onRemove(row.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </td>
        </tr>
      ))}

      {/* Empty state */}
      {rows.length === 0 && (
        <tr className="border-t border-line">
          <td colSpan={9} className="px-3 py-2 text-[10px] text-muted italic">
            No ingredients in this section yet.
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Add Ingredient Slide-Over ────────────────────────────────────────────────
function AddIngredientSlideOver({
  version,
  existingMaterials,
  onAdd,
  onClose,
}: {
  version: FormulaVersion;
  existingMaterials: FormulaMaterial[];
  onAdd: (m: FormulaMaterial) => void;
  onClose: () => void;
}) {
  const [section, setSection] = useState<FormulaSection>('Active');
  const [itemNumber, setItemNumber] = useState('');
  const [ingredient, setIngredient] = useState('');
  const [supplyType, setSupplyType] = useState<SupplyType>('aura_supplied');
  const [inputClaimMg, setInputClaimMg] = useState<number | null>(null);
  const [purityPercent, setPurityPercent] = useState<number | null>(100);
  const [overagePercent, setOveragePercent] = useState<number | null>(0);
  const [notes, setNotes] = useState('');

  const previewUnitWt = calcUnitWeightMg(inputClaimMg, purityPercent, overagePercent);
  const previewLabRunG = calcLabRunG(previewUnitWt, version.batchSizeGummies);
  const beforeTotal = existingMaterials.reduce((s, m) => s + (m.unitWeightMg ?? 0), 0);
  const afterTotal = beforeTotal + (previewUnitWt ?? 0);
  const pctWeight = afterTotal > 0 && previewUnitWt != null
    ? (previewUnitWt / afterTotal * 100)
    : null;

  const targetMg = version.targetWeightMg ?? null;
  const remaining = targetMg != null ? targetMg - afterTotal : null;

  function handleAdd() {
    onAdd({
      id: uuid(),
      formulaVersionId: version.id,
      section,
      itemNumber: itemNumber || null,
      rawMaterialName: ingredient,
      supplyType,
      inputClaimMg,
      purityPercent,
      overagePercent,
      notes,
      sortOrder: existingMaterials.length,
    });
  }

  return (
    <div
      className="fixed right-0 top-0 z-50 flex h-full w-[440px] flex-col border-l border-line bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-ink">Add Ingredient</h2>
          <p className="text-xs text-muted mt-0.5">
            Slide in one formula composition row. Auri calculates unit weight, lab run grams, and % weight for review only.
          </p>
        </div>
        <button onClick={onClose} className="text-muted hover:text-ink">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
        {/* Row 1: Section + Item # */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Section</label>
            <select
              className="h-9 w-full rounded-md border border-line bg-white px-2 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': P } as React.CSSProperties}
              value={section}
              onChange={(e) => setSection(e.target.value as FormulaSection)}
            >
              {FORMULA_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Item #</label>
            <input
              className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': P } as React.CSSProperties}
              value={itemNumber}
              onChange={(e) => setItemNumber(e.target.value)}
              placeholder="RM-####"
            />
          </div>
        </div>

        {/* Row 2: Ingredient + Source */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Ingredient</label>
            <input
              className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': P } as React.CSSProperties}
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              placeholder="Ingredient name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Source / supply status</label>
            <select
              className="h-9 w-full rounded-md border border-line bg-white px-2 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': P } as React.CSSProperties}
              value={supplyType}
              onChange={(e) => setSupplyType(e.target.value as SupplyType)}
            >
              {SUPPLY_TYPES.map((t) => <option key={t} value={t}>{supplyTypeLabel(t)}</option>)}
            </select>
          </div>
        </div>

        {/* Row 3: Input/Claim + Purity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Input / Claim (mg)</label>
            <input
              type="number"
              step="any"
              className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': P } as React.CSSProperties}
              value={inputClaimMg ?? ''}
              onChange={(e) => setInputClaimMg(parseOptionalNumber(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Purity %</label>
            <input
              type="number"
              step="any"
              className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': P } as React.CSSProperties}
              value={purityPercent ?? ''}
              onChange={(e) => setPurityPercent(parseOptionalNumber(e.target.value))}
            />
          </div>
        </div>

        {/* Overage */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Overage %</label>
            <input
              type="number"
              step="any"
              className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': P } as React.CSSProperties}
              value={overagePercent ?? ''}
              onChange={(e) => setOveragePercent(parseOptionalNumber(e.target.value))}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Notes</label>
          <textarea
            rows={3}
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': P } as React.CSSProperties}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Calculated Preview */}
        <div className="rounded-lg border-2 border-ink/10 bg-canvas-alt overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-line">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: P }}>Calculated Preview</div>
              <div className="text-[10px] text-muted">Live impact before this row is saved.</div>
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted border border-line rounded px-2 py-0.5">Not Saved Yet</span>
          </div>

          {/* Top 3 metrics */}
          <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
            <CalcCell label="Calculated Unit Wt (mg)" value={previewUnitWt != null ? `${formatNumber(previewUnitWt, 2)} mg` : '— mg'} />
            <CalcCell label="Calculated Lab Run (g)" value={previewLabRunG != null ? `${formatNumber(previewLabRunG, 3)} g` : '— g'} />
            <CalcCell label="Calculated % Wt" value={pctWeight != null ? `${formatNumber(pctWeight, 2)}%` : '—%'} />
          </div>

          {/* Impact row */}
          <div className="grid grid-cols-3 divide-x divide-line">
            <CalcCell label="Before Formula Total" value={`${formatNumber(beforeTotal, 0)} mg`} />
            <CalcCell label="After Formula Total" value={`${formatNumber(afterTotal, 0)} mg`} />
            <div className="px-3 py-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted mb-1">Formula Impact</div>
              <p className="text-[10px] font-semibold text-ink leading-snug">
                Adds {formatNumber(previewUnitWt ?? 0, 0)} mg to formula.
                {remaining != null
                  ? remaining >= 0
                    ? ` Formula remains under wet target by ${formatNumber(remaining, 0)} mg.`
                    : ` Formula is ${formatNumber(Math.abs(remaining), 0)} mg over wet target.`
                  : ''}
              </p>
            </div>
          </div>

          {/* Summary bar */}
          <div className={cn(
            'px-4 py-2 text-[10px] font-medium',
            remaining != null && remaining < 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success',
          )}>
            {remaining != null
              ? remaining >= 0
                ? `Adds ${formatNumber(previewUnitWt ?? 0, 0)} mg to formula. Formula remains under wet target by ${formatNumber(remaining, 0)} mg.`
                : `Formula is ${formatNumber(Math.abs(remaining), 0)} mg over wet target.`
              : 'Fill in Input / Claim mg to see impact.'}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
        <OutlineButton onClick={onClose}>Cancel</OutlineButton>
        <PrimaryButton onClick={handleAdd} disabled={!ingredient.trim()}>
          <Plus className="h-3.5 w-3.5" />
          Add Ingredient
        </PrimaryButton>
      </div>
    </div>
  );
}

// ─── Small shared components ──────────────────────────────────────────────────
function PrimaryButton({ children, onClick, disabled, className }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-50',
        className,
      )}
      style={{ backgroundColor: P }}
      onMouseEnter={(e) => !disabled && ((e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(337,62%,26%)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = P)}
    >
      {children}
    </button>
  );
}

function OutlineButton({ children, onClick, disabled }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:bg-canvas-alt disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function DosageBadge({ label }: { label: string }) {
  return (
    <span className="rounded border border-line bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
      {label}
    </span>
  );
}

function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px]" style={{ borderColor: P_BORDER, color: P, backgroundColor: P_LIGHT }}>
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function EditField({ label, value, onChange, type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">{label}</label>
      <input
        type={type}
        className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function CalcCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-3">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-muted mb-1">{label}</div>
      <div className="text-xs font-bold text-ink">{value}</div>
    </div>
  );
}
