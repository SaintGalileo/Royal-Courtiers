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
  getQuestionsForRecord,
  getQuestionCountsByRecord,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type SacredRecord,
  type SacredRecordQuestion,
} from "@/services/sacred-records";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  X,
  GripVertical,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  QUESTIONS_PER_ROUND,
  SACRED_RECORD_CATEGORIES,
  type CorrectOption,
} from "@/lib/sacred-records-game";

type QuestionForm = {
  prompt: string;
  option_a: string;
  option_b: string;
  correct_option: CorrectOption;
};

const emptyQuestionForm = (): QuestionForm => ({
  prompt: "",
  option_a: "",
  option_b: "",
  correct_option: "a",
});

export default function AdminSacredRecordsPage() {
  const [records, setRecords] = useState<SacredRecord[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SacredRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [viewRecord, setViewRecord] = useState<SacredRecord | null>(null);

  const [questions, setQuestions] = useState<SacredRecordQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionForm, setQuestionForm] = useState<QuestionForm>(
    emptyQuestionForm(),
  );
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    content: string;
  }>({
    title: "",
    category: SACRED_RECORD_CATEGORIES[0],
    content: "",
  });

  const orderedRecords = useMemo(() => sortSacredRecords(records), [records]);
  const positionById = useMemo(
    () =>
      new Map(orderedRecords.map((record, index) => [record.id, index + 1])),
    [orderedRecords],
  );
  const canReorder = !search.trim() && !isReordering;

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    setIsLoading(true);
    try {
      const [data, counts] = await Promise.all([
        getSacredRecords(),
        getQuestionCountsByRecord().catch(() => ({})),
      ]);
      setRecords(data);
      setQuestionCounts(counts);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load records.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadQuestions(recordId: string) {
    setQuestionsLoading(true);
    try {
      const data = await getQuestionsForRecord(recordId);
      setQuestions(data);
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed to load questions. Run sacred-records-gamification.sql if needed.",
      );
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  }

  const handleOpenModal = (record?: SacredRecord) => {
    setViewRecord(null);
    setEditingQuestionId(null);
    setQuestionForm(emptyQuestionForm());
    if (record) {
      setEditingRecord(record);
      setFormData({
        title: record.title,
        category: record.category,
        content: record.content,
      });
      void loadQuestions(record.id);
    } else {
      setEditingRecord(null);
      setQuestions([]);
      setFormData({
        title: "",
        category: SACRED_RECORD_CATEGORIES[0],
        content: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setQuestions([]);
    setEditingQuestionId(null);
    setQuestionForm(emptyQuestionForm());
    setFormData({
      title: "",
      category: SACRED_RECORD_CATEGORIES[0],
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
        handleCloseModal();
      } else {
        const created = await createSacredRecord({
          ...formData,
          day_number: getNextDayNumber(records),
        });
        toast.success("Record created — add recall questions below.");
        setEditingRecord(created);
        setQuestions([]);
        await fetchRecords();
      }
      if (editingRecord) await fetchRecords();
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to save record.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsSavingQuestion(true);
    try {
      if (editingQuestionId) {
        await updateQuestion(editingQuestionId, questionForm);
        toast.success("Question updated");
      } else {
        await createQuestion({
          record_id: editingRecord.id,
          ...questionForm,
        });
        toast.success("Question added");
      }
      setQuestionForm(emptyQuestionForm());
      setEditingQuestionId(null);
      await loadQuestions(editingRecord.id);
      const counts = await getQuestionCountsByRecord();
      setQuestionCounts(counts);
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save question",
      );
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!editingRecord) return;
    if (!confirm("Delete this question?")) return;
    try {
      await deleteQuestion(id);
      await loadQuestions(editingRecord.id);
      const counts = await getQuestionCountsByRecord();
      setQuestionCounts(counts);
      toast.success("Question deleted");
    } catch {
      toast.error("Failed to delete question");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this record? This action cannot be undone.",
      )
    )
      return;

    try {
      await deleteSacredRecord(id);
      const remaining = orderedRecords.filter((record) => record.id !== id);
      if (remaining.length > 0) {
        await reorderSacredRecords(remaining.map((record) => record.id));
      }
      toast.success("Record deleted");
      fetchRecords();
    } catch {
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
        error instanceof Error
          ? error.message
          : "Failed to update record order";
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Sacred Records Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Managing {records.length} daily lessons. Each record needs{" "}
            {QUESTIONS_PER_ROUND}+ recall questions.
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
      </div>

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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Title
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Qs
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {tableRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-zinc-500"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                tableRecords.map((r, index) => {
                  const displayNumber = positionById.get(r.id) ?? index + 1;
                  const orderedIndex = orderedRecords.findIndex(
                    (record) => record.id === r.id,
                  );
                  const qCount = questionCounts[r.id] ?? 0;

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
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                            qCount >= QUESTIONS_PER_ROUND
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {qCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setViewRecord(r)}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenModal(r)}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10 transition-colors"
                            title="Delete"
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

      {/* View-only modal */}
      {viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setViewRecord(null)}
          />
          <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <button
              onClick={() => setViewRecord(null)}
              className="absolute right-6 top-6 z-10 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X size={20} />
            </button>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-(--primary-gold)">
                Day {positionById.get(viewRecord.id) ?? viewRecord.day_number}
              </p>
              <span className="mb-4 inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {viewRecord.category}
              </span>
              <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {viewRecord.title}
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {viewRecord.content}
              </p>
              <p className="mt-6 text-xs font-bold text-zinc-400">
                Recall questions: {questionCounts[viewRecord.id] ?? 0}
                {(questionCounts[viewRecord.id] ?? 0) < QUESTIONS_PER_ROUND && (
                  <span className="ml-2 text-amber-600">
                    (need {QUESTIONS_PER_ROUND}+)
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={() => {
                  const record = viewRecord;
                  setViewRecord(null);
                  handleOpenModal(record);
                }}
                className="mt-6 w-full rounded-xl bg-(--primary-gold) py-3 text-sm font-black text-white"
              >
                Edit this record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / create modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <button
              onClick={handleCloseModal}
              className="absolute right-6 top-6 z-10 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X size={20} />
            </button>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {editingRecord ? "Edit Sacred Record" : "Add New Sacred Record"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {editingRecord && (
                  <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    Day{" "}
                    <span className="font-bold text-(--primary-gold)">
                      {positionById.get(editingRecord.id) ??
                        editingRecord.day_number}
                    </span>
                    . Drag rows in the table to change this number.
                  </p>
                )}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {SACRED_RECORD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Content
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-bold text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-(--primary-gold) py-3.5 text-sm font-black text-white disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingRecord ? (
                      "Save Record"
                    ) : (
                      "Create Record"
                    )}
                  </button>
                </div>
              </form>

              {editingRecord && (
                <div className="mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-800">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">
                      Recall question pool
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                        questions.length >= QUESTIONS_PER_ROUND
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {questions.length} / {QUESTIONS_PER_ROUND}+ required
                    </span>
                  </div>

                  {questionsLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-(--primary-gold)" />
                    </div>
                  ) : (
                    <ul className="mb-6 space-y-3">
                      {questions.map((q, i) => (
                        <li
                          key={q.id}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {i + 1}. {q.prompt}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            A: {q.option_a} · B: {q.option_b} · Correct:{" "}
                            {q.correct_option.toUpperCase()}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuestionId(q.id);
                                setQuestionForm({
                                  prompt: q.prompt,
                                  option_a: q.option_a,
                                  option_b: q.option_b,
                                  correct_option: q.correct_option,
                                });
                              }}
                              className="text-[10px] font-black uppercase tracking-wider text-(--primary-gold)"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-[10px] font-black uppercase tracking-wider text-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                      {questions.length === 0 && (
                        <p className="text-sm text-zinc-500">
                          No questions yet. Add at least {QUESTIONS_PER_ROUND}.
                        </p>
                      )}
                    </ul>
                  )}

                  <form
                    onSubmit={handleSaveQuestion}
                    className="space-y-3 rounded-2xl border border-dashed border-(--primary-gold)/30 p-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      {editingQuestionId ? "Edit question" : "Add question"}
                    </p>
                    <input
                      required
                      value={questionForm.prompt}
                      onChange={(e) =>
                        setQuestionForm((p) => ({
                          ...p,
                          prompt: e.target.value,
                        }))
                      }
                      placeholder="Question prompt"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    />
                    <input
                      required
                      value={questionForm.option_a}
                      onChange={(e) =>
                        setQuestionForm((p) => ({
                          ...p,
                          option_a: e.target.value,
                        }))
                      }
                      placeholder="Option A"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    />
                    <input
                      required
                      value={questionForm.option_b}
                      onChange={(e) =>
                        setQuestionForm((p) => ({
                          ...p,
                          option_b: e.target.value,
                        }))
                      }
                      placeholder="Option B"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    />
                    <div className="flex gap-4 text-sm">
                      <label className="flex items-center gap-2 font-bold">
                        <input
                          type="radio"
                          checked={questionForm.correct_option === "a"}
                          onChange={() =>
                            setQuestionForm((p) => ({
                              ...p,
                              correct_option: "a",
                            }))
                          }
                        />
                        A correct
                      </label>
                      <label className="flex items-center gap-2 font-bold">
                        <input
                          type="radio"
                          checked={questionForm.correct_option === "b"}
                          onChange={() =>
                            setQuestionForm((p) => ({
                              ...p,
                              correct_option: "b",
                            }))
                          }
                        />
                        B correct
                      </label>
                    </div>
                    <div className="flex gap-2">
                      {editingQuestionId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuestionId(null);
                            setQuestionForm(emptyQuestionForm());
                          }}
                          className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold dark:border-zinc-800"
                        >
                          Cancel edit
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isSavingQuestion}
                        className="rounded-xl bg-(--primary-gold) px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                      >
                        {isSavingQuestion
                          ? "Saving…"
                          : editingQuestionId
                            ? "Update question"
                            : "Add question"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
