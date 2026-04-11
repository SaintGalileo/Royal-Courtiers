"use client";

import Link from "next/link";
import { Copy, Check, Star, Moon, Sun } from "lucide-react";
import { GiPolarStar, GiWingedScepter, GiFruitTree, GiDove } from "react-icons/gi";
import { FaBolt } from "react-icons/fa";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import TshirtModel from "@/components/TshirtModel";
import FamilyCard from "@/components/FamilyCard";
import { toPng } from "html-to-image";
import { useRef } from "react";
import { Download, Share2, Edit2, X, Camera } from "lucide-react";
import { getOptimizedUrl } from "@/lib/cloudinary";
import ImageCropper from "@/components/ImageCropper";
import TalentSelector from "@/components/TalentSelector";
import PinLock from "@/components/PinLock";


type TabKey = "family-members" | "tshirt" | "account-info" | "share-card";

const tabs: { key: TabKey; label: string }[] = [
  { key: "account-info", label: "My Profile" },
  { key: "family-members", label: "Family Tree" },
  { key: "tshirt", label: "Tshirt" },
  { key: "share-card", label: "Family Card" },
];

type IconType = ComponentType<{ className?: string }>;

const familyStyles: Record<
  string,
  { color: string; className: string; icon: IconType }
> = {
  Light: { color: "Gold", className: "text-yellow-500", icon: GiPolarStar },
  Power: { color: "Red", className: "text-red-500", icon: FaBolt },
  Dominion: { color: "Purple", className: "text-purple-500", icon: GiWingedScepter },
  Virtue: { color: "Green", className: "text-green-500", icon: GiFruitTree },
  Seraphs: { color: "Cyan", className: "text-cyan-500", icon: GiDove },
};

const HEAD_CODES = ["35AABA", "35AABB", "35AABC", "35AABD", "35AABE", "35AABF", "35AABG", "35AABH"];

const familyParents: Record<string, { father: string; mother: string }> = {
  Light: { father: "Brother Paul Etop", mother: "Sister Sarah Cyril" },
  Power: { father: "Brother Victor Omolu", mother: "Sister Fortune Umoh" },
  Dominion: { father: "Brother Emmanuel Godwin", mother: "Sister Divine Edosomwan" },
  Virtue: { father: "Brother Henry Igani", mother: "Sister Mercy Alexander" },
};

function calculateYears(dateString: string | null) {
  if (!dateString) return 0;
  const today = new Date();
  const pastDate = new Date(dateString);
  let age = today.getFullYear() - pastDate.getFullYear();
  const m = today.getMonth() - pastDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < pastDate.getDate())) age--;
  return age;
}

