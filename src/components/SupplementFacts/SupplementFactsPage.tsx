import { useState, useCallback } from 'react';

interface NutrientDef {
  label: string;
  unit: 'mg' | 'mcg';
  dv: number | null;
  order: number;
}

const NUTRIENTS: Record<string, NutrientDef> = {
  vitamin_a:     { label: 'Vitamin A',                    unit: 'mcg', dv: 900,   order: 1   },
  vitamin_c:     { label: 'Vitamin C',                    unit: 'mg',  dv: 90,    order: 2   },
  vitamin_d:     { label: 'Vitamin D',                    unit: 'mcg', dv: 20,    order: 3   },
  vitamin_e:     { label: 'Vitamin E',                    unit: 'mg',  dv: 15,    order: 4   },
  vitamin_k:     { label: 'Vitamin K',                    unit: 'mcg', dv: 120,   order: 5   },
  thiamin:       { label: 'Thiamin',                      unit: 'mg',  dv: 1.2,   order: 6   },
  riboflavin:    { label: 'Riboflavin',                   unit: 'mg',  dv: 1.3,   order: 7   },
  niacin:        { label: 'Niacin',                       unit: 'mg',  dv: 16,    order: 8   },
  vitamin_b6:    { label: 'Vitamin B6',                   unit: 'mg',  dv: 1.7,   order: 9   },
  folate:        { label: 'Folate',                       unit: 'mcg', dv: 400,   order: 10  },
  vitamin_b12:   { label: 'Vitamin B12',                  unit: 'mcg', dv: 2.4,   order: 11  },
  biotin:        { label: 'Biotin',                       unit: 'mcg', dv: 30,    order: 12  },
  pantothenic:   { label: 'Pantothenic Acid',             unit: 'mg',  dv: 5,     order: 13  },
  choline:       { label: 'Choline',                      unit: 'mg',  dv: 550,   order: 14  },
  calcium:       { label: 'Calcium',                      unit: 'mg',  dv: 1300,  order: 15  },
  chromium:      { label: 'Chromium',                     unit: 'mcg', dv: 35,    order: 16  },
  copper:        { label: 'Copper',                       unit: 'mg',  dv: 0.9,   order: 17  },
  iodine:        { label: 'Iodine',                       unit: 'mcg', dv: 150,   order: 18  },
  iron:          { label: 'Iron',                         unit: 'mg',  dv: 18,    order: 19  },
  magnesium:     { label: 'Magnesium',                    unit: 'mg',  dv: 420,   order: 20  },
  manganese:     { label: 'Manganese',                    unit: 'mg',  dv: 2.3,   order: 21  },
  molybdenum:    { label: 'Molybdenum',                   unit: 'mcg', dv: 45,    order: 22  },
  phosphorus:    { label: 'Phosphorus',                   unit: 'mg',  dv: 1250,  order: 23  },
  potassium:     { label: 'Potassium',                    unit: 'mg',  dv: 4700,  order: 24  },
  selenium:      { label: 'Selenium',                     unit: 'mcg', dv: 55,    order: 25  },
  zinc:          { label: 'Zinc',                         unit: 'mg',  dv: 11,    order: 26  },
  melatonin:     { label: 'Melatonin',                    unit: 'mg',  dv: null,  order: 100 },
  l_theanine:    { label: 'L-Theanine',                   unit: 'mg',  dv: null,  order: 101 },
  ashwagandha:   { label: 'Ashwagandha Ext. (KSM-66®)', unit: 'mg', dv: null, order: 102 },
  lemon_balm:    { label: 'Lemon Balm Ext.',              unit: 'mg',  dv: null,  order: 103 },
  valerian:      { label: 'Valerian Root Ext.',           unit: 'mg',  dv: null,  order: 104 },
  passionflower: { label: 'Passionflower Ext.',           unit: 'mg',  dv: null,  order: 105 },
  gaba:          { label: 'GABA',                         unit: 'mg',  dv: null,  order: 106 },
  elderberry:    { label: 'Elderberry Ext.',              unit: 'mg',  dv: null,  order: 107 },
  echinacea:     { label: 'Echinacea Ext.',               unit: 'mg',  dv: null,  order: 108 },
  coq10:         { label: 'CoQ10',                        unit: 'mg',  dv: null,  order: 109 },
  turmeric:      { label: 'Turmeric Ext.',                unit: 'mg',  dv: null,  order: 110 },
  resveratrol:   { label: 'Resveratrol',                  unit: 'mg',  dv: null,  order: 111 },
  berberine:     { label: 'Berberine HCl',                unit: 'mg',  dv: null,  order: 112 },
  quercetin:     { label: 'Quercetin',                    unit: 'mg',  dv: null,  order: 113 },
  alpha_lipoic:  { label: 'Alpha Lipoic Acid',            unit: 'mg',  dv: null,  order: 114 },
};

