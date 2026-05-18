import { useEffect, useMemo, useState } from 'react';
import { Maximize2, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import type { SystemDataset } from '../../data/multi-case-dataset';
import type { CatalogObjectKind, RelationshipIssue } from '../../domain/dataArchitecture';
import { CASE_TYPE_ANATOMY_DEFINITIONS, ENTITY_ANATOMY_DEFINITIONS } from '../../domain/entityAnatomy';
import { buildSchemaGraph, type SchemaGraph, type SchemaGraphNode } from '../../domain/schemaGraph';

type SchemaSelection =
  | { type: 'node'; id: CatalogObjectKind }
  | { type: 'edge'; id: string };

const SCHEMA_COLUMNS: Array<{
  id: string;
  label: string;
  description: string;
  kinds: CatalogObjectKind[];
}> = [
  {
    id: 'main',
    label: 'Main entities',
    description: 'Core business records and the case hub that connects the platform model.',
    kinds: ['case', 'client', 'policy', 'agent', 'application'],
  },
  {
    id: 'work',
    label: 'Utility entities',
    description: 'Work, evidence, interactions, notes, and activity events around the main entities.',
    kinds: ['requirement', 'task', 'request', 'document', 'communication', 'note', 'event'],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    description: 'Extracted evidence, AI actions, and assistant response grounding records.',
    kinds: ['document_evidence', 'ai_action', 'assistant_response'],
  },
];

type SchemaGroupId = 'all' | typeof SCHEMA_COLUMNS[number]['id'];

function groupForKind(kind: CatalogObjectKind) {
  return SCHEMA_COLUMNS.find((column) => column.kinds.includes(kind));
}

function nodeTone(group: SchemaGraphNode['group']) {
  if (group === 'core') return 'border-brand-blue/35 bg-white';
  if (group === 'work') return 'border-brand-orange/30 bg-white';
  if (group === 'audit') return 'border-border-soft bg-white';
  return 'border-purple-200 bg-white';
}

export function SchemaFlowWhiteboard({
  selectedKind,
  onSelectKind,
  dataset,
  relationshipIssues,
}: {
  selectedKind: CatalogObjectKind;
  onSelectKind: (kind: CatalogObjectKind) => void;
  dataset: SystemDataset;
  relationshipIssues: RelationshipIssue[];
}) {
  const graph = useMemo(() => buildSchemaGraph({ dataset, relationshipIssues }), [dataset, relationshipIssues]);
  const [selection, setSelection] = useState<SchemaSelection>({ type: 'node', id: selectedKind });
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setSelection({ type: 'node', id: selectedKind });
  }, [selectedKind]);

  const selectNode = (id: CatalogObjectKind) => {
    setSelection({ type: 'node', id });
    onSelectKind(id);
  };

  return (
    <>
      <SchemaWorkbench
        graph={graph}
        selection={selection}
        onSelectNode={selectNode}
        onSelectEdge={(id) => setSelection({ type: 'edge', id })}
        onExpand={() => setFullscreen(true)}
        relationshipIssues={relationshipIssues}
        fullscreen={false}
      />
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent
          className="flex flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-[1400px]"
          style={{ width: 'min(1400px, calc(100vw - 1.5rem))', height: 'min(900px, calc(100vh - 1.5rem))' }}
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Data model explorer</DialogTitle>
          </DialogHeader>
          <SchemaWorkbench
            graph={graph}
            selection={selection}
            onSelectNode={selectNode}
            onSelectEdge={(id) => setSelection({ type: 'edge', id })}
            onExpand={() => setFullscreen(false)}
            relationshipIssues={relationshipIssues}
            fullscreen
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function SchemaWorkbench({
  graph,
  selection,
  onSelectNode,
  onSelectEdge,
  onExpand,
  relationshipIssues,
  fullscreen,
}: {
  graph: SchemaGraph;
  selection: SchemaSelection;
  onSelectNode: (id: CatalogObjectKind) => void;
  onSelectEdge: (id: string) => void;
  onExpand: () => void;
  relationshipIssues: RelationshipIssue[];
  fullscreen: boolean;
}) {
  if (!fullscreen) {
    return (
      <section className="mt-2 flex h-[500px] items-center justify-center overflow-hidden rounded-xl border border-border-soft bg-[#f8fafc]">
        <div className="mx-auto max-w-[420px] px-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-brand-blue/20 bg-white text-brand-blue shadow-[0_8px_20px_rgba(0,98,150,0.12)]">
            <Maximize2 className="size-5" />
          </div>
          <p className="mt-4 text-[15px] font-semibold text-text-primary">Open the data model explorer</p>
          <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
            The data model needs room to show entity groups, relationship rails, and the inspector clearly. Expand it to explore the full database structure.
          </p>
          <button
            type="button"
            onClick={onExpand}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.3px] text-white hover:bg-brand-blue-hover"
          >
            <Maximize2 className="size-3.5" />
            Explore data model
          </button>
          <p className="mt-3 text-[10px] text-text-muted">
            {graph.nodes.length} tables · {graph.edges.length} relationships
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border-soft bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-border-soft bg-white px-4 py-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Data model explorer</p>
          <p className="mt-0.5 text-[11px] text-text-secondary">Select a table or relationship to understand how the database model supports the workspace.</p>
        </div>
        <button
          type="button"
          onClick={onExpand}
          className="inline-flex size-8 items-center justify-center rounded-full border border-border-soft bg-white text-text-secondary hover:border-brand-blue/40 hover:text-brand-blue"
          aria-label="Close data model explorer"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,0.74fr)_minmax(440px,0.46fr)] overflow-hidden">
        <div className="flex min-h-0 flex-col bg-[#f8fafc]">
          <div className="border-b border-border-soft bg-white px-4 py-2">
          <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Object groups</p>
              <p className="mt-0.5 text-[10px] text-text-secondary">Tables are grouped by their role in the platform model.</p>
            </div>
          </div>
          <SchemaCanvas
            graph={graph}
            selection={selection}
            onSelectNode={onSelectNode}
            onSelectEdge={onSelectEdge}
            fullscreen={fullscreen}
          />
        </div>
        <SchemaInspector graph={graph} selection={selection} relationshipIssues={relationshipIssues} />
      </div>
    </section>
  );
}

