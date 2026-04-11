"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, Loader2, User, Mail, Phone, Calendar } from "lucide-react";
import { getOptimizedUrl } from "@/lib/cloudinary";

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

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage, itemsPerPage]);

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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Member</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Contact</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Family</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Access Code</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Joined</th>
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
    </div>
  );
}