function fmtAmount(val: number, unit: 'mg' | 'mcg'): string {
  let v: number;
  if (unit === 'mcg') {
    v = val < 1 ? parseFloat(val.toFixed(2)) : val < 10 ? parseFloat(val.toFixed(1)) : Math.round(val);
  } else {
    v = val < 0.5 ? parseFloat(val.toFixed(2)) : val < 5 ? parseFloat(val.toFixed(1)) : Math.round(val);
  }
  return `${v} ${unit}`;
}

function fmtDV(pct: number): string {
  if (pct < 1) return '<1%';
  if (pct < 10) return `${Math.round(pct)}%`;
  return `${Math.round(pct / 2) * 2}%`;
}

interface Ingredient { id: number; key: string; amount: number; }

const DEFAULT: Ingredient[] = [
  { id: 1, key: 'melatonin',   amount: 3   },
  { id: 2, key: 'l_theanine',  amount: 100 },
  { id: 3, key: 'ashwagandha', amount: 150 },
  { id: 4, key: 'lemon_balm',  amount: 150 },
  { id: 5, key: 'vitamin_b6',  amount: 1.7 },
  { id: 6, key: 'vitamin_d',   amount: 25  },
];

const P = 'hsl(337,62%,32%)';

function Panel({ ingredients, gps, pw, name }: { ingredients: Ingredient[]; gps: number; pw: number; name: string }) {
  const sw = (gps * pw).toFixed(1);
  const sorted = [...ingredients].sort((a, b) => (NUTRIENTS[a.key]?.order ?? 200) - (NUTRIENTS[b.key]?.order ?? 200));
  let hasDV = false, hasNoDV = false;

  return (
    <div style={{ border: '2.5px solid #000', background: '#fff', color: '#000', fontFamily: 'Arial,Helvetica,sans-serif', padding: '6px 8px', display: 'inline-block', minWidth: 240, maxWidth: 290, fontSize: 11 }}>
      {name && <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 3 }}>{name}</div>}
      <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, marginBottom: 2 }}>Supplement Facts</div>
      <div style={{ fontSize: 10, marginBottom: 2 }}>Serving Size {gps} Gumm{gps === 1 ? 'y' : 'ies'} ({sw} g)</div>
      <div style={{ height: 7, background: '#000', margin: '3px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 'bold', borderBottom: '0.5px solid #000', paddingBottom: 1, marginBottom: 1 }}>
        <span>Amount Per Serving</span><span>% Daily Value</span>
      </div>
      {sorted.length === 0 && <div style={{ color: '#aaa', fontSize: 10, padding: '8px 0' }}>Add ingredients to generate panel</div>}
      {sorted.map(ing => {
        const n = NUTRIENTS[ing.key]; if (!n) return null;
        const amt = ing.amount * gps;
        let dvStr: string;
        if (n.dv === null) { hasNoDV = true; dvStr = '†'; }
        else { hasDV = true; dvStr = fmtDV((amt / n.dv) * 100) + '*'; }
        return (
          <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '1.5px 0', borderTop: '0.5px solid #000' }}>
            <span>{n.label}</span>
            <span style={{ whiteSpace: 'nowrap', marginLeft: 8 }}>{fmtAmount(amt, n.unit)}&nbsp;&nbsp;{dvStr}</span>
          </div>
        );
      })}
      <div style={{ height: 3, background: '#000', margin: '4px 0 3px' }} />
      {hasNoDV && <div style={{ fontSize: 9, lineHeight: 1.5 }}>† Daily Value not established.</div>}
      {hasDV && <div style={{ fontSize: 9, lineHeight: 1.5 }}>* Percent Daily Values are based on a 2,000 calorie diet.</div>}
    </div>
  );
}

let _nid = 10;

