"use client";

import dynamic from "next/dynamic";

function TshirtLoading() {
  return (
    <div className="flex h-[500px] w-full items-center justify-center rounded-xl border border-(--primary-gold)/30 bg-black">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-500" />
        <p className="text-sm text-zinc-400">Loading 3D Model…</p>
      </div>
    </div>
  );
}

const TshirtScene = dynamic(() => import("./TshirtScene"), {
  ssr: false,
  loading: () => <TshirtLoading />,
});

export default function TshirtModel() {
  return <TshirtScene />;
}