function formatDuration(dateString: string | null) {
  if (!dateString) return "0 days";
  const today = new Date();
  const pastDate = new Date(dateString);
  const diffTime = Math.abs(today.getTime() - pastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years !== 1 ? "s" : ""}`;
  } else if (diffDays >= 7) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  }
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

type MemberData = {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  nick_name: string;
  gender: string;
  family: string;
  date_of_birth: string | null;
  date_of_consecration: string | null;
  shirt_size: string;
  phone_number: string;
  photo_url?: string;
  talents?: string[];
  is_fname_edited?: boolean;
  is_lname_edited?: boolean;
  is_dob_edited?: boolean;
  is_photo_edited?: boolean;
  nation_of_origin?: string;
  state_of_origin?: string;
  pin?: string;
};

export default function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const [activeTab, setActiveTab] = useState<TabKey>("account-info");
  const [resolvedSlug, setResolvedSlug] = useState("");
  const [user, setUser] = useState<MemberData | null>(null);
  const [familyMembers, setFamilyMembers] = useState<MemberData[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const [editingField, setEditingField] = useState<"firstName" | "lastName" | "dateOfBirth" | "phoneNumber" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingField, setIsSavingField] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [isEditingTalents, setIsEditingTalents] = useState(false);
  const [tempTalents, setTempTalents] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ fn: () => void; title: string } | null>(null);


  // Protection check
  useEffect(() => {
    const auth = localStorage.getItem("virgins-auth");
    if (!auth) {
      router.push("/login");
      return;
    }

    // Theme initialization
    setIsClient(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme === "dark" || (!savedTheme && prefersDark) ? "dark" : "light";
    setTheme(initialTheme);
  }, [router]);

  useEffect(() => {
    if (!isClient) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, isClient]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    params.then(({ slug }) => setResolvedSlug(slug));
  }, [params]);

  useEffect(() => {
    if (!resolvedSlug) return;
    async function loadData() {
      setIsLoading(true);

      const authStr = localStorage.getItem("virgins-auth");
      let code = "";
      if (authStr) {
        try {
          const auth = JSON.parse(authStr);
          code = auth.code;
          setAuthCode(code);
        } catch { }
      }

      const nameParts = decodeURIComponent(resolvedSlug).split("-");
      const fName = nameParts[0] || "";
      const lName = nameParts.slice(1).join(" ") || "";

      let memberData = null;
      let memberErr = null;

      if (code) {
        const { data, error } = await supabase
          .from("members")
          .select("*")
          .ilike("code", code)
          .maybeSingle();
        memberData = data;
        memberErr = error;
      }

      // Fallback to name search if no authCode or no member found by code
      if (!memberData) {
        const { data, error } = await supabase
          .from("members")
          .select("*")
          .ilike("first_name", fName)
          .ilike("last_name", lName ? `${lName}` : "%")
          .limit(1)
          .maybeSingle();
        memberData = data;
        memberErr = error || memberErr;
      }

      if (memberErr) console.error("Error fetching user", memberErr);

      if (memberData) {
        // PIN Check
        if (!memberData.pin) {
          router.push("/setup-pin");
          return;
        }

        const verified = sessionStorage.getItem(`pin-verified-${memberData.id}`) === "true";
        setIsPinVerified(verified);

        setUser(memberData);

        // Refresh family data
        const { data: famData, error: famErr } = await supabase
          .from("members")
          .select("*")
          .eq("family", memberData.family);

        if (famErr) console.error("Error fetching family", famErr);
        if (famData) {
          const sorted = famData
            .filter(m => !HEAD_CODES.includes(m.code))
            .sort((a, b) => {
              const dateA = a.date_of_consecration ? new Date(a.date_of_consecration).getTime() : new Date().getTime();
              const dateB = b.date_of_consecration ? new Date(b.date_of_consecration).getTime() : new Date().getTime();
              return dateA - dateB;
            });
          setFamilyMembers(sorted);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [resolvedSlug, supabase]);

  const copyCode = () => {
    if (!user?.code) return;
    navigator.clipboard.writeText(user.code);
    setCopied(true);
    toast.success("Access code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    if (user) {
      sessionStorage.removeItem(`pin-verified-${user.id}`);
    }
    localStorage.removeItem("virgins-auth");
    toast.success("Logged out successfully.");
    router.push("/");
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        canvasWidth: 1080,
        canvasHeight: 1080,
      });
      const link = document.createElement("a");
      link.download = `virgins-family-card-${user?.first_name}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Family Card downloaded! Share it on your status.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate card image.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEditClick = (field: "firstName" | "lastName" | "dateOfBirth" | "phoneNumber", currentValue: string) => {
    setEditValue(currentValue);
    setEditingField(field);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleSaveField = async (authorized: any = false) => {
    if (!user || !editingField) return;
    const isAuthorized = authorized === true;

    // Check if specifically this field was already edited (phone has no limit)
    if (editingField === "firstName" && user.is_fname_edited) return;
    if (editingField === "lastName" && user.is_lname_edited) return;
    if (editingField === "dateOfBirth" && user.is_dob_edited) return;

    // Check if authorized
    if (!isAuthorized) {
      setPendingAction({
        fn: () => handleSaveField(true),
        title: "Confirm Update",
      });
      return;
    }

    setPendingAction(null);
    setIsSavingField(true);
    try {
      let dbField: string;
      let flagField: string | null = null;

      switch (editingField) {
        case "firstName": dbField = "first_name"; flagField = "is_fname_edited"; break;
        case "lastName": dbField = "last_name"; flagField = "is_lname_edited"; break;
        case "dateOfBirth": dbField = "date_of_birth"; flagField = "is_dob_edited"; break;
        case "phoneNumber": dbField = "phone_number"; flagField = null; break;
        default: return;
      }

      const updates: Record<string, any> = {
        [dbField]: editingField === "dateOfBirth" ? editValue : editingField === "phoneNumber" ? editValue.trim() : editValue.trim().toLowerCase(),
      };
      if (flagField) {
        updates[flagField] = true;
      }

      const { error } = await supabase
        .from("members")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      // Re-fetch the full user record from the DB to guarantee state = DB
      const { data: freshUser } = await supabase
        .from("members")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (freshUser) {
        setUser(freshUser);
      } else {
        setUser({ ...user, ...updates });
      }

      // If name changed, update the URL slug to match
      if (editingField === "firstName" || editingField === "lastName") {
        const newFirst = editingField === "firstName" ? editValue.trim().toLowerCase() : user.first_name;
        const newLast = editingField === "lastName" ? editValue.trim().toLowerCase() : user.last_name;
        const newSlug = `${newFirst}-${newLast}`.replace(/\s+/g, "-");
        router.replace(`/dashboard/${encodeURIComponent(newSlug)}`, { scroll: false });
      }

      if (editingField === "phoneNumber") {
        toast.success("Phone number updated!");
      } else {
        toast.success(`${editingField.replace(/([A-Z])/g, ' $1')} updated! This field is now locked.`);
      }
      setEditingField(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update field.");
    } finally {
      setIsSavingField(false);
    }
  };

  const handleSaveTalents = async (authorized: any = false) => {
    if (!user) return;
    const isAuthorized = authorized === true;

    if (!isAuthorized) {
      setPendingAction({
        fn: () => handleSaveTalents(true),
        title: "Update Talents",
      });
      return;
    }

    setPendingAction(null);
    setIsSavingField(true);
    try {
      const { error } = await supabase
        .from("members")
        .update({ talents: tempTalents })
        .eq("id", user.id);

      if (error) throw error;

      setUser({ ...user, talents: tempTalents });
      toast.success("Talents updated successfully!");
      setIsEditingTalents(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update talents.");
    } finally {
      setIsSavingField(false);
    }
  };

  const onPhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (user?.is_photo_edited) {
      toast.error("You've already updated your photo once.");
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setCropImageSrc(imageUrl);
    event.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File, authorized: any = false) => {
    if (!user || user.is_photo_edited) return;
    const isAuthorized = authorized === true;

    if (!isAuthorized) {
      setPendingAction({
        fn: () => handleCropComplete(croppedFile, true),
        title: "Update Photo",
      });
      return;
    }

    setPendingAction(null);
    setCropImageSrc(null);
    setIsUploadingPhoto(true);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary credentials are not set in .env");
      setIsUploadingPhoto(false);
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", croppedFile);
      uploadFormData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();
      if (data.secure_url) {
        const optimizedUrl = getOptimizedUrl(data.secure_url);

        const { error } = await supabase
          .from("members")
          .update({ photo_url: optimizedUrl, is_photo_edited: true })
          .eq("id", user.id);

        if (error) throw error;

        setUser({ ...user, photo_url: optimizedUrl, is_photo_edited: true });
        toast.success("Photo updated! This action is now locked.");
      } else {
        throw new Error(data.error?.message || "Failed to upload image");
      }
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-(--primary-gold) border-t-transparent" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">User Not Found</h1>
        <p className="text-sm text-zinc-500">We couldn&apos;t find a member matching this profile.</p>
        <Link href="/" className="text-sm font-medium text-(--primary-gold) underline underline-offset-4 hover:opacity-70 transition-opacity">
          Return Home
        </Link>
      </main>
    );
  }

  const age = calculateYears(user.date_of_birth);
  const serviceDuration = formatDuration(user.date_of_consecration);
  const fallbackStyles = { color: "Gold", className: "text-yellow-500", icon: GiPolarStar };
  const styleObj = familyStyles[user.family] || fallbackStyles;
  const Icon = styleObj.icon;
  const initials = `${user.first_name[0] ?? "U"}${user.last_name[0] ?? "M"}`.toUpperCase();
  const parents = familyParents[user.family];

  const isViewerOwner = user.code === authCode;

  return (
    <main className="min-h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropCompleteAction={handleCropComplete}
          onClose={() => setCropImageSrc(null)}
        />
      )}
      {user && user.pin && !isPinVerified && (
        <PinLock
          user={{
            first_name: user.first_name,
            photo_url: user.photo_url,
            pin: user.pin,
          }}
          onSuccess={() => {
            setIsPinVerified(true);
            sessionStorage.setItem(`pin-verified-${user.id}`, "true");
          }}
          onLogout={handleLogout}
        />
      )}
      {user && user.pin && pendingAction && (
        <PinLock
          user={{
            first_name: user.first_name,
            photo_url: user.photo_url,
            pin: user.pin,
          }}
          title={pendingAction.title}
          onSuccess={() => {
            pendingAction.fn();
          }}
          onCancel={() => setPendingAction(null)}
        />
      )}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">


        {/* ── Header Card ── */}
        <header className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 p-4 sm:p-6">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <Link href="/" className="text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
              ← Back
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="rounded-md border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Top row: avatar + name + code (stacks gracefully on mobile) */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            {/* Left: avatar + name block */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                {user.photo_url ? (
                  <img src={getOptimizedUrl(user.photo_url)} alt="Profile" className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover border border-(--primary-gold)/20 shadow-sm" />
                ) : (
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-(--primary-gold)/10 text-lg sm:text-xl font-bold text-(--primary-gold)">
                    {initials}
                  </div>
                )}
                {isViewerOwner && (
                  <label
                    className={`absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-xs transition-transform hover:scale-110 dark:border-zinc-700 dark:bg-zinc-800 ${!user.is_photo_edited && !isUploadingPhoto ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                    title={user.is_photo_edited ? "Photo locked" : "Update Photo"}
                  >
                    {isUploadingPhoto ? (
                      <div className="h-3 w-3 animate-spin rounded-full border border-(--primary-gold) border-t-transparent" />
                    ) : (
                      <Camera className={`h-3 w-3 ${user.is_photo_edited ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400"}`} />
                    )}
                    {!user.is_photo_edited && (
                      <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} disabled={isUploadingPhoto} />
                    )}
                  </label>
                )}
                <div className={`absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-md border border-zinc-100 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950 ${styleObj.className}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Name & badges */}
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold leading-tight truncate">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  @{user.nick_name || user.first_name.toLowerCase()}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-(--primary-gold)/10 px-2 py-1 text-xs font-semibold text-(--primary-gold)">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--primary-gold)" />
                    {user.family}
                  </span>
                  {HEAD_CODES.includes(user.code) && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      Family Head
                    </span>
                  )}
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                    {age} year{age !== 1 ? "s" : ""} old
                  </span>
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                    {serviceDuration} of service
                  </span>
                </div>
              </div>
            </div>

            {/* Right: access code — full width on mobile, inline on sm+ */}
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4 sm:min-w-[140px] dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Access Code</p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold tracking-[0.2em] text-(--primary-gold)">
                  {user.code}
                </span>
                <button
                  onClick={copyCode}
                  className="rounded-md border border-zinc-200 bg-white p-2 text-zinc-500 shadow-xs transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                  title="Copy Access Code"
                >
                  {copied
                    ? <Check className="h-4 w-4 text-green-500" />
                    : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── Tab Section ── */}
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 p-6">

          {/* Tab bar - Made responsive with horizontal scroll on small screens */}
          <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 dark:border-zinc-800 dark:bg-zinc-950 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
                className={`flex-1 min-w-[100px] sm:min-w-0 whitespace-nowrap rounded-md px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${activeTab === tab.key
                  ? "bg-white text-(--primary-gold) shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:bg-zinc-800 dark:text-(--primary-gold)"
                  : "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Account Info Tab ── */}
          {activeTab === "account-info" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold">Personal Information</h2>
                <p className="text-sm text-zinc-500 mt-1">Review your registered details. Each field under your profile can be edited exactly once.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "First Name", value: user.first_name, field: "firstName", canEdit: isViewerOwner && !user.is_fname_edited },
                  { label: "Last Name", value: user.last_name, field: "lastName", canEdit: isViewerOwner && !user.is_lname_edited },
                  { label: "Gender", value: user.gender, canEdit: false },
                  { label: "Family", value: user.family, canEdit: false },
                  { label: "Date of Birth", value: user.date_of_birth || "N/A", field: "dateOfBirth", canEdit: isViewerOwner && !user.is_dob_edited },
                  { label: "Date of Consecration", value: user.date_of_consecration || "N/A", canEdit: false },
                  { label: "Shirt Size", value: user.shirt_size, canEdit: false },
                  { label: "Phone Number", value: user.phone_number || "N/A", field: "phoneNumber", canEdit: isViewerOwner },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="group relative rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm transition-all hover:border-(--primary-gold)/20 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{item.label}</p>
                    {editingField === item.field ? (
                      <div className="mt-2 flex flex-col gap-2">
                        {item.field === "dateOfBirth" ? (
                          <input
                            type="date"
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-900 [color-scheme:light] dark:[color-scheme:dark]"
                          />
                        ) : item.field === "phoneNumber" ? (
                          <input
                            type="tel"
                            autoFocus
                            placeholder="e.g. +234..."
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-900"
                          />
                        ) : (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-900"
                          />
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveField()}
                            disabled={isSavingField}
                            className="btn-primary flex-1 rounded-md py-1 text-xs font-bold shadow-xs disabled:opacity-50"
                          >
                            {isSavingField ? "..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSavingField}
                            className="flex-1 rounded-md border border-zinc-200 bg-white py-1 text-xs font-semibold dark:border-zinc-800 dark:bg-black"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate capitalize">{item.value}</p>
                        {item.field && isViewerOwner && (
                          <button
                            onClick={() => {
                              if (item.canEdit) {
                                const initialValue = item.field === "dateOfBirth"
                                  ? (user.date_of_birth || "")
                                  : item.field === "phoneNumber"
                                    ? (user.phone_number || "")
                                    : (item.value as string);
                                handleEditClick(item.field as any, initialValue);
                              }
                            }}
                            disabled={!item.canEdit}
                            className={`rounded-md border border-zinc-200 bg-white p-1.5 transition-all dark:border-zinc-800 dark:bg-zinc-900 ${item.canEdit ? "text-zinc-400 hover:text-(--primary-gold)" : "text-zinc-200 dark:text-zinc-700 opacity-50 cursor-not-allowed"}`}
                            title={item.canEdit ? (item.field === "phoneNumber" ? "Edit" : "Edit once") : "Locked"}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Talents Section */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Talents & Gifts</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">What you bring to the family</p>
                  </div>
                  {isViewerOwner && !isEditingTalents && (
                    <button
                      onClick={() => {
                        setTempTalents(user.talents || []);
                        setIsEditingTalents(true);
                      }}
                      className="rounded-md border border-zinc-200 bg-white p-1.5 text-zinc-400 transition-all hover:text-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  {isEditingTalents ? (
                    <div className="space-y-4">
                      <TalentSelector
                        selectedTalents={tempTalents}
                        onChange={setTempTalents}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveTalents()}
                          disabled={isSavingField}
                          className="btn-primary flex-1 rounded-md py-2 text-xs font-bold shadow-xs disabled:opacity-50"
                        >
                          {isSavingField ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setIsEditingTalents(false)}
                          disabled={isSavingField}
                          className="flex-1 rounded-md border border-zinc-200 bg-white py-2 text-xs font-semibold dark:border-zinc-800 dark:bg-black"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.talents && user.talents.length > 0 ? (
                        user.talents.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-full border border-(--primary-gold)/30 bg-(--primary-gold)/5 px-3 py-1 text-xs font-medium text-(--primary-gold)"
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs italic text-zinc-500">No talents added yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Family Members Tab ── */}
          {activeTab === "family-members" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Family Tree</h2>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">See your growing spiritual family. Together we stand.</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-(--primary-gold)/10 px-4 py-2 text-(--primary-gold)">
                  <span className="text-sm font-bold">{familyMembers.length} Members Total</span>
                </div>
              </div>

              {/* Parents hierarchy */}
              {parents && (
                <div className="flex flex-col items-center">
                  <div className="flex w-full max-w-xs sm:max-w-sm items-center justify-between gap-2 sm:gap-4">
                    {/* Father */}
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full border border-(--primary-gold)/30 bg-(--primary-gold)/10 shadow-sm transition-transform hover:scale-105">
                        <span className="text-sm sm:text-xl font-bold text-(--primary-gold)">{getInitials(parents.father)}</span>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-(--primary-gold)">Father</p>
                        <p className="text-[10px] sm:text-xs font-semibold leading-tight mt-1 max-w-[80px] sm:max-w-[120px]">{parents.father}</p>
                      </div>
                    </div>

                    {/* Connector */}
                    <div className="h-px flex-1 bg-(--primary-gold)/30 -mt-8 sm:-mt-10" />

                    {/* Mother */}
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full border border-(--primary-gold)/30 bg-(--primary-gold)/10 shadow-sm transition-transform hover:scale-105">
                        <span className="text-sm sm:text-xl font-bold text-(--primary-gold)">{getInitials(parents.mother)}</span>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-(--primary-gold)">Mother</p>
                        <p className="text-[10px] sm:text-xs font-semibold leading-tight mt-1 max-w-[80px] sm:max-w-[120px]">{parents.mother}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vertical stem */}
                  <div className="h-8 sm:h-10 w-px bg-(--primary-gold)/30" />

                  {/* Family label */}
                  <div className="rounded-full border border-(--primary-gold)/30 bg-white px-4 sm:px-6 py-1.5 sm:py-2 shadow-sm dark:bg-zinc-950">
                    <span className="text-xs sm:text-sm font-bold flex items-center gap-2 text-(--primary-gold)">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {user.family}
                    </span>
                  </div>
                </div>
              )}

              {!parents && (
                <div className="flex flex-col items-center">
                  <div className="rounded-full border border-(--primary-gold)/30 bg-white px-4 sm:px-6 py-1.5 sm:py-2 shadow-sm dark:bg-zinc-950">
                    <span className="text-xs sm:text-sm font-bold flex items-center gap-2 text-(--primary-gold)">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {user.family}
                    </span>
                  </div>
                </div>
              )}

              {/* Members grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {familyMembers.map((member, index) => {
                  const mInitial = getInitials(`${member.first_name} ${member.last_name}`);
                  const mService = formatDuration(member.date_of_consecration);
                  const isViewer = member.id === user.id;

                  return (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member);
                        setIsModalOpen(true);
                      }}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 transition-all shadow-sm text-left ${isViewer
                        ? "border-(--primary-gold)/40 bg-(--primary-gold)/5 ring-1 ring-(--primary-gold)/10"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 hover:border-(--primary-gold)/30 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80"
                        }`}
                    >
                      <div className="relative shrink-0">
                        {member.photo_url ? (
                          <img src={getOptimizedUrl(member.photo_url)} alt="Member" className={`h-12 w-12 rounded-full object-cover shadow-sm ${isViewer ? "shadow-md shadow-(--primary-gold)/20 border-2 border-(--primary-gold)" : ""}`} />
                        ) : (
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${isViewer
                            ? "bg-(--primary-gold) text-white shadow-md shadow-(--primary-gold)/20"
                            : "bg-(--primary-gold)/10 text-(--primary-gold)"
                            }`}>
                            {mInitial}
                          </div>
                        )}
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 shadow-xs" title="Eldest">
                            <Star className="h-3 w-3 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                          {member.first_name} {member.last_name}
                          {isViewer && (
                            <span className="rounded-md bg-(--primary-gold) px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">{mService} service</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {familyMembers.length === 0 && (
                <p className="py-10 text-center text-sm text-zinc-500">No members found in this family yet.</p>
              )}
            </div>
          )}

          {/* ── Tshirt Tab ── */}
          {activeTab === "tshirt" && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold">3D Shirt Preview</p>
                  <p className="text-sm text-zinc-500 mt-1">Rotate and explore your official event T-shirt</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-semibold text-(--primary-gold)">Size: {user.shirt_size || "XL"}</span>
                  <p className="text-xs text-zinc-500 mt-1">Still in progress…</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-(--primary-gold)/20 shadow-sm">
                <TshirtModel />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1.5">Material</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">100% Premium Cotton</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1.5">Design</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Virgins Official 2026 Edition</p>
                </div>
              </div>
            </div>
          )}
          {/* ── Share Card Tab ── */}
          {activeTab === "share-card" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                <div className="text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl font-bold">Your Shareable Identity</h2>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">Download this square card to share on social media.</p>
                </div>
                <button
                  onClick={downloadCard}
                  disabled={isDownloading}
                  className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold shadow-lg shadow-(--primary-gold)/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isDownloading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  {isDownloading ? "Generating..." : "Download Card"}
                </button>
              </div>

              <div className="mx-auto w-full max-w-[450px]">
                <FamilyCard
                  firstName={user.first_name}
                  lastName={user.last_name}
                  family={user.family}
                  photoUrl={user.photo_url}
                  gender={user.gender}
                  isHead={HEAD_CODES.includes(user.code)}
                  cardRef={cardRef}
                />
              </div>

              <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 text-center">
                <p className="text-xs text-zinc-500 font-medium flex items-center justify-center gap-2">
                  <Share2 className="h-3.5 w-3.5" />
                  Royal design tailored specifically for our 35th Anniversary.
                </p>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* ── Member Detail Modal ── */}
      {isModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 dark:bg-zinc-900">
            {/* Header / Close Button */}
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-black/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/40"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Image View */}
            <div className="group relative aspect-square w-full bg-zinc-100 dark:bg-zinc-800">
              {selectedMember.photo_url ? (
                <img
                  src={getOptimizedUrl(selectedMember.photo_url)}
                  alt={`${selectedMember.first_name} ${selectedMember.last_name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-(--primary-gold)/10 text-6xl font-bold text-(--primary-gold)">
                  {getInitials(`${selectedMember.first_name} ${selectedMember.last_name}`)}
                </div>
              )}

              {/* Image Overlay Label */}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-6 text-white pt-20">
                <h3 className="text-2xl font-bold">{selectedMember.first_name} {selectedMember.last_name}</h3>
                <p className="mt-1 text-sm font-medium text-white/80">@{selectedMember.nick_name || selectedMember.first_name.toLowerCase()}</p>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Service Duration</p>
                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formatDuration(selectedMember.date_of_consecration)} of service
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Family</p>
                  <p className="mt-1 text-sm font-bold text-(--primary-gold)">
                    {selectedMember.family}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Nation of Origin</p>
                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedMember.nation_of_origin || "N/A"}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">State of Origin</p>
                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedMember.state_of_origin || "N/A"}
                  </p>
                </div>
              </div>

              {/* Talents section if any */}
              {selectedMember.talents && selectedMember.talents.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Talents & Gifts</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.talents.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full border border-(--primary-gold)/30 bg-(--primary-gold)/5 px-3 py-1 text-xs font-medium text-(--primary-gold)"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-6 w-full btn-primary rounded-xl py-3 font-bold shadow-lg shadow-(--primary-gold)/20 transition-all active:scale-95"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}