export function SupplementFactsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT);
  const [gps, setGps] = useState(2);
  const [pw, setPw] = useState(3.5);
  const [name, setName] = useState('Sleep Support Gummy');

  const add = useCallback(() => setIngredients(p => [...p, { id: _nid++, key: 'melatonin', amount: 1 }]), []);
  const remove = useCallback((id: number) => setIngredients(p => p.filter(i => i.id !== id)), []);
  const update = useCallback((id: number, field: 'key' | 'amount', val: string | number) =>
    setIngredients(p => p.map(i => i.id === id ? { ...i, [field]: val } : i)), []);

  const card: React.CSSProperties = { background: '#fff', border: '0.5px solid hsl(0,0%,88%)', borderRadius: 8, padding: '14px 16px', marginBottom: 12 };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'hsl(0,0%,50%)', display: 'block', marginBottom: 6 };
  const inp: React.CSSProperties = { border: '0.5px solid hsl(0,0%,88%)', borderRadius: 6, padding: '6px 8px', fontSize: 13, width: '100%' };

  return (
    <div style={{ minHeight: '100%', padding: 24, background: 'hsl(38,20%,96%)' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'hsl(0,0%,50%)', marginBottom: 4 }}>
          Supplement Facts Engine · FDA 21 CFR 101.36
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'hsl(0,0%,10%)', margin: 0 }}>Supplement Facts Generator</h1>
        <p style={{ marginTop: 4, fontSize: 14, color: 'hsl(0,0%,50%)' }}>
          Build a formula, get an FDA-compliant panel — rounding rules, daily values, and nutrient ordering applied automatically.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
        <div>
          <div style={card}>
            <label style={lbl}>Product Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', border: 'none', fontSize: 15, fontWeight: 600, color: 'hsl(0,0%,10%)', background: 'transparent', outline: 'none' }} placeholder="Product name (optional)" />
          </div>

          <div style={card}>
            <div style={lbl}>Serving Size</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'hsl(0,0%,50%)', display: 'block', marginBottom: 4 }}>Gummies per serving</label>
                <input type="number" min={1} max={8} step={1} value={gps} onChange={e => setGps(Math.max(1, parseInt(e.target.value) || 1))} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'hsl(0,0%,50%)', display: 'block', marginBottom: 4 }}>Piece weight (g)</label>
                <input type="number" min={0.5} max={10} step={0.1} value={pw} onChange={e => setPw(Math.max(0.1, parseFloat(e.target.value) || 0.1))} style={inp} />
              </div>
            </div>
          </div>

          <div style={{ ...card, marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ ...lbl, marginBottom: 0 }}>Ingredients</div>
              <button onClick={add} style={{ background: P, color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 28px', gap: 6, paddingBottom: 6, borderBottom: '0.5px solid hsl(0,0%,92%)', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'hsl(0,0%,50%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nutrient</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'hsl(0,0%,50%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amt / piece</span>
              <span />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ingredients.map(ing => {
                const n = NUTRIENTS[ing.key];
                return (
                  <div key={ing.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 28px', gap: 6, alignItems: 'center' }}>
                    <select value={ing.key} onChange={e => update(ing.id, 'key', e.target.value)} style={{ border: '0.5px solid hsl(0,0%,88%)', borderRadius: 6, padding: '5px 6px', fontSize: 12 }}>
                      {Object.keys(NUTRIENTS).map(k => <option key={k} value={k}>{NUTRIENTS[k].label}</option>)}
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="number" min={0.001} step="any" value={ing.amount} onChange={e => update(ing.id, 'amount', parseFloat(e.target.value) || 0)} style={{ ...inp, padding: '5px 6px', fontSize: 12 }} />
                      <span style={{ fontSize: 10, color: 'hsl(0,0%,50%)', whiteSpace: 'nowrap' }}>{n?.unit}</span>
                    </div>
                    <button onClick={() => remove(ing.id)} style={{ background: 'none', border: 'none', fontSize: 16, color: 'hsl(0,0%,65%)', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                );
              })}
              {ingredients.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: 'hsl(0,0%,65%)' }}>No ingredients. Click + Add.</div>}
            </div>
          </div>

          <div style={{ marginTop: 10, padding: '10px 14px', background: 'hsl(337,62%,96%)', borderRadius: 6, border: '0.5px solid hsl(337,62%,82%)' }}>
            <p style={{ fontSize: 11, color: P, margin: 0, lineHeight: 1.6 }}>
              <strong>FDA compliance:</strong> Amounts rounded per 21 CFR 101.9. Nutrients sorted per 21 CFR 101.36(b)(2). %DVs from 2020 Reference Daily Intakes. Botanicals receive the † footnote.
            </p>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'hsl(0,0%,50%)', marginBottom: 10 }}>
            Live Panel
          </div>
          <Panel ingredients={ingredients} gps={gps} pw={pw} name={name} />

          <div style={{ marginTop: 20, background: '#fff', border: '0.5px solid hsl(0,0%,88%)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'hsl(0,0%,50%)', marginBottom: 10 }}>
              FDA Reference Daily Values (2020)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
              {Object.entries(NUTRIENTS).filter(([, v]) => v.dv !== null).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0', borderBottom: '0.5px solid hsl(0,0%,95%)' }}>
                  <span style={{ color: 'hsl(0,0%,40%)' }}>{v.label}</span>
                  <span style={{ fontWeight: 600, color: 'hsl(0,0%,10%)' }}>{v.dv} {v.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
