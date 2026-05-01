"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, Loader2, Key, CheckCircle, Clock, User, UserPlus, Copy, ClipboardCheck, ChevronUp, ChevronDown, X } from "lucide-react";
import { getOptimizedUrl } from "@/lib/cloudinary";
import { toast } from "sonner";

type AccessCode = {
  id: string;
  code: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
};

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  nick_name: string;
  code: string;
  photo_url?: string;
};

export default function AdminAccessCodesPage() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof AccessCode; direction: "asc" | "desc" } | null>({
    key: "created_at",
    direction: "desc",
  });
  
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [codesRes, membersRes] = await Promise.all([
        supabase.from("access_codes").select("*").order("created_at", { ascending: false }),
        supabase.from("members").select("id, first_name, last_name, nick_name, code, photo_url"),
      ]);

      if (codesRes.error) console.error(codesRes.error);
      if (membersRes.error) console.error(membersRes.error);

      if (codesRes.data) setCodes(codesRes.data);
      if (membersRes.data) setMembers(membersRes.data);
      setIsLoading(false);
    }
    fetchData();
  }, [supabase]);

  const filteredCodes = useMemo(() => {
    return codes.filter((c) => {
      const matchesSearch = !search || c.code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Used" && c.is_used) ||
        (statusFilter === "Unused" && !c.is_used);
      return matchesSearch && matchesStatus;
    });
  }, [codes, search, statusFilter]);

  const sortedCodes = useMemo(() => {
    if (!sortConfig) return filteredCodes;

    return [...filteredCodes].sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      if (sortConfig.key === "is_used") {
        aValue = a.is_used ? 1 : 0;
        bValue = b.is_used ? 1 : 0;
      }
      
      if (sortConfig.key as string === "used_by") {
        const memberA = members.find((m) => m.code.toUpperCase() === a.code.toUpperCase());
        const memberB = members.find((m) => m.code.toUpperCase() === b.code.toUpperCase());
        aValue = memberA ? `${memberA.first_name} ${memberA.last_name}` : (a.is_used ? "zzz" : "");
        bValue = memberB ? `${memberB.first_name} ${memberB.last_name}` : (b.is_used ? "zzz" : "");
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredCodes, sortConfig]);

  const handleSort = (key: keyof AccessCode) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const totalPages = Math.ceil(sortedCodes.length / itemsPerPage);
  const paginatedCodes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedCodes.slice(start, start + itemsPerPage);
  }, [sortedCodes, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyAllUnused = () => {
    const unused = codes.filter(c => !c.is_used).map(c => c.code).join("\n");
    if (!unused) {
      toast.error("No unused codes to copy.");
      return;
    }
    navigator.clipboard.writeText(unused);
    toast.success("All unused codes copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--primary-gold)" />
      </div>
    );
  }

  const usedCount = codes.filter((c) => c.is_used).length;
  const unusedCount = codes.length - usedCount;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Access Codes</h1>
          <p className="mt-1 text-sm text-zinc-500">Track registration codes and their usage.</p>
        </div>
        <button 
          onClick={copyAllUnused}
          className="btn-primary flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg shadow-(--primary-gold)/20 transition-all hover:-translate-y-0.5"
        >
          <Copy size={16} />
          Copy All Unused
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Codes</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{codes.length}</p>
            <Key className="h-6 w-6 text-zinc-300" />
          </div>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50/30 p-6 shadow-xs dark:border-green-900/30 dark:bg-green-950/20">
          <p className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-500">Used Codes</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">{usedCount}</p>
            <CheckCircle className="h-6 w-6 text-green-300 dark:text-green-800" />
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Unused Codes</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{unusedCount}</p>
            <Clock className="h-6 w-6 text-zinc-300" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by code..."
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
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-950"
          >
            {["All", "Used", "Unused"].map((f) => (
              <option key={f} value={f}>
                {f} Status
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
                  onClick={() => handleSort("is_used")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortConfig?.key === "is_used" && (
                      sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => handleSort("used_by" as any)}
                >
                  <div className="flex items-center gap-2">
                    Used By
                    {sortConfig && (sortConfig.key as string) === "used_by" && (
                      sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center gap-2">
                    Created
                    {sortConfig?.key === "created_at" && (
                      sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedCodes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-500">
                    No access codes found.
                  </td>
                </tr>
              ) : (
                paginatedCodes.map((c) => {
                  const usedByMember = members.find((m) => m.code.toUpperCase() === c.code.toUpperCase());
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
                            {c.code}
                          </span>
                          {!c.is_used && (
                            <button
                              onClick={() => handleCopy(c.code)}
                              className="rounded-md border border-zinc-200 bg-white p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                              title="Copy Code"
                            >
                              {copiedCode === c.code ? <ClipboardCheck size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${c.is_used 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-500"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${c.is_used ? "bg-green-600" : "bg-zinc-400"}`} />
                          {c.is_used ? "Used" : "Unused"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.is_used ? (
                          usedByMember ? (
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 flex-shrink-0">
                                {usedByMember.photo_url ? (
                                  <img
                                    src={getOptimizedUrl(usedByMember.photo_url)}
                                    alt={usedByMember.first_name}
                                    className="h-8 w-8 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-400 dark:bg-zinc-800">
                                    {usedByMember.first_name[0]}{usedByMember.last_name[0]}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate capitalize">
                                  {usedByMember.first_name} {usedByMember.last_name}
                                </p>
                                <p className="text-[10px] text-zinc-500 truncate">@{usedByMember.nick_name}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs italic text-zinc-400 italic">User data missing</p>
                          )
                        ) : (
                          <p className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                            <UserPlus size={12} />
                            Available
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Clock size={12} />
                          {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredCodes.length > 0 && (
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
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              Previous
            </button>
            <div className="flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-(--primary-gold) px-3 text-xs font-bold text-white">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
