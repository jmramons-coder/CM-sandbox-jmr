import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

const REQ_CATEGORIES = ['Medical', 'Rehabilitation', 'Employment', 'Documentation', 'Pharmacy'];

export function CaseRequirementModal({ onClose, onSave, initial }: {
  onClose: () => void;
  onSave: (req: { name: string; category: string; dueDate: string; followUpDate: string; notes: string }) => void;
  initial?: { name: string; category: string; dueDate: string; followUpDate: string; notes?: string };
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [followUpDate, setFollowUpDate] = useState(initial?.followUpDate ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const canSubmit = name.trim().length > 0 && category !== '';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40">
      <div className="relative flex w-[520px] flex-col rounded-xl border border-border-default bg-white shadow-[0_24px_48px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between border-b border-[#e8eaed] px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">{isEdit ? 'Edit Requirement' : 'Add Requirement'}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-text-secondary hover:bg-surface-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">Name <span className="text-brand-red">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monthly Physician Follow-Up" className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">Category <span className="text-brand-red">*</span></label>
            <div className="relative">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full appearance-none rounded-md border border-[#b7bbc2] bg-white px-3 pr-8 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue">
                <option value="">Select category...</option>
                {REQ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">Due Date</label>
              <input type="text" value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="e.g. Apr 30, 2026" className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">Follow-Up Date</label>
              <input type="text" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} placeholder="e.g. May 5, 2026" className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add details, context, or instructions..." rows={3} className="w-full rounded-md border border-[#b7bbc2] bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[#e8eaed] px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-full border border-border-default px-5 py-2.5 text-xs font-bold uppercase tracking-[0.4px] text-text-secondary transition-colors hover:bg-surface-muted">Cancel</button>
          <button type="button" disabled={!canSubmit} onClick={() => onSave({ name: name.trim(), category, dueDate: dueDate || 'TBD', followUpDate: followUpDate || 'TBD', notes: notes.trim() })} className="rounded-full bg-brand-blue px-6 py-2.5 text-xs font-bold uppercase tracking-[0.4px] text-white transition-colors enabled:hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-45">{isEdit ? 'Save Changes' : 'Add Requirement'}</button>
        </div>
      </div>
    </div>
  );
}
