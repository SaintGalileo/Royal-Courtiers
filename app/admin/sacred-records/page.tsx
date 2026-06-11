"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getSacredRecords,
  createSacredRecord,
  updateSacredRecord,
  deleteSacredRecord,
  getNextDayNumber,
  reorderSacredRecords,
  sortSacredRecords,
  type SacredRecord,
} from "@/services/sacred-records";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  X,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSacredRecordsPage() {
  const [records, setRecords] = useState<SacredRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SacredRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "THE FOUNDATION (1954-2001)",
    content: "",
  });

  const orderedRecords = useMemo(() => sortSacredRecords(records), [records]);
  const positionById = useMemo(
    () => new Map(orderedRecords.map((record, index) => [record.id, index + 1])),
    [orderedRecords],
  );
  const canReorder = !search.trim() && !isReordering;

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    setIsLoading(true);
    try {
      const data = await getSacredRecords();
      setRecords(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load records.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenModal = (record?: SacredRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        title: record.title,
        category: record.category,
        content: record.content,
      });
    } else {
      setEditingRecord(null);
      setFormData({
        title: "",
        category: "THE FOUNDATION (1954-2001)",
        content: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setFormData({
      title: "",
      category: "THE FOUNDATION (1954-2001)",
      content: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingRecord) {
        await updateSacredRecord(editingRecord.id, formData);
        toast.success("Record updated successfully");
      } else {
        await createSacredRecord({
          ...formData,
          day_number: getNextDayNumber(records),
        });
        toast.success("Record created successfully");
      }
      fetchRecords();
      handleCloseModal();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;

    try {
      await deleteSacredRecord(id);
      const remaining = orderedRecords.filter((record) => record.id !== id);
      if (remaining.length > 0) {
        await reorderSacredRecords(remaining.map((record) => record.id));
      }
      toast.success("Record deleted");
      fetchRecords();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const applyReorder = async (newOrder: SacredRecord[]) => {
    const previousRecords = records;
    const optimistic = newOrder.map((record, index) => ({
      ...record,
      day_number: index + 1,
    }));

    setRecords(optimistic);
    setIsReordering(true);

    try {
      await reorderSacredRecords(newOrder.map((record) => record.id));
      toast.success("Record order updated");
    } catch (error) {
      console.error(error);
      setRecords(previousRecords);
      const message =
        error instanceof Error ? error.message : "Failed to update record order";
      toast.error(message);
    } finally {
      setIsReordering(false);
      setDragIndex(null);
    }
  };

  const handleDrop = async (targetIndex: number) => {
    if (!canReorder || dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }

    const nextOrder = [...orderedRecords];
    const [moved] = nextOrder.splice(dragIndex, 1);
    nextOrder.splice(targetIndex, 0, moved);
    await applyReorder(nextOrder);
  };

  const filteredRecords = orderedRecords.filter((record) => {
    const position = positionById.get(record.id)?.toString() ?? "";
    const query = search.toLowerCase();
    return (
      record.title.toLowerCase().includes(query) ||
      record.category.toLowerCase().includes(query) ||
      record.content.toLowerCase().includes(query) ||
      position.includes(query)
    );
  });

  const tableRecords = search.trim() ? filteredRecords : orderedRecords;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--primary-gold)" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Sacred Records Management</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Managing {records.length} daily spiritual lessons. Day numbers follow
            the list order below.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 rounded-xl bg-(--primary-gold) px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-(--primary-gold)/20 transition-all hover:bg-(--primary-gold-hover) active:scale-95"
        >
          <Plus size={18} />
          Add New Record
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search titles, categories, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-950"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {search.trim() && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Clear search to drag or reorder records.
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th className="w-14 px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Order
                </th>
                <th className="w-16 px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Day #
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Title</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Content Snippet</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {tableRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                tableRecords.map((r, index) => {
                  const displayNumber = positionById.get(r.id) ?? index + 1;
                  const orderedIndex = orderedRecords.findIndex(
                    (record) => record.id === r.id,
                  );

                  return (
                  <tr
                    key={r.id}
                    draggable={canReorder}
                    onDragStart={() => setDragIndex(orderedIndex)}
                    onDragOver={(event) => {
                      if (!canReorder) return;
                      event.preventDefault();
                    }}
                    onDrop={() => handleDrop(orderedIndex)}
                    onDragEnd={() => setDragIndex(null)}
                    className={`transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                      dragIndex === orderedIndex ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-lg p-1.5 text-zinc-400 ${
                          canReorder
                            ? "cursor-grab active:cursor-grabbing"
                            : "cursor-not-allowed opacity-40"
                        }`}
                        title={canReorder ? "Drag to reorder" : "Clear search to reorder"}
                        aria-label="Drag to reorder"
                      >
                        <GripVertical size={16} />
                      </span>
                    </td>
                    <td className="px-4 py-4 font-black text-(--primary-gold)">
                      {displayNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-xs truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {r.title}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <p className="max-w-md line-clamp-1">{r.content}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(r)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom shortcut button for convenience */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => handleOpenModal()}
          className="group flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 px-8 py-4 text-sm font-bold text-zinc-400 transition-all hover:border-(--primary-gold)/50 hover:bg-(--primary-gold)/5 hover:text-(--primary-gold) dark:border-zinc-800 dark:hover:border-(--primary-gold)/30"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 transition-colors group-hover:bg-(--primary-gold) group-hover:text-white dark:bg-zinc-800">
            <Plus size={16} />
          </div>
          Add another sacred record
        </button>
      </div>

      {/* Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <button
              onClick={handleCloseModal}
              className="absolute right-6 top-6 z-10 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X size={20} />
            </button>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                {editingRecord ? "Edit Sacred Record" : "Add New Sacred Record"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {editingRecord && (
                  <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    Day{" "}
                    <span className="font-bold text-(--primary-gold)">
                      {positionById.get(editingRecord.id) ?? editingRecord.day_number}
                    </span>
                    . Drag rows in the table to change this number.
                  </p>
                )}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <option value="THE FOUNDATION (1954-2001)">THE FOUNDATION (1954-2001)</option>
                    <option value="THE FAMILY LOVE BUILT (1991-PRESENT)">THE FAMILY LOVE BUILT (1991-PRESENT)</option>
                    <option value="ADMINISTRATION & ACCOMPLISMENTS">ADMINISTRATION & ACCOMPLISMENTS</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a title for this record..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Content</label>
                  <textarea
                    required
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter the main spiritual content..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-(--primary-gold) py-3.5 text-sm font-black text-white shadow-lg shadow-(--primary-gold)/30 transition-all hover:bg-(--primary-gold-hover) hover:shadow-(--primary-gold)/40 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingRecord ? (
                      "Save"
                    ) : (
                      "Create Record"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
