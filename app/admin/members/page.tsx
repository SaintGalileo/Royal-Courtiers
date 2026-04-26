"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, Loader2, User, Mail, Phone, Calendar, ChevronUp, ChevronDown, Edit2, X, Save, Trash2 } from "lucide-react";
import { getOptimizedUrl } from "@/lib/cloudinary";
import { toast } from "sonner";

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  nick_name: string;
  email: string;
  phone_number: string;
  family: string;
  photo_url: string;
  code: string;
  created_at: string;
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [familyFilter, setFamilyFilter] = useState("All");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof Member; direction: "asc" | "desc" } | null>({
    key: "created_at",
    direction: "desc",
  });

  // Editing
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchMembers() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      if (data) setMembers(data);
      setIsLoading(false);
    }
    fetchMembers();
  }, [supabase]);

  const families = ["All", "Light", "Dominion", "Virtue", "Power", "Seraphs"];

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const fieldSearch = `${m.first_name} ${m.last_name} ${m.nick_name} ${m.code}`.toLowerCase();
      const matchesSearch = !search || fieldSearch.includes(search.toLowerCase());
      const matchesFamily = familyFilter === "All" || m.family === familyFilter;
      return matchesSearch && matchesFamily;
    });
  }, [members, search, familyFilter]);

  const sortedMembers = useMemo(() => {
    if (!sortConfig) return filteredMembers;

    return [...filteredMembers].sort((a, b) => {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredMembers, sortConfig]);

  const handleSort = (key: keyof Member) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleDeleteMember = async () => {
    if (!editingMember) return;
    
    if (!confirm(`Are you sure you want to delete ${editingMember.first_name} ${editingMember.last_name}? This will also make the access code ${editingMember.code} available again.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // 1. Restore access code
      const { error: codeError } = await supabase
        .from("access_codes")
        .update({ is_used: false, used_at: null })
        .eq("code", editingMember.code);

      if (codeError) throw codeError;

      // 2. Delete member
      const { error: deleteError } = await supabase
        .from("members")
        .delete()
        .eq("id", editingMember.id);

      if (deleteError) throw deleteError;

      toast.success("Member deleted and access code restored!");
      setMembers((prev) => prev.filter((m) => m.id !== editingMember.id));
      setEditingMember(null);
    } catch (err: any) {
      toast.error("Operation failed: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("members")
      .update({
        first_name: editingMember.first_name,
        last_name: editingMember.last_name,
        nick_name: editingMember.nick_name,
        email: editingMember.email,
        phone_number: editingMember.phone_number,
        // family is now non-editable
      })
      .eq("id", editingMember.id);

    if (error) {
      toast.error("Failed to update member: " + error.message);
    } else {
      toast.success("Member updated successfully!");
      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? editingMember : m))
      );
      setEditingMember(null);
    }
    setIsSaving(false);
  };

  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedMembers.slice(start, start + itemsPerPage);
  }, [sortedMembers, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, familyFilter]);

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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Portal Members</h1>
          <p className="mt-1 text-sm text-zinc-500">Managing {members.length} registered members</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Members</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{members.length}</p>
        </div>
        {families.slice(1).map((fam) => (
          <div key={fam} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{fam} Family</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {members.filter((m) => m.family === fam).length}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, nickname, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-950"
          >
            {families.map((f) => (
              <option key={f} value={f}>
                {f} Family
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th 
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => handleSort("first_name")}
                >
                  <div className="flex items-center gap-2">
                    Member
                    {sortConfig?.key === "first_name" && (
                      sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Contact</th>
                <th 
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => handleSort("family")}
                >
                  <div className="flex items-center gap-2">
                    Family
                    {sortConfig?.key === "family" && (
                      sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => handleSort("code")}
                >
                  <div className="flex items-center gap-2">
                    Access Code
                    {sortConfig?.key === "code" && (
                      sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center gap-2">
                    Joined
                    {sortConfig?.key === "created_at" && (
                      sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">
                    No members found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0">
                          {m.photo_url ? (
                            <img
                              src={getOptimizedUrl(m.photo_url)}
                              alt={m.first_name}
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold text-zinc-400 dark:bg-zinc-800">
                              {m.first_name[0]}{m.last_name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                            {m.first_name} {m.last_name}
                          </p>
                          <p className="text-xs text-zinc-500">@{m.nick_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <Phone size={12} className="text-zinc-400" />
                          {m.phone_number || "N/A"}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <Mail size={12} className="text-zinc-400" />
                          {m.email || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-(--primary-gold)/10 px-2.5 py-1 text-xs font-bold text-(--primary-gold)">
                        <span className="h-1.5 w-1.5 rounded-full bg-(--primary-gold)" />
                        {m.family}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
                      {m.code}
                    </td>
                    <td className="px-6 py-4">
                      <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Calendar size={12} />
                        {new Date(m.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setEditingMember(m)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-(--primary-gold) dark:hover:bg-zinc-800 transition-colors"
                        title="View Details / Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination Controls */}
      {filteredMembers.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 outline-none dark:border-zinc-800 dark:bg-zinc-950"
            >
              {[10, 25, 50, 100].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <span>per page</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              Previous
            </button>
            <div className="flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-(--primary-gold) px-3 text-xs font-bold text-white">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {/* Member Edit/Detail Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setEditingMember(null)}
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <header className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-8 py-5 dark:border-zinc-800 dark:bg-zinc-900/50">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Member Profile</h2>
              <button
                onClick={() => setEditingMember(null)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSaveMember} className="p-8">
              <div className="flex flex-col gap-8 md:flex-row">
                {/* Photo & Identity Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="h-32 w-32 relative group">
                    {editingMember.photo_url ? (
                      <img
                        src={getOptimizedUrl(editingMember.photo_url)}
                        alt={editingMember.first_name}
                        className="h-32 w-32 rounded-3xl object-cover ring-4 ring-zinc-50 dark:ring-zinc-900"
                      />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-zinc-100 text-3xl font-black text-zinc-400 dark:bg-zinc-800">
                        {editingMember.first_name[0]}{editingMember.last_name[0]}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 rounded-xl bg-(--primary-gold) p-2 text-white shadow-lg">
                      <User size={18} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-sm font-black tracking-widest text-(--primary-gold) uppercase">
                      {editingMember.code}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 uppercase font-bold tracking-tighter">Access Code</p>
                  </div>
                </div>

                {/* Form Fields Section */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">First Name</label>
                      <input
                        type="text"
                        value={editingMember.first_name}
                        onChange={(e) => setEditingMember({ ...editingMember, first_name: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last Name</label>
                      <input
                        type="text"
                        value={editingMember.last_name}
                        onChange={(e) => setEditingMember({ ...editingMember, last_name: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nickname</label>
                      <input
                        type="text"
                        value={editingMember.nick_name}
                        onChange={(e) => setEditingMember({ ...editingMember, nick_name: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Family (Non-editable)</label>
                      <input
                        type="text"
                        disabled
                        value={editingMember.family}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm outline-none cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-800/50 text-zinc-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Address</label>
                    <input
                      type="email"
                      value={editingMember.email}
                      onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone Number</label>
                    <input
                      type="tel"
                      value={editingMember.phone_number}
                      onChange={(e) => setEditingMember({ ...editingMember, phone_number: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 border-t border-zinc-100 pt-8 dark:border-zinc-800 sm:flex-row">
                <button
                  type="button"
                  disabled={isSaving || isDeleting}
                  onClick={handleDeleteMember}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 disabled:opacity-50 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={18} />}
                  Delete Member
                </button>
                <div className="flex flex-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isDeleting}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-(--primary-gold) py-3 text-sm font-black text-white shadow-lg shadow-(--primary-gold)/20 transition-all hover:bg-(--primary-gold-hover) active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
