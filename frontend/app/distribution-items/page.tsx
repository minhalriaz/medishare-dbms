'use client';
import { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { distributionItemApi } from '@/services/distributionItemApi';
import type { DistributionItem, DistributionItemOptions } from '@/types/distributionItem';

export default function DistributionItemsPage() {
  const [items, setItems] = useState<DistributionItem[]>([]);
  const [options, setOptions] = useState<DistributionItemOptions>({ distributions: [], inventory: [] });
  const [editing, setEditing] = useState<number | null>(null);
  const [distributionId, setDistributionId] = useState('');
  const [inventoryId, setInventoryId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const [rows, choices] = await Promise.all([distributionItemApi.all(), distributionItemApi.options()]);
      setItems(rows); setOptions(choices); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load distribution items'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const selected = options.distributions.find(d => d.distribution_id === Number(distributionId));
  const inventoryChoices = options.inventory.filter(i => !selected || i.organization_id === selected.distributed_by_organization_id);
  function reset() { setEditing(null); setDistributionId(''); setInventoryId(''); setQuantity('1'); }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setError(''); setMessage('');
    const payload = { distribution_id: Number(distributionId), inventory_id: Number(inventoryId), distributed_quantity: Number(quantity) };
    if (Object.values(payload).some(v => !Number.isInteger(v) || v <= 0)) { setError('Select a distribution, stock item and positive quantity.'); return; }
    setBusy(true);
    try {
      if (editing === null) await distributionItemApi.create(payload);
      else await distributionItemApi.update(editing, payload);
      setMessage(editing === null ? 'Item added and stock deducted.' : 'Item updated and stock adjusted.');
      reset(); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed'); }
    finally { setBusy(false); }
  }
  async function remove(item: DistributionItem) {
    if (!window.confirm(`Delete distribution item #${item.distribution_item_id} and return ${item.distributed_quantity} units to stock?`)) return;
    setBusy(true); setError('');
    try { await distributionItemApi.remove(item.distribution_item_id); setMessage('Item deleted and stock restored.'); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Delete failed'); }
    finally { setBusy(false); }
  }
  return <div className="min-h-screen bg-[#f7faf9]"><Sidebar /><main className="px-4 py-8 lg:ml-64 lg:px-8"><div className="mx-auto max-w-6xl space-y-6">
    <header><h1 className="text-3xl font-bold text-gray-900">Distribution Items</h1><p className="mt-2 text-gray-600">Allocate requested medicine from the distributing organization&apos;s inventory.</p></header>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{message}</p>}
    <form onSubmit={save} className="grid gap-4 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-4">
      <label className="text-sm font-semibold text-gray-700">Distribution<select required value={distributionId} onChange={e => { setDistributionId(e.target.value); setInventoryId(''); }} className="mt-2 w-full rounded-lg border p-2 text-gray-900"><option value="">Select distribution</option>{options.distributions.map(d => <option key={d.distribution_id} value={d.distribution_id}>#{d.distribution_id} · Request #{d.request_id} · Org #{d.distributed_by_organization_id}</option>)}</select></label>
      <label className="text-sm font-semibold text-gray-700">Inventory batch<select required value={inventoryId} onChange={e => setInventoryId(e.target.value)} className="mt-2 w-full rounded-lg border p-2 text-gray-900"><option value="">Select inventory</option>{inventoryChoices.map(i => <option key={i.inventory_id} value={i.inventory_id}>#{i.inventory_id} · {i.medicine_name} · {i.batch_number || 'No batch'} · {i.available_quantity} available</option>)}</select></label>
      <label className="text-sm font-semibold text-gray-700">Quantity<input required min="1" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-2 w-full rounded-lg border p-2 text-gray-900" /></label>
      <div className="flex items-end gap-2"><button disabled={busy} className="rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white disabled:opacity-50">{editing === null ? 'Add item' : 'Save changes'}</button>{editing !== null && <button type="button" onClick={reset} className="rounded-lg border px-4 py-2">Cancel</button>}</div>
    </form>
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-100"><tr>{['Item', 'Distribution / Request', 'Medicine / Batch', 'Inventory', 'Quantity', 'Actions'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{items.map(i => <tr key={i.distribution_item_id} className="border-t"><td className="px-4 py-3">#{i.distribution_item_id}</td><td className="px-4 py-3">#{i.distribution_id} / #{i.request_id}</td><td className="px-4 py-3">{i.medicine_name} {i.strength || ''}<span className="block text-gray-500">Batch {i.batch_number || '—'}</span></td><td className="px-4 py-3">#{i.inventory_id} ({i.available_quantity} left)</td><td className="px-4 py-3">{i.distributed_quantity}</td><td className="space-x-3 px-4 py-3"><button disabled={busy} onClick={() => { setEditing(i.distribution_item_id); setDistributionId(String(i.distribution_id)); setInventoryId(String(i.inventory_id)); setQuantity(String(i.distributed_quantity)); }} className="font-semibold text-emerald-700">Edit</button><button disabled={busy} onClick={() => void remove(i)} className="font-semibold text-rose-700">Delete</button></td></tr>)}</tbody></table>{!items.length && <p className="p-6 text-gray-500">No distribution items yet.</p>}</div>
  </div></main></div>;
}
