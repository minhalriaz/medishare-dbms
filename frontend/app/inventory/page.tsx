'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Boxes,
  Eye,
  Menu,
  PackageCheck,
  PackageOpen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TriangleAlert,
} from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import InventoryFormModal from '@/components/InventoryFormModal';
import InventoryDetailsPanel from '@/components/InventoryDetailsPanel';
import DeleteInventoryDialog from '@/components/DeleteInventoryDialog';

import {
  inventoryApi,
  InventoryDetailResult,
  InventorySetResult,
} from '@/services/inventoryApi';
import { Inventory, InventoryPayload } from '@/types/inventory';

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

const statusOptions = [
  'All',
  'Available',
  'Low Stock',
  'Out of Stock',
];

function statusBadgeClasses(status: string) {
  switch (status.toLowerCase()) {
    case 'available':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-100';

    case 'low stock':
      return 'bg-amber-50 text-amber-700 ring-amber-100';

    case 'out of stock':
      return 'bg-rose-50 text-rose-700 ring-rose-100';

    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200';
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

export default function InventoryPage() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [inventoryDetails, setInventoryDetails] = useState<InventoryDetailResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formOpen, setFormOpen] = useState(false);
  const [editingInventory, setEditingInventory] =
    useState<Inventory | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [selectedInventory, setSelectedInventory] =
    useState<Inventory | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Inventory | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<ToastState>(null);
  const [inventoryUnion, setInventoryUnion] =
  useState<InventorySetResult[]>([]);

const [inventoryIntersection, setInventoryIntersection] =
  useState<InventorySetResult[]>([]);

  const showToast = useCallback((nextToast: ToastState) => {
    setToast(nextToast);

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // =========================
  // GET ALL INVENTORY
  // =========================

  const fetchInventory = useCallback(async () => {
  setLoading(true);
  setError('');

  try {

    const data = await inventoryApi.getAll();

    setInventories(
      Array.isArray(data)
        ? data
        : []
    );


    const details =
      await inventoryApi.getDetails();


    setInventoryDetails(
      Array.isArray(details)
        ? details
        : []
    );
    const unionData =
  await inventoryApi.getUnion();

setInventoryUnion(
  Array.isArray(unionData)
    ? unionData
    : [],
);


const intersectionData =
  await inventoryApi.getIntersection();

setInventoryIntersection(
  Array.isArray(intersectionData)
    ? intersectionData
    : [],
);


  } catch (requestError) {

    setError(
      requestError instanceof Error
        ? requestError.message
        : 'Unable to load inventory records.',
    );

  } finally {

    setLoading(false);

  }

}, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchInventory();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchInventory]);

  // =========================
  // SUMMARY / AGGREGATION
  // =========================

  const summary = useMemo(() => {
    return inventories.reduce(
      (totals, item) => {
        totals.records += 1;

        totals.received +=
          Number(item.received_quantity) || 0;

        totals.available +=
          Number(item.available_quantity) || 0;

        const status =
          item.inventory_status.toLowerCase();

        if (
          status === 'low stock' ||
          status === 'out of stock'
        ) {
          totals.attention += 1;
        }

        return totals;
      },
      {
        records: 0,
        received: 0,
        available: 0,
        attention: 0,
      },
    );
  }, [inventories]);

  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredInventory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return inventories.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.inventory_id).includes(query) ||
        String(item.organization_id).includes(query) ||
        String(item.donation_item_id).includes(query) ||
        item.storage_location
          .toLowerCase()
          .includes(query) ||
        item.inventory_status
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        item.inventory_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    inventories,
    searchQuery,
    statusFilter,
  ]);

  // =========================
  // CREATE
  // =========================

  const handleCreate = () => {
    setFormMode('create');
    setEditingInventory(null);
    setFormOpen(true);
  };

  // =========================
  // VIEW ONE
  // =========================

  const handleView = async (
    inventory: Inventory,
  ) => {
    setSelectedInventory(inventory);
    setDetailsOpen(true);
    setDetailsLoading(true);

    try {
      const freshInventory =
        await inventoryApi.getById(
          inventory.inventory_id,
        );

      setSelectedInventory(freshInventory);
    } catch (requestError) {
      showToast({
        type: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load inventory details.',
      });

      setDetailsOpen(false);
      setSelectedInventory(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = async (
    inventory: Inventory,
  ) => {
    try {
      const freshInventory =
        await inventoryApi.getById(
          inventory.inventory_id,
        );

      setEditingInventory(freshInventory);
      setFormMode('edit');
      setFormOpen(true);
    } catch (requestError) {
      showToast({
        type: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load inventory record for editing.',
      });
    }
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (
    payload: InventoryPayload,
  ) => {
    setSubmitting(true);

    try {
      if (formMode === 'create') {
        await inventoryApi.create(payload);

        showToast({
          type: 'success',
          message:
            'Inventory record added successfully.',
        });
      } else if (editingInventory) {
        await inventoryApi.update(
          editingInventory.inventory_id,
          payload,
        );

        showToast({
          type: 'success',
          message:
            'Inventory record updated successfully.',
        });
      }

      setFormOpen(false);
      setEditingInventory(null);

      await fetchInventory();
    } catch (requestError) {
      showToast({
        type: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to save inventory record.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    try {
      await inventoryApi.remove(
        deleteTarget.inventory_id,
      );

      showToast({
        type: 'success',
        message:
          'Inventory record deleted successfully.',
      });

      setDeleteTarget(null);

      await fetchInventory();
    } catch (requestError) {
      showToast({
        type: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to delete inventory record.',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-800">
      <Sidebar />

      <main className="min-h-screen px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1500px]">

          {/* MOBILE HEADER */}

          <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Menu className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  MediShare
                </p>

                <p className="text-sm font-bold text-gray-900">
                  Medicine Inventory
                </p>
              </div>
            </div>
          </div>

          {/* HEADER */}

          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Dashboard / Medicine Inventory
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Medicine Inventory
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Track medicine stock received from donations,
                current availability, storage locations, and
                inventory status.
              </p>
            </div>

            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Add Inventory
            </button>
          </header>

          {/* SUMMARY */}

          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              label="Total Inventory Records"
              value={summary.records}
              icon={
                <Boxes className="h-5 w-5" />
              }
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              label="Total Received Quantity"
              value={summary.received}
              icon={
                <PackageCheck className="h-5 w-5" />
              }
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <SummaryCard
              label="Total Available Quantity"
              value={summary.available}
              icon={
                <PackageOpen className="h-5 w-5" />
              }
              iconClass="bg-teal-50 text-teal-600"
            />

            <SummaryCard
              label="Low / Out of Stock"
              value={summary.attention}
              icon={
                <TriangleAlert className="h-5 w-5" />
              }
              iconClass="bg-amber-50 text-amber-600"
            />

          </section>

          {/* SEARCH / FILTER */}

          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div className="relative w-full md:max-w-xl">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value,
                    )
                  }
                  placeholder="Search inventory ID, organization, donation item, location..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  {statusOptions.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status === 'All'
                          ? 'All Statuses'
                          : status}
                      </option>
                    ),
                  )}
                </select>

                <button
                  type="button"
                  onClick={fetchInventory}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      loading
                        ? 'animate-spin'
                        : ''
                    }`}
                  />
                  Refresh
                </button>

              </div>
            </div>
          </section>

          {/* TABLE */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState
                message={error}
                onRetry={fetchInventory}
              />
            ) : inventories.length === 0 ? (
              <EmptyState
                title="No inventory records yet"
                description="Add the first inventory record to start tracking medicine stock from the NestJS backend."
                onAdd={handleCreate}
              />
            ) : filteredInventory.length === 0 ? (
              <EmptyState
                title="No matching inventory records"
                description="Try changing your search text or status filter."
              />
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1120px] border-collapse text-left">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-600">

                      <th className="px-5 py-4">
                        Inventory ID
                      </th>

                      <th className="px-5 py-4">
                        Organization ID
                      </th>

                      <th className="px-5 py-4">
                        Donation Item ID
                      </th>

                      <th className="px-5 py-4">
                        Received Qty
                      </th>

                      <th className="px-5 py-4">
                        Available Qty
                      </th>

                      <th className="px-5 py-4">
                        Storage Location
                      </th>

                      <th className="px-5 py-4">
                        Inventory Status
                      </th>

                      <th className="px-5 py-4">
                        Added Date
                      </th>

                      <th className="px-5 py-4 text-right">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredInventory.map(
                      (item) => (
                        <tr
                          key={
                            item.inventory_id
                          }
                          className="text-sm text-slate-700 transition hover:bg-emerald-50/60"
                        >

                          <td className="whitespace-nowrap px-5 py-4 font-bold text-emerald-700">
                            #{item.inventory_id}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">
                            {item.organization_id}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">
                            {item.donation_item_id}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                            {item.received_quantity}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                            {item.available_quantity}
                          </td>

                          <td
                            className="max-w-[220px] truncate px-5 py-4 text-slate-600"
                            title={
                              item.storage_location
                            }
                          >
                            {item.storage_location}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusBadgeClasses(
                                item.inventory_status,
                              )}`}
                            >
                              {
                                item.inventory_status
                              }
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                            {formatDate(
                              item.added_date,
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right">

                            <div className="inline-flex items-center gap-1">

                              <ActionButton
                                label="View"
                                onClick={() =>
                                  handleView(
                                    item,
                                  )
                                }
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4" />
                              </ActionButton>

                              <ActionButton
                                label="Edit"
                                onClick={() =>
                                  handleEdit(
                                    item,
                                  )
                                }
                                className="text-emerald-600 hover:bg-emerald-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </ActionButton>

                              <ActionButton
                                label="Delete"
                                onClick={() =>
                                  setDeleteTarget(
                                    item,
                                  )
                                }
                                className="text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </ActionButton>

                            </div>

                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>
                </table>

              </div>
            )}

          </section>
          {/* =========================
    INVENTORY JOIN DETAILS
========================= */}

<section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


<div className="border-b border-slate-200 px-5 py-4">

<h2 className="text-lg font-bold text-gray-900">
Inventory Relationship Details
</h2>

<p className="mt-1 text-sm text-slate-600">
Medicine inventory information with related details.
</p>

</div>



<div className="overflow-x-auto">


<table className="w-full min-w-[900px] text-left">


<thead>

<tr className="border-b border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-600">


<th className="px-5 py-4">
Organization
</th>


<th className="px-5 py-4">
Medicine
</th>


<th className="px-5 py-4">
Batch
</th>


<th className="px-5 py-4">
Received
</th>


<th className="px-5 py-4">
Available
</th>


<th className="px-5 py-4">
Location
</th>


</tr>

</thead>



<tbody className="divide-y divide-slate-100 text-slate-700">


{
inventoryDetails.length === 0 ? (

<tr>

<td
colSpan={6}
className="px-5 py-10 text-center text-sm text-slate-500"
>

No joined inventory data available

</td>

</tr>


) : (


inventoryDetails.map((item,index)=>(


<tr
key={index}
className="text-sm text-slate-700 hover:bg-emerald-50/60"
>


<td className="px-5 py-4 font-medium">

{item.organization_name}

</td>



<td className="px-5 py-4">

{item.medicine_name}

</td>



<td className="px-5 py-4">

{item.batch_number}

</td>



<td className="px-5 py-4">

{item.received_quantity}

</td>



<td className="px-5 py-4 font-semibold">

{item.available_quantity}

</td>



<td className="px-5 py-4">

{item.storage_location}

</td>



</tr>


))

)

}


</tbody>


</table>


</div>

{/* ==========================================
    UNION RESULTS
========================================== */}

<div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm">

  <div className="mb-4">

    <h2 className="text-lg font-bold text-gray-900">
      Combined Inventory
    </h2>

    <p className="mt-1 text-sm text-slate-600">
      Inventory records that are Available or Low Stock.
    </p>

  </div>


  {inventoryUnion.length === 0 ? (

    <p className="py-6 text-center text-sm text-gray-500">
      No inventory records found.
    </p>

  ) : (

    <div className="overflow-x-auto">

      <table className="min-w-full text-sm">

        <thead>

          <tr className="border-b border-slate-200 bg-white text-left text-slate-600">

            <th className="px-4 py-3">
              Inventory ID
            </th>

            <th className="px-4 py-3">
              Organization ID
            </th>

            <th className="px-4 py-3">
              Donation Item ID
            </th>

            <th className="px-4 py-3">
              Received
            </th>

            <th className="px-4 py-3">
              Available
            </th>

            <th className="px-4 py-3">
              Location
            </th>

            <th className="px-4 py-3">
              Status
            </th>

          </tr>

        </thead>


        <tbody>

          {inventoryUnion.map((item) => (

            <tr
              key={item.inventory_id}
              className="border-b border-slate-100 text-slate-700 hover:bg-emerald-50/60"
            >

              <td className="px-4 py-3">
                {item.inventory_id}
              </td>

              <td className="px-4 py-3">
                {item.organization_id}
              </td>

              <td className="px-4 py-3">
                {item.donation_item_id}
              </td>

              <td className="px-4 py-3">
                {item.received_quantity}
              </td>

              <td className="px-4 py-3">
                {item.available_quantity}
              </td>

              <td className="px-4 py-3">
                {item.storage_location}
              </td>

              <td className="px-4 py-3">
                {item.inventory_status}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )}

</div>
{/* ==========================================
    INTERSECT RESULTS
========================================== */}

<div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm">

  <div className="mb-4">

    <h2 className="text-lg font-bold text-gray-900">
      Common Inventory Records
    </h2>

    <p className="mt-1 text-sm text-slate-600">
      Inventory records that satisfy both stock conditions.
    </p>

  </div>


  {inventoryIntersection.length === 0 ? (

    <p className="py-6 text-center text-sm text-gray-500">
      No common inventory records found.
    </p>

  ) : (

    <div className="overflow-x-auto">

      <table className="min-w-full text-sm">

        <thead>

          <tr className="border-b border-slate-200 bg-white text-left text-slate-600">

            <th className="px-4 py-3">
              Inventory ID
            </th>

            <th className="px-4 py-3">
              Organization ID
            </th>

            <th className="px-4 py-3">
              Donation Item ID
            </th>

            <th className="px-4 py-3">
              Received
            </th>

            <th className="px-4 py-3">
              Available
            </th>

            <th className="px-4 py-3">
              Location
            </th>

            <th className="px-4 py-3">
              Status
            </th>

          </tr>

        </thead>


        <tbody>

          {inventoryIntersection.map((item) => (

            <tr
              key={item.inventory_id}
              className="border-b border-slate-100 text-slate-700 hover:bg-emerald-50/60"
            >

              <td className="px-4 py-3">
                {item.inventory_id}
              </td>

              <td className="px-4 py-3">
                {item.organization_id}
              </td>

              <td className="px-4 py-3">
                {item.donation_item_id}
              </td>

              <td className="px-4 py-3">
                {item.received_quantity}
              </td>

              <td className="px-4 py-3">
                {item.available_quantity}
              </td>

              <td className="px-4 py-3">
                {item.storage_location}
              </td>

              <td className="px-4 py-3">
                {item.inventory_status}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )}

</div>
</section>

          {/* FOOTER */}

          {!loading &&
            !error &&
            inventories.length > 0 && (
              <div className="mt-3 flex flex-col gap-1 px-1 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">

                <span>
                  Showing{' '}
                  {filteredInventory.length}{' '}
                  of {inventories.length}{' '}
                  inventory records
                </span>

                <span>
                  Data source: NestJS Inventory API
                </span>

              </div>
            )}

        </div>
      </main>

      {/* CREATE / EDIT MODAL */}

      <InventoryFormModal
        open={formOpen}
        mode={formMode}
        inventory={editingInventory}
        submitting={submitting}
        onClose={() => {
          if (submitting) return;

          setFormOpen(false);
          setEditingInventory(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* VIEW DETAILS */}

      <InventoryDetailsPanel
        inventory={
          detailsOpen
            ? selectedInventory
            : null
        }
        loading={
          detailsOpen &&
          detailsLoading
        }
        onClose={() => {
          setDetailsOpen(false);
          setSelectedInventory(null);
        }}
      />

      {/* DELETE */}

      <DeleteInventoryDialog
        inventory={deleteTarget}
        deleting={deleting}
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDelete}
      />

      {/* TOAST */}

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[70] flex max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-xl ${
            toast.type === 'success'
              ? 'border-emerald-100'
              : 'border-rose-100'
          }`}
        >

          {toast.type === 'success' ? (
            <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          )}

          <p className="text-sm font-medium text-gray-800">
            {toast.message}
          </p>

        </div>
      )}

    </div>
  );
}

// =====================================
// SUMMARY CARD
// =====================================

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

      <div>
        <p className="text-xs font-medium text-gray-400">
          {label}
        </p>

        <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          {value.toLocaleString()}
        </p>
      </div>

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

    </div>
  );
}

// =====================================
// ACTION BUTTON
// =====================================

function ActionButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 transition ${className}`}
    >
      {children}
    </button>
  );
}

// =====================================
// LOADING STATE
// =====================================

function LoadingState() {
  return (
    <div className="p-5">

      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500">
        <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
        Loading inventory from the backend...
      </div>

      <div className="space-y-3">

        {[1, 2, 3, 4, 5].map(
          (row) => (
            <div
              key={row}
              className="h-14 animate-pulse rounded-xl bg-gray-100"
            />
          ),
        )}

      </div>

    </div>
  );
}

// =====================================
// ERROR STATE
// =====================================

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertCircle className="h-7 w-7" />
      </div>

      <h3 className="mt-4 text-base font-bold text-gray-900">
        Could not load inventory
      </h3>

      <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>

    </div>
  );
}

// =====================================
// EMPTY STATE
// =====================================

function EmptyState({
  title,
  description,
  onAdd,
}: {
  title: string;
  description: string;
  onAdd?: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
        <Boxes className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-base font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>

      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add Inventory
        </button>
      )}

    </div>
  );
}