'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { requestItemApi } from '@/services/requestItemApi';
import { RequestItem, RequestItemOptions, RequestItemPayload } from '@/types/requestItem';

const emptyForm = { request_id: '', medicine_id: '', quantity: '1', notes: '' };

export default function RequestItemsPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<RequestItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<RequestItem | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await requestItemApi.getAll()); }
    catch (error) { setMessage({ ok: false, text: error instanceof Error ? error.message : 'Could not load request items' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const value = query.toLowerCase().trim();
    return items.filter((item) => !value || [item.request_item_id, item.request_id, item.medicine_id, item.medicine_name, item.notes]
      .some((field) => String(field ?? '').toLowerCase().includes(value)));
  }, [items, query]);

  const done = async (text: string) => {
    setFormOpen(false); setEditing(null); setMessage({ ok: true, text }); await load();
  };

  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <Sidebar />
      <main className="min-h-screen px-4 py-7 sm:px-6 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-semibold text-gray-500">Dashboard / Request Items</p><h1 className="mt-1 text-3xl font-bold text-gray-900">Request Item Management</h1><p className="mt-2 text-sm text-gray-600">Create, view, edit and delete requested medicine items.</p></div>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Request Item</button>
          </header>

          <section className="mb-5 grid gap-4 sm:grid-cols-3">
            <Card label="Total Records" value={items.length} />
            <Card label="Total Quantity" value={items.reduce((sum, item) => sum + Number(item.quantity), 0)} />
            <Card label="Different Medicines" value={new Set(items.map((item) => item.medicine_id)).size} />
          </section>

          <section className="mb-5 flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search item, request, medicine or notes..." className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-emerald-500" /></div>
            <button onClick={load} className="rounded-xl border border-gray-300 p-2.5 text-gray-700 hover:bg-gray-50"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {loading ? <p className="p-10 text-center font-semibold text-gray-600">Loading request items...</p> : filtered.length === 0 ? <p className="p-12 text-center font-semibold text-gray-600">No request items found.</p> :
              <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-100 text-xs uppercase text-gray-600"><tr>{['Item ID', 'Request ID', 'Medicine', 'Quantity', 'Notes', 'Status', 'Actions'].map((h) => <th key={h} className="px-5 py-4">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtered.map((item) => <tr key={item.request_item_id} className="hover:bg-emerald-50/30"><td className="px-5 py-4 font-bold text-emerald-700">#{item.request_item_id}</td><td className="px-5 py-4 font-semibold">#{item.request_id}</td><td className="px-5 py-4"><p className="font-bold text-gray-900">{item.medicine_name || `Medicine #${item.medicine_id}`}</p><p className="text-xs text-gray-500">ID: {item.medicine_id}{item.strength ? ` • ${item.strength}` : ''}</p></td><td className="px-5 py-4 font-bold">{item.quantity}</td><td className="max-w-xs px-5 py-4 text-gray-600">{item.notes || '—'}</td><td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{item.request_status}</span></td><td className="px-5 py-4"><div className="flex gap-1"><button title="Edit" onClick={() => { setEditing(item); setFormOpen(true); }} className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"><Pencil className="h-4 w-4" /></button><button title="Delete" onClick={() => setDeleting(item)} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>}
          </section>
        </div>
      </main>

      {formOpen && <ItemForm item={editing} onClose={() => setFormOpen(false)} onDone={done} onError={(text) => setMessage({ ok: false, text })} />}
      {deleting && <Confirm item={deleting} onCancel={() => setDeleting(null)} onConfirm={async () => { try { await requestItemApi.remove(deleting.request_item_id); setDeleting(null); await done('Request item deleted successfully.'); } catch (e) { setMessage({ ok: false, text: e instanceof Error ? e.message : 'Delete failed' }); } }} />}
      {message && <div className={`fixed bottom-5 right-5 z-[70] rounded-xl border bg-white px-5 py-3 text-sm font-bold shadow-xl ${message.ok ? 'border-emerald-200 text-emerald-700' : 'border-rose-200 text-rose-700'}`}>{message.text}<button onClick={() => setMessage(null)} className="ml-4">×</button></div>}
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold text-gray-900">{value}</p></div>; }

function ItemForm({ item, onClose, onDone, onError }: { item: RequestItem | null; onClose: () => void; onDone: (text: string) => void; onError: (text: string) => void }) {
  const [form, setForm] = useState(item ? { request_id: String(item.request_id), medicine_id: String(item.medicine_id), quantity: String(item.quantity), notes: item.notes ?? '' } : emptyForm);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<RequestItemOptions>({ requests: [], medicines: [] });
  const [optionsLoading, setOptionsLoading] = useState(true);
  useEffect(() => {
    requestItemApi.getOptions()
      .then((data) => {
        setOptions(data);
        if (!item) {
          setForm((current) => ({
            ...current,
            request_id: current.request_id || String(data.requests[0]?.request_id ?? ''),
            medicine_id: current.medicine_id || String(data.medicines[0]?.medicine_id ?? ''),
          }));
        }
      })
      .catch((error) => onError(error instanceof Error ? error.message : 'Could not load form options'))
      .finally(() => setOptionsLoading(false));
  }, [item, onError]);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); const payload: RequestItemPayload = { request_id: Number(form.request_id), medicine_id: Number(form.medicine_id), quantity: Number(form.quantity), notes: form.notes.trim() || undefined }; if (![payload.request_id, payload.medicine_id, payload.quantity].every((v) => Number.isInteger(v) && v > 0)) return onError('Request ID, Medicine ID and Quantity must be positive whole numbers.'); setSaving(true); try { if (item) await requestItemApi.update(item.request_item_id, payload); else await requestItemApi.create(payload); await onDone(item ? 'Request item updated successfully.' : 'Request item created successfully.'); } catch (error) { onError(error instanceof Error ? error.message : 'Save failed'); } finally { setSaving(false); } };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between border-b pb-4"><h2 className="text-xl font-bold text-gray-900">{item ? 'Edit Request Item' : 'Add Request Item'}</h2><button onClick={onClose}><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="mt-5 space-y-4"><div><label className="text-xs font-bold uppercase text-gray-700">Medicine Request</label><select required disabled={optionsLoading} value={form.request_id} onChange={(e) => setForm({ ...form, request_id: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-emerald-500"><option value="">Select a request</option>{options.requests.map((request) => <option key={request.request_id} value={request.request_id}>Request #{request.request_id} — {request.priority_level} • {request.request_status}</option>)}</select></div><div><label className="text-xs font-bold uppercase text-gray-700">Medicine</label><select required disabled={optionsLoading} value={form.medicine_id} onChange={(e) => setForm({ ...form, medicine_id: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-emerald-500"><option value="">Select a medicine</option>{options.medicines.map((medicine) => <option key={medicine.medicine_id} value={medicine.medicine_id}>{medicine.medicine_name}{medicine.generic_name ? ` (${medicine.generic_name})` : ''}{medicine.strength ? ` — ${medicine.strength}` : ''}</option>)}</select></div><Field label="Quantity" value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} /><div><label className="text-xs font-bold uppercase text-gray-700">Notes</label><textarea rows={3} maxLength={255} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-500" placeholder="Optional notes" /></div>{!optionsLoading && (!options.requests.length || !options.medicines.length) && <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Add at least one medicine request and medicine before creating an item.</p>}<div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="rounded-xl border px-4 py-2 font-semibold">Cancel</button><button disabled={saving || optionsLoading || !options.requests.length || !options.medicines.length} className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : optionsLoading ? 'Loading...' : 'Save Item'}</button></div></form></div></div>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) { return <div><label className="text-xs font-bold uppercase text-gray-700">{label}</label><input required type="number" min="1" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-500" /></div>; }

function Confirm({ item, onCancel, onConfirm }: { item: RequestItem; onCancel: () => void; onConfirm: () => void }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6"><h2 className="text-xl font-bold text-gray-900">Delete Request Item?</h2><p className="mt-2 text-sm text-gray-600">Item #{item.request_item_id} will be permanently deleted.</p><div className="mt-6 flex justify-end gap-3"><button onClick={onCancel} className="rounded-xl border px-4 py-2 font-semibold">Cancel</button><button onClick={onConfirm} className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white">Delete</button></div></div></div>; }
