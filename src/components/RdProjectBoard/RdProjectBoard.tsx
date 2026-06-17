import { cn } from '@/lib/utils';

const P = 'hsl(337,62%,32%)';

// ─── Types ────────────────────────────────────────────────────────────────────
type Priority = 'Urgent' | 'High' | 'Normal' | 'Low';
type Readiness = 'Ready' | 'Blocked' | 'Partial' | 'Unknown';

interface RdProject {
  id: string;
  customer: string;
  name: string;
  dosageForm: string;
  priority: Priority;
  sampleDate: string;
  rdOwner: string;
  salesOwner: string;
  formula: string;
  samples: number;
  stage: string;
  readiness?: Readiness;
  blocker?: string;
  blockerType?: 'red' | 'yellow' | 'green';
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const LANES: { id: string; label: string; projects: RdProject[] }[] = [
  {
    id: 'new_intake',
    label: 'New / Intake',
    projects: [
      { id: 'p1', customer: 'Samurai Wellness', name: 'Whiskey Matcha Gummy', dosageForm: 'Gummy', priority: 'High', sampleDate: 'Jun 21', rdOwner: 'Nadia', salesOwner: 'Maya', formula: 'Needs v1', samples: 60, stage: 'New / Intake', blocker: 'Top blocker: intake brief missing active target.', blockerType: 'red' },
    ],
  },
  {
    id: 'needs_formula',
    label: 'Needs Formula',
    projects: [
      { id: 'p2', customer: 'Apex Nutrition', name: 'Magnesium Glycinate Softgel', dosageForm: 'Softgel', priority: 'Urgent', sampleDate: 'Jun 24', rdOwner: 'R&D', salesOwner: 'Leo', formula: 'Needs v1', samples: 90, stage: 'Needs Formula', blocker: 'Top blocker: define active load before formula build.', blockerType: 'red' },
    ],
  },
  {
    id: 'ingredient_check',
    label: 'Ingredient Check',
    projects: [
      { id: 'p3', customer: 'Samurai Wellness', name: 'Imperial Matcha Focus', dosageForm: 'Gummy', priority: 'Urgent', sampleDate: 'Jun 18', rdOwner: 'Nadia', salesOwner: 'Maya', formula: 'v1.3', samples: 120, stage: 'Ingredient Check', blocker: 'Blocked: Customer-supplied Imperial Matcha not received.', blockerType: 'red' },
    ],
  },
  {
    id: 'waiting_ingredients',
    label: 'Waiting on Ingredients',
    projects: [
      { id: 'p4', customer: 'Northstar Brands', name: 'Sleep Berry Gummies', dosageForm: 'Gummy', priority: 'High', sampleDate: 'Jun 20', rdOwner: 'Ava', salesOwner: 'Sam', formula: 'v2.1', samples: 80, stage: 'Waiting on Ingredients', blocker: 'Blocked: Pectin Blend available in warehouse but not transferred to R&D lab.', blockerType: 'yellow' },
    ],
  },
  {
    id: 'ready_for_lab',
    label: 'Ready for Lab',
    projects: [
      { id: 'p5', customer: 'Vital Leaf', name: 'Citrus Focus Chew', dosageForm: 'Gummy', priority: 'Normal', sampleDate: 'Jun 19', rdOwner: 'Ria', salesOwner: 'Omar', formula: 'v1.0', samples: 60, stage: 'Ready for Lab', readiness: 'Ready', blocker: 'All ingredients ready - Lab Ready gate passed.', blockerType: 'green' },
    ],
  },
  {
    id: 'in_lab',
    label: 'In Lab → Complete',
    projects: [
      { id: 'p6', customer: 'Greenpoint', name: 'Collagen Mango', dosageForm: 'Gummy', priority: 'Normal', sampleDate: '', rdOwner: 'Jon', salesOwner: 'Leah', formula: 'v1.2', samples: 48, stage: 'Cook & Deposit', readiness: 'Ready', blocker: 'No blocker - cooking today.', blockerType: 'green' },
    ],
  },
];

const STATS = [
  { label: 'Active Projects', value: 24 },
  { label: 'Waiting Ingredients', value: 7 },
  { label: 'Ready for Lab', value: 5 },
  { label: 'Customer Feedback', value: 4 },
  { label: 'Due This Week', value: 9 },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function RdProjectBoard() {
  return (
    <div className="min-h-full p-6">
      {/* Header */}
      <div className="mb-5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">
          R&D Project Board / R&D Priorities
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink">Prioritized R&D projects before Formula Builder</h1>
            <p className="mt-1 text-sm text-muted">One list showing project stage, owners, sample due dates, ingredient readiness, sample count, and top blocker.</p>
          </div>
          <span className="ml-4 shrink-0 rounded border px-2.5 py-1 text-[10px] font-semibold" style={{ color: P, borderColor: P, backgroundColor: 'hsl(337,62%,96%)' }}>
            Route: /rnd-projects or /rnd-priorities
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 flex flex-wrap gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-lg border border-line bg-white px-5 py-3 min-w-[120px]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{s.label}</div>
            <div className="mt-0.5 text-2xl font-bold text-ink">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LANES.map((lane) => (
          <div key={lane.id} className="flex w-[200px] shrink-0 flex-col">
            {/* Lane header */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">{lane.label}</span>
              <span className="rounded-full bg-canvas-alt px-2 py-0.5 text-[10px] font-semibold text-muted">
                {lane.projects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {lane.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ))}

        {/* "Other lanes" column note */}
        <div className="flex w-[200px] shrink-0 flex-col">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">In Lab → Complete</span>
            <span className="rounded-full bg-canvas-alt px-2 py-0.5 text-[10px] font-semibold text-muted">11</span>
          </div>
          <div className="rounded-lg border border-line bg-white p-3 space-y-2">
            <div className="text-[10px] text-muted">Other lanes represented</div>
            <p className="text-xs font-semibold text-ink">Curing / Evaluate / Customer Feedback / Ready for Sign-Off / On Hold / Complete</p>
            <div className="rounded border border-warning/30 bg-warning/5 p-2 text-[10px] text-muted">
              Board uses same card pattern across all remaining lanes.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-[10px] text-muted text-right">R&D Project Board mockup · static docs only</div>
    </div>
  );
}

function ProjectCard({ project }: { project: RdProject }) {
  return (
    <div className="rounded-lg border border-line bg-white p-3 space-y-2">
      <div className="text-[9px] font-semibold text-muted uppercase tracking-wider">{project.customer}</div>
      <div className="text-sm font-bold text-ink leading-snug">{project.name}</div>

      <div className="grid grid-cols-2 gap-1.5">
        <MiniField label="Dosage" value={project.dosageForm} />
        <MiniField label="Priority" value={project.priority} highlight={project.priority === 'Urgent'} />
        {project.sampleDate && <MiniField label="Sample Date" value={project.sampleDate} />}
        <MiniField label="Owner" value={`${project.rdOwner} / ${project.salesOwner}`} />
        <MiniField label="Formula" value={project.formula} />
        <MiniField label="Samples" value={String(project.samples)} />
        {project.stage && project.stage !== project.rdOwner && project.id === 'p6' && (
          <MiniField label="Stage" value={project.stage} />
        )}
        {project.readiness && (
          <MiniField label="Readiness" value={project.readiness} />
        )}
      </div>

      {project.blocker && (
        <div
          className={cn(
            'rounded p-2 text-[10px] leading-snug',
            project.blockerType === 'red' && 'bg-danger/10 text-danger',
            project.blockerType === 'yellow' && 'bg-warning/10 text-warning',
            project.blockerType === 'green' && 'bg-success/10 text-success',
          )}
        >
          {project.blocker}
        </div>
      )}
    </div>
  );
}

function MiniField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[8px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={cn('text-[10px] font-semibold text-ink', highlight && 'text-danger')}>{value}</div>
    </div>
  );
}
