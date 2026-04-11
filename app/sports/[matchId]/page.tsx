"use client";

import { use, useState, useRef, useCallback } from "react";
import { ChevronLeft, Shield, MapPin, Clock, Timer, Users, Trophy, BarChart2, Camera } from "lucide-react";
import Link from "next/link";
import * as htmlToImage from 'html-to-image';

type DetailTab = "lineup" | "standings";

export default function MatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const [tab, setTab] = useState<DetailTab>("lineup");
  const pitchRef = useRef<HTMLDivElement>(null);

  const match = {
    id: matchId,
    teamA: "TBD",
    teamB: "TBD",
    scoreA: "—",
    scoreB: "—",
    status: "Not Started",
    time: "TBD",
    date: "August 11, 2026",
    pitch: "TBD",
    playersPerSide: 5,
  };

  const teamAPlayers = [
    { name: "Player 1", position: "GK", number: 1 },
    { name: "Player 2", position: "DEF", number: 2 },
    { name: "Player 3", position: "LW", number: 3 },
    { name: "Player 4", position: "RW", number: 4 },
    { name: "Player 5", position: "ST", number: 5 },
  ];

  const teamBPlayers = [
    { name: "Player 1", position: "GK", number: 1 },
    { name: "Player 2", position: "DEF", number: 2 },
    { name: "Player 3", position: "LW", number: 3 },
    { name: "Player 4", position: "RW", number: 4 },
    { name: "Player 5", position: "ST", number: 5 },
  ];

  const teamASubstitutes = [
    { name: "Sub 1", position: "—", number: 6 },
    { name: "Sub 2", position: "—", number: 7 },
  ];

  const teamBSubstitutes = [
    { name: "Sub 1", position: "—", number: 6 },
    { name: "Sub 2", position: "—", number: 7 },
  ];

  const handleCapturePitch = useCallback(() => {
    if (!pitchRef.current) return;
    htmlToImage.toPng(pitchRef.current, { cacheBust: true, backgroundColor: '#195030' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `match-${matchId}-lineup.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error('Screenshot failed:', err));
  }, [matchId]);

  // Bracket data
  const bracket = {
    semiFinal1: { teamA: "TBD", teamB: "TBD", scoreA: null, scoreB: null },
    semiFinal2: { teamA: "TBD", teamB: "TBD", scoreA: null, scoreB: null },
    final: { teamA: "TBD", teamB: "TBD", scoreA: null, scoreB: null },
    winner: null as string | null,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0f] text-zinc-900 dark:text-white transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,900&family=Bebas+Neue&display=swap');
        .md-page { font-family: 'DM Sans', sans-serif; }
        .bebas   { font-family: 'Bebas Neue', sans-serif; }

        .score-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(56px, 13vw, 88px);
          line-height: 1;
          letter-spacing: -1px;
        }

        /* ── PITCH ── */
        .pitch-outer {
          border-radius: 14px;
          overflow: hidden;
          border: 2px solid #1d3d26;
          box-shadow: 0 0 32px #1a4d2e44, inset 0 0 24px #00000044;
        }
        .pitch-surface {
          background: repeating-linear-gradient(
            180deg,
            #1d5c35 0px, #1d5c35 32px,
            #195030 32px, #195030 64px
          );
          position: relative;
          width: 100%;
          height: 580px;
        }

        .pm { position: absolute; }
        .pm-border {
          top: 8px; left: 8px; right: 8px; bottom: 8px;
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 3px;
        }
        .pm-half {
          top: 50%; left: 8px; right: 8px;
          height: 1.5px;
          background: rgba(255,255,255,0.18);
          transform: translateY(-50%);
        }
        .pm-circle {
          top: 50%; left: 50%;
          width: 64px; height: 64px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.18);
          transform: translate(-50%, -50%);
        }
        .pm-dot {
          top: 50%; left: 50%;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.32);
          transform: translate(-50%, -50%);
        }
        .pm-pen-t {
          top: 8px; left: 28%; right: 28%;
          height: 15%;
          border: 1.5px solid rgba(255,255,255,0.18);
          border-top: none;
        }
        .pm-pen-b {
          bottom: 8px; left: 28%; right: 28%;
          height: 15%;
          border: 1.5px solid rgba(255,255,255,0.18);
          border-bottom: none;
        }
        .pm-goal-t {
          top: 8px; left: 40%; right: 40%;
          height: 5%;
          border: 1.5px solid rgba(255,255,255,0.18);
          border-top: none;
          background: rgba(255,255,255,0.025);
        }
        .pm-goal-b {
          bottom: 8px; left: 40%; right: 40%;
          height: 5%;
          border: 1.5px solid rgba(255,255,255,0.18);
          border-bottom: none;
          background: rgba(255,255,255,0.025);
        }

        .lineup-half {
          position: absolute;
          left: 0; right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-evenly;
          z-index: 10;
        }
        .lineup-t { top: 8px;    height: calc(50% - 8px); padding: 28px 0; }
        .lineup-b { bottom: 8px; height: calc(50% - 8px); padding: 28px 0; }

        .lineup-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 28px;
          width: 100%;
        }

        /* player token */
        .pt { display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .pc {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 900;
          box-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }
        .pc-w { background: #dde0e8; color: #111; border: 2px solid rgba(255,255,255,0.6); }
        .pc-g { background: #c9a84c; color: #fff; border: 2px solid rgba(255,255,255,0.5); }
        .pn {
          font-size: 8px; font-weight: 800;
          color: rgba(255,255,255,0.92);
          text-shadow: 0 1px 4px rgba(0,0,0,0.9);
          white-space: nowrap; max-width: 48px;
          overflow: hidden; text-overflow: ellipsis; text-align: center;
        }
        .pp {
          font-size: 7px; font-weight: 900;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          text-shadow: 0 1px 3px rgba(0,0,0,0.9);
        }

        /* ── BRACKET ── */
        .bracket-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 24px 0;
        }

        .bracket-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }

        .bracket-match {
          border-radius: 12px;
          border: 1px solid;
          overflow: hidden;
          position: relative;
        }
        .bracket-match.light { background: white; border-color: #e4e4e7; }
        .bracket-match.dark  { background: #111118; border-color: #1e1e2e; }

        .bracket-team {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 800;
          border-bottom: 1px solid;
          gap: 6px;
        }
        .bracket-team.light { border-color: #f0f0f3; }
        .bracket-team.dark  { border-color: #1a1a26; }
        .bracket-team:last-child { border-bottom: none; }

        .bracket-score {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px;
          min-width: 14px;
          text-align: center;
        }

        /* connector lines */
        .connector-wrap {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;
          width: 32px;
          height: 100%;
          position: relative;
          flex-shrink: 0;
        }

        .trophy-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          width: 80px;
        }

        .trophy-ring {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #f0d080, #c9a84c 60%, #a07828);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 24px #c9a84c66, 0 4px 12px rgba(0,0,0,0.4);
          position: relative;
        }

        /* tab styles */
        .detail-tabs {
          display: flex;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid;
          margin-bottom: 20px;
        }
        .detail-tabs.light { border-color: #e4e4e7; background: #f4f4f5; }
        .detail-tabs.dark  { border-color: #1e1e2e; background: #0e0e18; }

        .detail-tab {
          flex: 1;
          padding: 9px 0;
          font-size: 11px; font-weight: 900;
          letter-spacing: 0.12em; text-transform: uppercase;
          display: flex; align-items: center; justify-content: center; gap-: 6px;
          transition: all 0.15s;
          border: none; cursor: pointer;
          background: transparent;
        }
        .detail-tab.active {
          background: #c9a84c;
          color: white;
        }
        .detail-tab.inactive.light { color: #a1a1aa; }
        .detail-tab.inactive.dark  { color: #555570; }
      `}</style>

      <div className="md-page max-w-xl mx-auto px-4 py-8 pb-20">

        {/* Back */}
        <Link
          href="/sports"
          className="inline-flex items-center gap-2 mb-7 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase' }}
        >
          <ChevronLeft size={13} /> Back to Schedule
        </Link>

        {/* ── SCOREBOARD ── */}
        <div className="rounded-[20px] border border-zinc-200 dark:border-[#1e1e2e] bg-white dark:bg-gradient-to-br dark:from-[#111118] dark:to-[#16161f] p-6 relative overflow-hidden mb-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,#c9a84c09_0%,transparent_65%)] pointer-events-none" />
          <div className="flex justify-center mb-5">
            <span style={{
              fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '4px 14px', borderRadius: 999,
              background: '#c9a84c18', border: '1px solid #c9a84c44', color: '#c9a84c'
            }}>
              {match.status}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 relative">
            <div className="flex flex-col items-center gap-2 flex-1">
              <ShieldBadge />
              <p className="bebas text-xl tracking-wide text-center text-zinc-800 dark:text-white/90">{match.teamA}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-[#555570]">Home</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="score-num text-zinc-800 dark:text-white">{match.scoreA}</span>
                <span className="bebas text-4xl leading-none text-zinc-300 dark:text-white/20">:</span>
                <span className="score-num text-zinc-800 dark:text-white">{match.scoreB}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 dark:text-[#555570]" style={{ fontSize: 11, fontWeight: 700 }}>
                <Clock size={10} />
                <span>{match.time}</span>
                <span className="text-zinc-200 dark:text-[#2e2e44]">·</span>
                <span>{match.date}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <ShieldBadge gold />
              <p className="bebas text-xl tracking-wide text-center text-zinc-800 dark:text-white/90">{match.teamB}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-[#555570]">Away</p>
            </div>
          </div>
        </div>

        {/* ── INFO GRID ── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: <MapPin size={10} />, label: 'Venue', main: match.pitch, sub: 'To be announced' },
            { icon: <Timer size={10} />, label: 'Format', main: `${match.playersPerSide} vs ${match.playersPerSide}`, sub: '30 Min · Split Session' },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-zinc-200 dark:border-[#1e1e2e] bg-white dark:bg-[#111118] p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#c9a84c55] to-transparent" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-[#555570] mb-2 flex items-center gap-1.5">
                {card.icon} {card.label}
              </p>
              <p className="font-black text-sm text-zinc-800 dark:text-white tracking-tight">{card.main}</p>
              <p className="text-[11px] text-zinc-400 dark:text-[#555570] mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex rounded-xl overflow-hidden border border-zinc-200 dark:border-[#1e1e2e] bg-zinc-100 dark:bg-[#0e0e18] mb-5">
          {([
            { id: 'lineup', label: 'Line-up', icon: <Users size={11} /> },
            { id: 'standings', label: 'Standings', icon: <BarChart2 size={11} /> },
          ] as { id: DetailTab; label: string; icon: React.ReactNode }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] transition-all
                ${tab === t.id
                  ? 'bg-[#c9a84c] text-white'
                  : 'text-zinc-400 dark:text-[#555570] hover:text-zinc-600 dark:hover:text-zinc-400'
                }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── LINEUP TAB ── */}
        {tab === 'lineup' && (
          <>
            <div className="flex justify-between items-center mb-1.5 px-0.5">
              <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-200 tracking-wide">
                TBD <span className="text-zinc-400 dark:text-[#555570] font-semibold">· Home</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCapturePitch}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2e] bg-white dark:bg-[#111118] text-zinc-500 dark:text-zinc-400 hover:text-[#c9a84c] hover:border-[#c9a84c44] transition-colors"
                  style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  <Camera size={12} /> Save
                </button>
                <span className="text-[10px] text-zinc-400 dark:text-[#555570]">Attacking ↑</span>
              </div>
            </div>

            <div className="pitch-outer mb-1.5" ref={pitchRef}>
              <div className="pitch-surface">
                <div className="pm pm-border" />
                <div className="pm pm-half" />
                <div className="pm pm-circle" />
                <div className="pm pm-dot" />
                <div className="pm pm-pen-t" />
                <div className="pm pm-pen-b" />
                <div className="pm pm-goal-t" />
                <div className="pm pm-goal-b" />

                {/* Team A top half — 1-1-2-1: GK, DEF, LW+RW, ST */}
                <div className="lineup-half lineup-t">
                  <div className="lineup-row"><PT p={teamAPlayers[0]} t="w" /></div>
                  <div className="lineup-row"><PT p={teamAPlayers[1]} t="w" /></div>
                  <div className="lineup-row" style={{ gap: 140 }}>
                    <PT p={teamAPlayers[2]} t="w" />
                    <PT p={teamAPlayers[3]} t="w" />
                  </div>
                  <div className="lineup-row"><PT p={teamAPlayers[4]} t="w" /></div>
                </div>

                {/* Team B bottom half — 1-1-2-1: ST, LW+RW, DEF, GK */}
                <div className="lineup-half lineup-b">
                  <div className="lineup-row"><PT p={teamBPlayers[4]} t="g" /></div>
                  <div className="lineup-row" style={{ gap: 140 }}>
                    <PT p={teamBPlayers[2]} t="g" />
                    <PT p={teamBPlayers[3]} t="g" />
                  </div>
                  <div className="lineup-row"><PT p={teamBPlayers[1]} t="g" /></div>
                  <div className="lineup-row"><PT p={teamBPlayers[0]} t="g" /></div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 px-0.5">
              <span className="text-[10px] text-zinc-400 dark:text-[#555570]">Attacking ↓</span>
              <span className="text-[11px] font-black text-[#c9a84c] tracking-wide">
                TBD <span className="text-zinc-400 dark:text-[#555570] font-semibold">· Away</span>
              </span>
            </div>

            {/* Substitutes */}
            <SectionDivider label="Substitutes" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-200 dark:border-[#1e1e2e] bg-white dark:bg-[#111118] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400 dark:text-[#888] mb-3">Home Bench</p>
                {teamASubstitutes.map((p) => (
                  <SubRow key={p.number} p={p} variant="home" />
                ))}
              </div>
              <div className="rounded-2xl border border-zinc-200 dark:border-[#1e1e2e] bg-white dark:bg-[#111118] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#c9a84c] mb-3">Away Bench</p>
                {teamBSubstitutes.map((p) => (
                  <SubRow key={p.number} p={p} variant="away" />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── STANDINGS / BRACKET TAB ── */}
        {tab === 'standings' && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-[#555570] mb-5 text-center">
              Road to the Trophy
            </p>

            {/* Bracket layout */}
            <div className="relative flex items-center gap-0">

              {/* Left column — Semi-finals */}
              <div className="flex flex-col gap-5 flex-1">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-[#555570] mb-2 text-center">Semi-Final 1</p>
                  <BracketMatch teamA={bracket.semiFinal1.teamA} teamB={bracket.semiFinal1.teamB} scoreA={bracket.semiFinal1.scoreA} scoreB={bracket.semiFinal1.scoreB} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-[#555570] mb-2 text-center">Semi-Final 2</p>
                  <BracketMatch teamA={bracket.semiFinal2.teamA} teamB={bracket.semiFinal2.teamB} scoreA={bracket.semiFinal2.scoreA} scoreB={bracket.semiFinal2.scoreB} />
                </div>
              </div>

              {/* Connector lines + Trophy */}
              <div className="flex flex-col items-center justify-center w-[80px] shrink-0 self-stretch relative">
                {/* SVG connectors */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 80 200">
                  {/* Left bracket lines from SF1 and SF2 to center */}
                  <path d="M0,50 Q40,50 40,100" stroke="#c9a84c44" strokeWidth="1.5" fill="none" />
                  <path d="M0,150 Q40,150 40,100" stroke="#c9a84c44" strokeWidth="1.5" fill="none" />
                  {/* Right lines from center to Final */}
                  <path d="M40,100 Q80,100 80,100" stroke="#c9a84c44" strokeWidth="1.5" fill="none" />
                </svg>

                {/* Trophy in center */}
                <div className="relative z-10 flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #f0d080, #c9a84c 60%, #a07828)',
                      boxShadow: '0 0 20px #c9a84c55, 0 4px 12px rgba(0,0,0,0.35)'
                    }}
                  >
                    <Trophy size={22} className="text-white drop-shadow" />
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#c9a84c] text-center leading-tight">Grand<br />Final</p>
                </div>
              </div>

              {/* Right column — Final */}
              <div className="flex-1 flex flex-col justify-center">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-[#555570] mb-2 text-center">Final</p>
                  <BracketMatch teamA={bracket.final.teamA} teamB={bracket.final.teamB} scoreA={bracket.final.scoreA} scoreB={bracket.final.scoreB} isFinal />
                </div>
              </div>

            </div>

            {/* Champion slot */}
            <div className="mt-8 rounded-2xl border border-[#c9a84c33] bg-[#c9a84c09] p-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#c9a84c11_0%,transparent_70%)] pointer-events-none" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a84c] mb-1">Champion</p>
              <p className="font-black text-lg text-zinc-700 dark:text-zinc-200 tracking-tight">
                {bracket.winner ?? "—"}
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-[#555570] mt-0.5">
                To be decided · Aug 12, 2026
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] font-bold text-zinc-300 dark:text-[#2e2e44] mt-8 tracking-wide">
          * Final rosters submitted by family heads before kick-off
        </p>

      </div>
    </div>
  );
}

/* ── Sub-components ── */

function SectionDivider({ label }: { label: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px flex-1 bg-zinc-200 dark:bg-gradient-to-r dark:from-[#c9a84c44] dark:to-transparent" />
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-[#555570] flex items-center gap-1.5 whitespace-nowrap">
        {label}
      </p>
      <div className="h-px flex-1 bg-zinc-200 dark:bg-gradient-to-l dark:from-[#c9a84c44] dark:to-transparent" />
    </div>
  );
}

function ShieldBadge({ gold }: { gold?: boolean }) {
  return (
    <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center relative
      ${gold
        ? 'bg-[#c9a84c18] border border-[#c9a84c33]'
        : 'bg-zinc-100 dark:bg-[#e8e8f010] border border-zinc-200 dark:border-[#e8e8f022]'
      }`}
    >
      <Shield size={22} className={gold ? 'text-[#c9a84c55]' : 'text-zinc-300 dark:text-[#e8e8f033]'} />
      <span className={`absolute font-black text-lg ${gold ? 'text-[#c9a84c66]' : 'text-zinc-300 dark:text-[#e8e8f044]'}`}
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}>?</span>
    </div>
  );
}

function PT({ p, t }: { p: { name: string; position: string; number: number }; t: 'w' | 'g' }) {
  return (
    <div className="pt">
      <div className={`pc ${t === 'g' ? 'pc-g' : 'pc-w'}`}>{p.number}</div>
      <span className="pn">{p.name.split(' ')[0]}</span>
      <span className="pp">{p.position}</span>
    </div>
  );
}

function SubRow({ p, variant }: { p: { name: string; position: string; number: number }; variant: 'home' | 'away' }) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-zinc-100 dark:border-[#1a1a26] last:border-b-0 last:pb-0">
      <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[9px] font-black shrink-0 border
        ${variant === 'away'
          ? 'bg-[#c9a84c18] text-[#c9a84c] border-[#c9a84c33]'
          : 'bg-zinc-100 dark:bg-[#e8e8f018] text-zinc-500 dark:text-[#a1a1aa] border-zinc-200 dark:border-[#e8e8f022]'
        }`}>
        {p.number}
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
      <div>
        <p className="text-[12px] font-bold text-zinc-700 dark:text-[#e8e8f0]">{p.name}</p>
        <p className="text-[10px] text-zinc-400 dark:text-[#555570] font-semibold">{p.position}</p>
      </div>
    </div>
  );
}

function BracketMatch({
  teamA, teamB, scoreA, scoreB, isFinal
}: {
  teamA: string; teamB: string;
  scoreA: number | null; scoreB: number | null;
  isFinal?: boolean;
}) {
  return (
    <div className={`rounded-xl border overflow-hidden
      ${isFinal
        ? 'border-[#c9a84c44] bg-[#c9a84c08] dark:bg-[#c9a84c06]'
        : 'border-zinc-200 dark:border-[#1e1e2e] bg-white dark:bg-[#111118]'
      }`}>
      {[{ name: teamA, score: scoreA }, { name: teamB, score: scoreB }].map((team, i) => (
        <div
          key={i}
          className={`flex items-center justify-between px-3 py-2 gap-2
            ${i === 0 ? 'border-b border-zinc-100 dark:border-[#1a1a26]' : ''}`}
        >
          <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-200 truncate">{team.name}</span>
          <span className="text-[13px] font-black text-zinc-400 dark:text-[#555570]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {team.score ?? '—'}
          </span>
        </div>
      ))}
    </div>
  );
}