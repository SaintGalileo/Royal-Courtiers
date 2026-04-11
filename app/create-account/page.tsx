"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { UploadCloud, Image as ImageIcon, X, Loader2, Check, Bird, Search, ChevronDown } from "lucide-react";
import { GiDove } from "react-icons/gi";
import { getOptimizedUrl } from "@/lib/cloudinary";
import { COUNTRIES, type Country } from "@/lib/countries";
import { useRef as reactRef } from "react";
import ImageCropper from "@/components/ImageCropper";

import TalentSelector, { TALENT_OPTIONS } from "@/components/TalentSelector";

const STORAGE_KEY = "create-account-form-v2";
const FAMILY_OPTIONS = ["Light", "Dominion", "Virtue", "Power", "Seraphs"] as const;
type Family = typeof FAMILY_OPTIONS[number];

const COUNTRY_STATES: Record<string, string[]> = {
  Nigeria: [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Ebonyi",
    "Cross River", "Delta", "Edo", "Enugu", "FCT", "Imo", "Kaduna", "Kano", "Kogi",
    "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
    "Rivers", "Sokoto",
  ],
  Ghana: [
    "Ahafo",
    "Ashanti",
    "Bono",
    "Bono East",
    "Central",
    "Eastern",
    "Greater Accra",
    "North East",
    "Northern",
    "Oti",
    "Savannah",
    "Upper East",
    "Upper West",
    "Volta",
    "Western",
    "Western North"
  ],
  Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu"],
  "South Africa": ["Gauteng", "KwaZulu-Natal", "Western Cape", "Eastern Cape", "Limpopo"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
};

type FormData = {
  pin: string;
  firstName: string;
  lastName: string;
  nickName: string;
  gender: "Brother" | "Sister" | "";
  dateOfBirth: string;
  dateOfConsecration: string;
  nationOfOrigin: string;
  stateOfOrigin: string;
  nationOfResidence: string;
  stateOfResidence: string;
  shirtSize: string;
  talents: string[];
  singingPart: string;
  countryCode: string;
  phoneNumber: string;
  photoName: string;
  photoDataUrl: string;
};

const initialForm: FormData = {
  pin: "",
  firstName: "",
  lastName: "",
  nickName: "",
  gender: "",
  dateOfBirth: "",
  dateOfConsecration: "",
  nationOfOrigin: "Nigeria",
  stateOfOrigin: "",
  nationOfResidence: "Nigeria",
  stateOfResidence: "",
  shirtSize: "",
  talents: [],
  singingPart: "",
  countryCode: "+234",
  phoneNumber: "",
  photoName: "",
  photoDataUrl: "",
};

const STEPS = [
  { full: "Access Code", short: "Code" },
  { full: "Identity", short: "ID" },
  { full: "Location", short: "Location" },
  { full: "Talent & Photo", short: "Talent" },
] as const;

function getAgeGroup(dob: string) {
  if (!dob) return "Adult";
  const age = Math.floor((new Date().getTime() - new Date(dob).getTime()) / 31557600000);
  if (age <= 12) return "Child";
  if (age <= 19) return "Teen";
  if (age <= 35) return "YoungAdult";
  return "Adult";
}

function getServiceGroup(doc: string) {
  if (!doc) return "Unknown";
  const years = Math.floor((new Date().getTime() - new Date(doc).getTime()) / 31557600000);
  if (years <= 5) return "0-5_Years";
  if (years <= 10) return "6-10_Years";
  if (years <= 20) return "11-20_Years";
  return "21+_Years";
}

export default function CreateAccountPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [submittedFamily, setSubmittedFamily] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as FormData;
      setFormData({ ...initialForm, ...parsed });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const originStates = useMemo(
    () => COUNTRY_STATES[formData.nationOfOrigin] ?? [],
    [formData.nationOfOrigin],
  );
  const residenceStates = useMemo(
    () => COUNTRY_STATES[formData.nationOfResidence] ?? [],
    [formData.nationOfResidence],
  );

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));



  const onPhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setCropImageSrc(imageUrl);

    // Reset file input so user can select the same file again if they cancel
    event.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    setCropImageSrc(null);
    update("photoName", croppedFile.name);
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
        update("photoDataUrl", optimizedUrl);
        toast.success("Photo uploaded successfully!");
      } else {
        console.error("Cloudinary response:", data);
        throw new Error(data.error?.message || "Failed to upload image");
      }
    } catch (e: any) {
      toast.error(`Upload failed: ${e.message || "Unknown error"}`);
      console.error(e);
      update("photoDataUrl", "");
      update("photoName", "");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const verifyCodeAndContinue = async () => {
    const code = formData.pin.toUpperCase().trim();
    if (code.length !== 6) {
      toast.error("Code must be exactly 6 characters.");
      return;
    }

    setIsVerifyingCode(true);
    try {
      const { data, error } = await supabase
        .from("access_codes")
        .select("id, code, is_used")
        .ilike("code", code)
        .maybeSingle();

      if (error) {
        console.error("Supabase Error during verification:", error);
      }

      if (!data) {
        toast.error("Invalid access code. Please check and try again.");
        return;
      }
      if (data.is_used) {
        toast.error("This code has already been used. Each code can only be used once.");
        return;
      }
      toast.success("Access code verified! Continue registration.");
      setStep(1);
    } catch {
      toast.error("Could not verify code. Please check your connection.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const nextStep = async () => {
    if (step === 0) {
      await verifyCodeAndContinue();
      return;
    }
    if (step === 1) {
      const nick = formData.nickName.trim().toLowerCase();
      if (!nick) {
        toast.error("Nickname is required.");
        return;
      }
      setIsCheckingNickname(true);
      try {
        const { data, error } = await supabase
          .from("members")
          .select("id")
          .ilike("nick_name", nick)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          toast.error("This nickname is already taken. Please choose another.");
          return;
        }
      } catch (e) {
        toast.error("Error checking nickname availability.");
        return;
      } finally {
        setIsCheckingNickname(false);
      }
    }
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const canContinue =
    (step === 0 && /^[A-Za-z0-9]{6}$/.test(formData.pin)) ||
    (step === 1 &&
      formData.firstName &&
      formData.lastName &&
      formData.gender &&
      formData.dateOfBirth &&
      formData.dateOfConsecration &&
      formData.phoneNumber.length >= 7) ||
    (step === 2 &&
      formData.nationOfOrigin &&
      formData.stateOfOrigin &&
      formData.nationOfResidence &&
      formData.stateOfResidence &&
      formData.shirtSize) ||
    step === 3;

  const getAssignedFamily = async (): Promise<Family> => {
    const code = formData.pin.toUpperCase().trim();

    // Special Group: Seraphs
    const seraphCodes = ["35AAAA", "35AAAB", "35AAAC", "35AAAD", "35AAAE", "35AAAF"];
    if (seraphCodes.includes(code)) return "Seraphs";

    // Family Heads
    if (code === "35AABA" || code === "35AABB") return "Dominion";
    if (code === "35AABC" || code === "35AABD") return "Light";
    if (code === "35AABE" || code === "35AABF") return "Power";
    if (code === "35AABG" || code === "35AABH") return "Virtue";

    const fallbackFamily = FAMILY_OPTIONS[Math.floor(Math.random() * (FAMILY_OPTIONS.length - 1))] as Family; // Exclude Seraphs from random assignment
    try {
      const { data: members, error } = await supabase.from("members").select("family, gender, date_of_birth, date_of_consecration, singing_part");
      if (error || !members) return fallbackFamily;

      const userAgeGroup = getAgeGroup(formData.dateOfBirth);
      const userServiceGroup = getServiceGroup(formData.dateOfConsecration);
      const userSingingPart = formData.singingPart;

      const stats = FAMILY_OPTIONS.filter(f => f !== "Seraphs").map(family => {
        const familyMembers = members.filter(m => m.family === family);
        const total = familyMembers.length;

        let demographicScore = 0;
        familyMembers.forEach(m => {
          if (m.gender === formData.gender) demographicScore += 1;
          if (getAgeGroup(m.date_of_birth) === userAgeGroup) demographicScore += 1;
          if (getServiceGroup(m.date_of_consecration) === userServiceGroup) demographicScore += 1;
          if (userSingingPart && m.singing_part === userSingingPart) demographicScore += 2;
        });

        return { family, total, demographicScore };
      });

      // Find the family with the minimum concentration of matching demographics
      const minDemoScore = Math.min(...stats.map(s => s.demographicScore));
      const candidateFamilies = stats.filter(s => s.demographicScore === minDemoScore);

      if (candidateFamilies.length === 1) {
        return candidateFamilies[0].family as Family;
      }

      // Tie breaker 1: lowest overall members
      const minTotal = Math.min(...candidateFamilies.map(s => s.total));
      const ultimateCandidates = candidateFamilies.filter(s => s.total === minTotal);

      // Tie breaker 2: Random from remainder
      return ultimateCandidates[Math.floor(Math.random() * ultimateCandidates.length)].family as Family;
    } catch {
      return fallbackFamily;
    }
  };

  const submit = async () => {
    setIsSubmitting(true);
    const code = formData.pin.toUpperCase().trim();

    try {
      const { data: codeRow, error: codeErr } = await supabase
        .from("access_codes")
        .select("id, is_used")
        .ilike("code", code)
        .maybeSingle();

      if (codeErr) {
        console.error("Supabase Error during submit:", codeErr);
      }

      if (!codeRow) {
        toast.error("Invalid access code.");
        setIsSubmitting(false);
        return;
      }
      if (codeRow.is_used) {
        toast.error("This code has already been used.");
        setIsSubmitting(false);
        return;
      }

      toast.info("Computing family assignment...");
      const mappedFamily = await getAssignedFamily();

      const { data: newMember, error: insertErr } = await supabase.from("members").insert({
        code,
        first_name: formData.firstName.trim().toLowerCase(),
        last_name: formData.lastName.trim().toLowerCase(),
        nick_name: formData.nickName.trim().toLowerCase(),
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        date_of_consecration: formData.dateOfConsecration,
        nation_of_origin: formData.nationOfOrigin,
        state_of_origin: formData.stateOfOrigin,
        nation_of_residence: formData.nationOfResidence,
        state_of_residence: formData.stateOfResidence,
        shirt_size: formData.shirtSize,
        talents: formData.talents,
        singing_part: formData.singingPart || null,
        phone_number: `${formData.countryCode}${formData.phoneNumber}`,
        photo_url: formData.photoDataUrl,
        family: mappedFamily,
      }).select("id").single();

      if (insertErr) {
        if (insertErr.code === "23505") {
          toast.error("This code has already been registered.");
        } else {
          toast.error(`Registration failed: ${insertErr.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      await supabase
        .from("access_codes")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("code", code);

      // Save login state
      localStorage.setItem(
        "virgins-auth",
        JSON.stringify({
          id: newMember.id,
          firstName: formData.firstName.trim().toLowerCase(),
          lastName: formData.lastName.trim().toLowerCase(),
          code: code,
          family: mappedFamily,
        }),
      );

      localStorage.removeItem(STORAGE_KEY);
      toast.success("🎉 Registration complete! Welcome to the family.");
      setSubmittedFamily(mappedFamily);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, idx) => ({
        id: idx,
        left: `${(idx * 11) % 100}%`,
        delay: `${(idx % 8) * 0.12}s`,
        duration: `${2.4 + (idx % 5) * 0.35}s`,
      })),
    [],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropCompleteAction={handleCropComplete}
          onClose={() => setCropImageSrc(null)}
        />
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <Link className="underline hover:text-(--primary-gold) transition-colors" href="/">
          Back to Home
        </Link>
      </div>

      <section className="rounded-2xl border border-(--primary-gold)/35  p-5 backdrop-blur-md">
        <div className="mb-5 flex items-center gap-2 overflow-x-auto">
          {STEPS.map((item, idx) => (
            <div key={item.full} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${idx <= step ? "btn-primary" : "border border-zinc-400 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
              >
                {idx + 1}
              </div>
              <span className={`hidden text-sm sm:inline ${idx <= step ? "font-semibold text-(--primary-gold)" : "text-zinc-600 dark:text-zinc-400"}`}>
                {item.full}
              </span>
              <span className={`text-sm sm:hidden ${idx <= step ? "font-semibold text-(--primary-gold)" : "text-zinc-600 dark:text-zinc-400"}`}>
                {item.short}
              </span>
              {idx < STEPS.length - 1 && <div className="h-px w-6 bg-zinc-400 dark:bg-zinc-700" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Enter Your Access Code</h2>
            <input
              value={formData.pin}
              onChange={(e) => update("pin", e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase())}
              className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 font-mono text-lg tracking-widest uppercase dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
              placeholder="e.g. 35XXXX"
              maxLength={6}
            />
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Enter the 6-character alphanumeric code you were given. Each code can only be used once.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold">First Name</label>
              <input
                value={formData.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Last Name</label>
              <input
                value={formData.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Nickname</label>
              <input
                value={formData.nickName}
                onChange={(e) => update("nickName", e.target.value.replace(/[^A-Za-z0-9._]/g, ""))}
                placeholder="e.g. kok_si or kok.si"
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => update("gender", e.target.value as FormData["gender"])}
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
              >
                <option value="">Select gender</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Date of Consecration</label>
              <input
                type="date"
                value={formData.dateOfConsecration}
                onChange={(e) => update("dateOfConsecration", e.target.value)}
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-semibold">Phone Number</label>
              <div className="relative flex items-center h-[46px] w-full rounded-md border border-zinc-400 bg-white/50 dark:border-zinc-700 dark:bg-black/50 overflow-hidden focus-within:border-(--primary-gold) transition-colors">
                {/* Embedded Country Selector */}
                <select
                  value={formData.countryCode}
                  onChange={(e) => update("countryCode", e.target.value)}
                  className="absolute left-0 top-0 h-full w-[80px] bg-transparent pl-3 pr-2 text-sm font-bold border-r border-zinc-400 dark:border-zinc-700 outline-none cursor-pointer appearance-none"
                >
                  {COUNTRIES.sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                    <option key={c.code} value={c.dial_code} className="dark:bg-zinc-900">
                      {c.code} {c.dial_code}
                    </option>
                  ))}
                </select>
                
                {/* Phone Input */}
                <input
                  type="tel"
                  placeholder="8012345678"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9]/g, "");
                    // No starting with zero
                    if (val.startsWith("0")) {
                      val = val.substring(1);
                    }
                    // Limit to 10 digits
                    val = val.slice(0, 10);
                    update("phoneNumber", val);
                  }}
                  className="w-full h-full pl-[90px] pr-3 bg-transparent text-sm font-mono outline-none"
                />
              </div>
              <p className="text-[11px] text-zinc-500 italic mt-1">Select your country and enter the remaining 10 digits (no leading zero).</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold">Nation of Origin</label>
              <select
                value={formData.nationOfOrigin}
                onChange={(e) => {
                  const nation = e.target.value;
                  update("nationOfOrigin", nation);
                  update("stateOfOrigin", "");
                }}
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
              >
                {Object.keys(COUNTRY_STATES).map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">State of Origin</label>
              <select
                value={formData.stateOfOrigin}
                onChange={(e) => update("stateOfOrigin", e.target.value)}
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
              >
                <option value="">Select state</option>
                {originStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Nation of Residence</label>
              <select
                value={formData.nationOfResidence}
                onChange={(e) => {
                  const nation = e.target.value;
                  update("nationOfResidence", nation);
                  update("stateOfResidence", "");
                }}
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
              >
                {Object.keys(COUNTRY_STATES).map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">State of Residence</label>
              <select
                value={formData.stateOfResidence}
                onChange={(e) => update("stateOfResidence", e.target.value)}
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
              >
                <option value="">Select state</option>
                {residenceStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-semibold">Shirt Size</label>
              <select
                value={formData.shirtSize}
                onChange={(e) => update("shirtSize", e.target.value)}
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
              >
                <option value="">Select shirt size</option>
                {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Talent & Gifts</label>
              <TalentSelector
                selectedTalents={formData.talents}
                onChange={(talents) => update("talents", talents)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Singing Part (If applicable)</label>
              <select
                value={formData.singingPart}
                onChange={(e) => update("singingPart", e.target.value)}
                className="w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
              >
                <option value="">Select singing part...</option>
                <option value="Treble">Treble</option>
                <option value="Alto">Alto</option>
                <option value="Tenor">Tenor</option>
                <option value="Bass">Bass</option>
              </select>
            </div>

            <div className="space-y-3 pt-4 mt-2 border-t border-(--primary-gold)/20">
              <div>
                <label className="text-sm font-semibold">Upload Photo</label>
                <p className="text-xs text-zinc-500 max-w-sm mt-0.5">
                  Please ensure your picture shows you in white attire: soutane, ovengud, or casual white.
                </p>
              </div>

              {!formData.photoDataUrl && !isUploadingPhoto ? (
                <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-8 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group">
                  <UploadCloud className="h-10 w-10 text-zinc-400 group-hover:text-(--primary-gold) mb-3 transition-colors" />
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Click to upload or drag and drop</p>
                  <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              ) : isUploadingPhoto ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-(--primary-gold)/50 bg-(--primary-gold)/5 p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-(--primary-gold) mb-3" />
                  <p className="text-sm font-semibold text-(--primary-gold)">Securely uploading to Cloudinary...</p>
                </div>
              ) : (
                <div className="relative rounded-xl border border-(--primary-gold)/30 bg-(--primary-gold)/5 p-4 shadow-sm flex items-center gap-4 animate-in fade-in duration-500">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-(--primary-gold)/30 shadow-sm">
                    <img src={formData.photoDataUrl} alt="Uploaded preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{formData.photoName || "Uploaded Photo"}</p>
                    <p className="text-xs text-green-600 dark:text-green-500 font-semibold mt-1 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" /> Upload complete
                    </p>
                  </div>
                  <button
                    onClick={() => { update("photoDataUrl", ""); update("photoName", ""); }}
                    className="rounded-full bg-white dark:bg-zinc-950 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shadow-sm border border-zinc-200 dark:border-zinc-800"
                    title="Remove photo"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-(--primary-gold)/20 pt-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className="rounded-md border border-zinc-400 bg-white/50 px-4 py-2 font-medium disabled:opacity-50 dark:border-zinc-700 dark:bg-black/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canContinue || isVerifyingCode || isCheckingNickname}
              className="btn-primary rounded-md px-6 py-2 font-semibold disabled:opacity-50 transition-transform active:scale-95"
            >
              {isVerifyingCode ? "Verifying..." : isCheckingNickname ? "Checking..." : "Continue"}
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting || isUploadingPhoto || !formData.photoDataUrl}
              className="btn-primary rounded-md px-6 py-2 font-semibold disabled:opacity-50 transition-transform active:scale-95"
            >
              {isSubmitting ? "Submitting..." : "Finish"}
            </button>
          )}
        </div>
      </section>

      {submittedFamily && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-(--primary-gold)/40 bg-zinc-50 p-6 text-zinc-900 shadow-2xl dark:bg-zinc-900 dark:text-zinc-100">
            <div className="pointer-events-none absolute inset-0">
              {confettiPieces.map((piece) => (
                <span
                  key={piece.id}
                  className="confetti-piece"
                  style={{
                    left: piece.left,
                    animationDelay: piece.delay,
                    animationDuration: piece.duration,
                  }}
                />
              ))}
            </div>

            <h3 className="text-2xl font-bold bg-linear-to-r from-(--primary-gold) to-yellow-600 bg-clip-text text-transparent">Congratulations!</h3>
            <div className="mt-4 flex flex-col items-center text-center">
              {submittedFamily === "Seraphs" ? (
                <>
                  <div className="mb-3 rounded-full bg-cyan-100 p-4 dark:bg-cyan-900/30">
                    <GiDove className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">Welcome Seraph</p>
                </>
              ) : (
                <p className="text-lg leading-relaxed">
                  You are assigned to the <span className="font-bold text-(--primary-gold) block text-2xl mt-1">{submittedFamily}</span>
                </p>
              )}
            </div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Your registration is complete. Welcome to the family!
            </p>

            <div className="mt-8 flex justify-end">
              <Link href="/setup-pin" className="btn-primary rounded-md px-5 py-2.5 font-semibold shadow-md hover:shadow-lg transition-all">
                Setup Security PIN
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