function SchemaCanvas({
  graph,
  selection,
  onSelectNode,
  onSelectEdge,
  fullscreen,
}: {
  graph: SchemaGraph;
  selection: SchemaSelection;
  onSelectNode: (id: CatalogObjectKind) => void;
  onSelectEdge: (id: string) => void;
  fullscreen: boolean;
}) {
  const selectedNodeId = selection.type === 'node' ? selection.id : undefined;
  const selectedEdgeId = selection.type === 'edge' ? selection.id : undefined;
  const activeEdge = selectedEdgeId ? graph.edges.find((edge) => edge.id === selectedEdgeId) : undefined;
  const selectedEdges = activeEdge
    ? [activeEdge]
    : graph.edges.filter((edge) => edge.source === selectedNodeId || edge.target === selectedNodeId);
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<SchemaGroupId>('all');
  const connectedCounts = useMemo(() => {
    const counts = new Map<CatalogObjectKind, number>();
    graph.edges.forEach((edge) => {
      counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1);
      counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1);
    });
    return counts;
  }, [graph.edges]);
  const filteredNodes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return graph.nodes.filter((node) => {
      const group = groupForKind(node.id);
      const groupMatch = activeGroup === 'all' || group?.id === activeGroup;
      const searchMatch = !needle ||
        node.id.toLowerCase().includes(needle) ||
        node.schema.tableName.toLowerCase().includes(needle) ||
        node.schema.fields.some((field) => field.name.toLowerCase().includes(needle));
      return groupMatch && searchMatch;
    });
  }, [activeGroup, graph.nodes, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
      <section className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border-soft bg-white p-3">
        <div className="grid gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search objects, fields, or table names..."
              className="h-9 w-full rounded-full border border-border-soft bg-surface-primary pl-8 pr-3 text-[12px] text-text-primary outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[{ id: 'all' as const, label: 'All', description: 'Every object', kinds: graph.nodes.map((node) => node.id) }, ...SCHEMA_COLUMNS].map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroup(group.id)}
                className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                  activeGroup === group.id
                    ? 'bg-brand-blue text-white'
                    : 'bg-surface-primary text-text-secondary hover:text-text-primary'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 min-h-0 overflow-y-auto pr-1">
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredNodes.map((node) => (
              <SchemaTableCard
                key={node.id}
                node={node}
                selected={selectedNodeId === node.id}
                related={selectedEdges.some((edge) => edge.source === node.id || edge.target === node.id)}
                relationshipCount={connectedCounts.get(node.id) ?? 0}
                groupLabel={groupForKind(node.id)?.label}
                onSelect={() => onSelectNode(node.id)}
              />
            ))}
            {!filteredNodes.length ? (
              <div className="col-span-full rounded-xl border border-dashed border-border-soft bg-surface-primary p-6 text-center">
                <p className="text-[12px] font-semibold text-text-primary">No model objects found</p>
                <p className="mt-1 text-[11px] text-text-secondary">Try a table name like case, document, action, or a field name.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-3 shrink-0 rounded-xl border border-border-soft bg-white p-2.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Mission trail</p>
            <p className="mt-0.5 text-[10px] text-text-secondary">
              {activeEdge ? 'Selected relationship is shown in the briefing panel.' : selectedNodeId ? `Showing relationships connected to ${selectedNodeId}.` : 'Select a table to inspect relationships.'}
            </p>
          </div>
          <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[9px] font-semibold text-text-muted">
            {selectedEdges.length} connected
          </span>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {(selectedEdges.length ? selectedEdges : graph.edges.slice(0, 8)).map((edge) => {
            const selected = selectedEdgeId === edge.id;
            return (
              <button
                key={edge.id}
                type="button"
                onClick={() => onSelectEdge(edge.id)}
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-left text-[10px] transition-colors ${selected ? 'border-brand-blue bg-brand-blue/10 text-brand-blue ring-2 ring-brand-blue/15' : 'border-border-soft bg-white text-text-secondary hover:border-brand-blue/40 hover:text-brand-blue'}`}
              >
                <span className="font-semibold">{edge.source}</span>
                <span className="px-1 text-text-muted">→</span>
                <span className="font-semibold">{edge.target}</span>
                <span className="ml-2 text-text-muted">{edge.relationship.label}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SchemaTableCard({
  node,
  selected,
  related,
  relationshipCount,
  groupLabel,
  onSelect,
}: {
  node: SchemaGraphNode;
  selected: boolean;
  related: boolean;
  relationshipCount: number;
  groupLabel?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${nodeTone(node.group)} ${
        selected
          ? 'border-brand-blue bg-brand-blue/10 shadow-[0_0_0_3px_rgba(0,98,150,0.14)]'
          : related
            ? 'border-brand-blue/45 bg-brand-blue/[0.03] shadow-[inset_3px_0_0_rgba(0,98,150,0.45)]'
            : 'hover:border-brand-blue/30'
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold text-text-primary">{node.schema.tableName}</p>
        <p className="mt-0.5 truncate text-[9px] uppercase tracking-wide text-text-muted">{groupLabel ?? node.group} · {node.recordCount} rows · {relationshipCount} links</p>
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-1 text-right">
        <span className="rounded-md bg-surface-primary px-1.5 py-1 text-[9px] font-semibold text-text-muted">{node.populatedFieldCount}/{node.fieldCount}</span>
        <span className="rounded-md bg-surface-primary px-1.5 py-1 text-[9px] font-semibold text-text-muted">{node.schema.primaryKey}</span>
      </div>
    </button>
  );
}

function SchemaInspector({
  graph,
  selection,
  relationshipIssues,
}: {
  graph: SchemaGraph;
  selection: SchemaSelection;
  relationshipIssues: RelationshipIssue[];
}) {
  const node = selection.type === 'node' ? graph.nodes.find((item) => item.id === selection.id) ?? graph.nodes[0] : undefined;
  const edge = selection.type === 'edge' ? graph.edges.find((item) => item.id === selection.id) : undefined;

  if (edge) {
    const issues = relationshipIssues.filter((issue) =>
      (issue.sourceKind === edge.source && issue.targetKind === edge.target) ||
      (issue.sourceKind === edge.target && issue.targetKind === edge.source),
    );
    return (
      <aside className="min-h-0 overflow-auto border-t border-border-soft bg-white p-4 xl:border-l xl:border-t-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Relationship briefing</p>
        <h4 className="mt-1 text-[15px] font-semibold text-text-primary">{edge.relationship.label}</h4>
        <p className="mt-1 text-[11px] text-text-muted">{edge.source} to {edge.target} · {edge.relationship.cardinality}</p>
        <p className="mt-3 rounded-lg bg-surface-primary p-3 text-[11px] leading-snug text-text-secondary">{edge.relationship.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <MetricBox label="Source" value={edge.source} />
          <MetricBox label="Target" value={edge.target} />
          <MetricBox label="Issues" value={String(issues.length)} />
          <MetricBox label="Path id" value={edge.id} />
        </div>
        {issues.length ? (
          <div className="mt-4 rounded-lg border border-[#f3c5c2] bg-[#fff7f7] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#cd2c23]">Validation notes</p>
            <div className="mt-2 space-y-1.5">
              {issues.slice(0, 4).map((issue) => (
                <p key={`${issue.sourceKind}-${issue.sourceId}-${issue.targetKind}-${issue.targetId}`} className="text-[10px] leading-snug text-text-secondary">
                  {issue.message}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    );
  }

  if (!node) return null;
  const anatomy = ENTITY_ANATOMY_DEFINITIONS.find((item) => item.kind === node.id);
  const caseTypeAnatomy = node.id === 'case' ? CASE_TYPE_ANATOMY_DEFINITIONS : [];
  const inbound = graph.edges.filter((item) => item.target === node.id);
  const outbound = graph.edges.filter((item) => item.source === node.id);
  const requiredFields = node.schema.fields.filter((field) => field.required);
  const refFields = node.schema.fields.filter((field) => field.ref);
  const relationshipSummary = [
    ...outbound.map((item) => `Creates ${item.target} through ${item.relationship.label}`),
    ...inbound.map((item) => `Receives ${item.source} through ${item.relationship.label}`),
  ];

  return (
    <aside className="min-h-0 overflow-auto border-t border-border-soft bg-white p-4 xl:border-l xl:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Object briefing</p>
          <h4 className="mt-1 text-[15px] font-semibold text-text-primary">{node.schema.tableName}</h4>
          <p className="mt-0.5 text-[11px] text-text-muted">{node.group} object · PK {node.schema.primaryKey} · display {node.schema.displayField}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${node.issueCount ? 'bg-[#fde5e4] text-[#cd2c23]' : 'bg-[#e7f4ec] text-[#008533]'}`}>
          {node.issueCount ? `${node.issueCount} issues` : 'healthy'}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <MetricBox label="Records" value={String(node.recordCount)} />
        <MetricBox label="Fields" value={String(node.fieldCount)} />
        <MetricBox label="Populated" value={`${node.populatedFieldCount}/${node.fieldCount}`} />
        <MetricBox label="Imports" value={node.importTarget?.supportedFormats.join(', ') ?? 'N/A'} />
      </div>
      <div className="mt-3 rounded-lg border border-border-soft bg-white p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">How to read this object</p>
        <p className="mt-1 text-[11px] leading-snug text-text-secondary">
          {node.schema.fields[0]?.description ?? `${node.schema.tableName} stores ${node.recordCount} record(s) and connects through ${inbound.length + outbound.length} relationship path(s).`}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <MetricBox label="Required" value={String(requiredFields.length)} />
          <MetricBox label="References" value={String(refFields.length)} />
        </div>
      </div>
      {anatomy ? (
        <div className="mt-3 space-y-1.5">
          <InfoBlock title="Tabs" value={anatomy.tabs.map((tab) => tab.label).join(', ')} />
          <InfoBlock title="Sections" value={anatomy.overviewSections.map((section) => section.label).join(', ')} />
          <InfoBlock title="Actions" value={anatomy.actions.join(', ')} />
        </div>
      ) : null}
      {caseTypeAnatomy.length ? (
        <div className="mt-3 rounded-lg border border-border-soft bg-white p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Case type flows</p>
          <div className="mt-2 space-y-2">
            {caseTypeAnatomy.map((item) => (
              <p key={item.caseKind} className="rounded-md bg-surface-primary px-2.5 py-2 text-[10px] text-text-secondary">
                <span className="font-semibold capitalize text-text-primary">{item.caseKind.replace('_', ' ')}</span>: {item.tabs.map((tab) => tab.label).join(', ')}
              </p>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Fields</p>
        <div className="mt-2 max-h-[190px] overflow-y-auto rounded-lg border border-border-soft">
          {node.schema.fields.map((field) => (
            <div key={field.name} className="grid grid-cols-[minmax(0,1fr)_54px_58px] items-center gap-1.5 border-b border-border-soft px-2.5 py-1.5 last:border-b-0">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-text-primary">{field.name}</p>
                {field.description ? <p className="line-clamp-1 text-[10px] text-text-muted">{field.description}</p> : field.ref ? <p className="text-[10px] text-text-muted">ref {field.ref}</p> : null}
              </div>
              <span className="rounded-full bg-surface-primary px-2 py-0.5 text-center text-[9px] font-semibold text-text-secondary">{field.type}</span>
              <span className={`rounded-full px-2 py-0.5 text-center text-[9px] font-semibold ${field.required ? 'bg-brand-blue/10 text-brand-blue' : 'bg-surface-primary text-text-muted'}`}>
                {field.required ? 'required' : 'optional'}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-1.5">
        <InfoBlock title="Relationship summary" value={relationshipSummary.length ? relationshipSummary.slice(0, 5).join('. ') : 'No relationships defined for this object'} />
        <InfoBlock title="Import rules" value={node.importTarget ? `Required: ${node.importTarget.requiredFields.join(', ')}. Relationship fields: ${node.importTarget.relationshipFields.join(', ') || 'none'}.` : 'No import target configured for this object.'} />
      </div>
    </aside>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-surface-primary px-2.5 py-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-0.5 truncate text-[11px] font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-primary px-2.5 py-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-text-secondary">{value}</p>
    </div>
  );
}
