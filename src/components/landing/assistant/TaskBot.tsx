"use client";

import React, { useEffect, useId, useRef, useState } from "react";

export type BotState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "success"
  | "error";

const GLOW: Record<BotState, string> = {
  idle: "#FFB703",
  listening: "#FFB703",
  speaking: "#38BDF8",
  thinking: "#6EA8FE",
  success: "#4ADE9A",
  error: "#FF6B6B",
};

const LABEL: Record<BotState, string> = {
  idle: "Assistant is ready",
  listening: "Assistant is listening",
  thinking: "Assistant is processing",
  speaking: "Assistant is replying",
  success: "Task completed",
  error: "Something went wrong",
};

const NAVY = "#111f3a";
const NAVY_SOFT = "#1d3159";
const METAL = "#8FA3B8";

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

export interface TaskBotProps {
  /** Drives the face, antenna, arms and chest display. */
  state?: BotState;
  /** Width in px. Height follows the artwork ratio. */
  size?: number;
  /** 0-100. Fills the bar on the chest display and fills the "done" column. */
  progress?: number;
  /** Eyes and head follow the pointer. */
  followCursor?: boolean;
  className?: string;
}

export function TaskBot({
  state = "idle",
  size = 140,
  progress = 0,
  followCursor = true,
  className,
}: TaskBotProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!followCursor) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
        setLook({ x: clamp(dx, -1, 1), y: clamp(dy, -1, 1) });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [followCursor]);

  const glow = GLOW[state] || GLOW.idle;
  const gaze = state === "thinking" ? { x: 0.7, y: -0.8 } : look;
  const ex = gaze.x * 6;
  const ey = gaze.y * 4;
  const tilt = gaze.x * 5;
  const pct = clamp(progress, 0, 100);
  const doneCards = pct >= 100 ? 2 : pct >= 34 ? 1 : 0;
  const ringOn = state === "listening" || state === "thinking";

  const eye = (cx: number) => (
    <g transform={`translate(${cx} 78)`}>
      <g style={{ transform: `translate(${ex}px, ${ey}px)`, transition: "transform .15s ease-out" }}>
        {state === "success" ? (
          <path d="M-9 4 Q0 -10 9 4" stroke={glow} strokeWidth="5" fill="none" strokeLinecap="round" />
        ) : state === "error" ? (
          <path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke={glow} strokeWidth="4.5" strokeLinecap="round" />
        ) : (
          <g className="tb-blink">
            <rect
              x="-8"
              y="-10"
              width="16"
              height="20"
              rx="8"
              fill={glow}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: state === "listening" ? "scale(1.12)" : "scale(1)",
                transition: "transform .2s, fill .25s",
              }}
            />
          </g>
        )}
      </g>
    </g>
  );

  return (
    <div className={`tb-root ${className ?? ""}`} style={{ width: size, height: (size * 232) / 200 }}>
      <style>{CSS}</style>
      <svg
        ref={ref}
        viewBox="0 0 200 232"
        width={size}
        height={(size * 232) / 200}
        role="img"
        aria-label={LABEL[state]}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`${uid}-shell`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F1F6FB" />
            <stop offset="1" stopColor="#C4D2E0" />
          </linearGradient>
          <clipPath id={`${uid}-screen`}>
            <rect x="52" y="50" width="96" height="60" rx="18" />
          </clipPath>
        </defs>

        <ellipse className="tb-shadow" cx="100" cy="224" rx="46" ry="6" fill="rgba(17,31,58,.18)" />

        <g className="tb-bob">
          {/* feet */}
          <rect x="70" y="204" width="22" height="10" rx="5" fill={METAL} />
          <rect x="108" y="204" width="22" height="10" rx="5" fill={METAL} />

          {/* left arm */}
          <g>
            <rect x="34" y="142" width="14" height="38" rx="7" fill={`url(#${uid}-shell)`} />
            <circle cx="41" cy="184" r="7" fill={METAL} />
          </g>

          {/* right arm, raised and waving on success */}
          <g
            className={state === "success" ? "tb-wave" : undefined}
            style={{
              transformOrigin: "159px 146px",
              transform: state === "success" ? "rotate(-145deg)" : "rotate(0deg)",
              transition: "transform .35s ease-out",
            }}
          >
            <rect x="152" y="142" width="14" height="38" rx="7" fill={`url(#${uid}-shell)`} />
            <circle cx="159" cy="184" r="7" fill={METAL} />
          </g>

          {/* body */}
          <rect x="54" y="130" width="92" height="74" rx="22" fill={`url(#${uid}-shell)`} />
          <rect x="88" y="122" width="24" height="10" rx="3" fill={METAL} />

          {/* chest display: a tiny kanban board */}
          <rect x="66" y="142" width="68" height="50" rx="10" fill={NAVY} />
          {[72, 93, 114].map((x) => (
            <rect key={x} x={x} y="148" width="16" height="28" rx="4" fill={NAVY_SOFT} />
          ))}
          <rect x="74" y="151" width="12" height="6" rx="2" fill="#3A5086" />
          <rect x="74" y="160" width="12" height="6" rx="2" fill="#3A5086" />
          <rect x="95" y="151" width="12" height="6" rx="2" fill="#3A5086" />
          {doneCards >= 1 && <rect x="116" y="151" width="12" height="6" rx="2" fill={GLOW.success} />}
          {doneCards >= 2 && <rect x="116" y="160" width="12" height="6" rx="2" fill={GLOW.success} />}
          {state === "thinking" && (
            <rect className="tb-walk" x="74" y="168" width="12" height="6" rx="2" fill={glow} />
          )}
          <rect x="72" y="181" width="56" height="5" rx="2.5" fill={NAVY_SOFT} />
          <rect
            x="72"
            y="181"
            height="5"
            rx="2.5"
            fill={glow}
            width={(56 * pct) / 100}
            style={{ transition: "width .5s ease-out, fill .25s" }}
          />

          {/* head */}
          <g style={{ transformOrigin: "100px 122px", transform: `rotate(${tilt}deg)`, transition: "transform .2s ease-out" }}>
            <g className={state === "error" ? "tb-shake" : undefined}>
              {/* antenna */}
              <line x1="100" y1="40" x2="100" y2="19" stroke={METAL} strokeWidth="4" strokeLinecap="round" />
              <circle
                className={`tb-ring ${ringOn ? "tb-ring-on" : ""}`}
                cx="100"
                cy="14"
                r="6"
                fill="none"
                stroke={glow}
                strokeWidth="2"
              />
              <circle cx="100" cy="14" r="6" fill={glow} style={{ transition: "fill .25s" }} />

              {/* ears light up while listening */}
              <rect x="30" y="68" width="12" height="24" rx="5" fill={state === "listening" ? glow : METAL} style={{ transition: "fill .2s" }} />
              <rect x="158" y="68" width="12" height="24" rx="5" fill={state === "listening" ? glow : METAL} style={{ transition: "fill .2s" }} />

              <rect x="40" y="38" width="120" height="84" rx="28" fill={`url(#${uid}-shell)`} />
              <rect x="52" y="50" width="96" height="60" rx="18" fill={NAVY} />
              <rect x="52" y="50" width="96" height="60" rx="18" fill="none" stroke={glow} strokeOpacity=".35" style={{ transition: "stroke .25s" }} />

              {state === "thinking" && (
                <g clipPath={`url(#${uid}-screen)`}>
                  <rect className="tb-scan" x="52" y="50" width="14" height="60" fill={glow} opacity=".18" />
                </g>
              )}

              {eye(80)}
              {eye(120)}

              {/* mouth */}
              {state === "speaking" && (
                <g>
                  {[0, 1, 2, 3].map((i) => (
                    <rect
                      key={i}
                      className="tb-bar"
                      x={88 + i * 7}
                      y="94"
                      width="4"
                      height="12"
                      rx="2"
                      fill={glow}
                      style={{ animationDelay: `${i * 0.12}s`, animationDuration: `${0.45 + i * 0.08}s` }}
                    />
                  ))}
                </g>
              )}
              {state === "thinking" && (
                <g>
                  {[91, 100, 109].map((x, i) => (
                    <circle key={x} className="tb-dot" cx={x} cy="100" r="2.6" fill={glow} style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </g>
              )}
              {(state === "idle" || state === "listening") && (
                <path d="M92 98 Q100 103 108 98" stroke={glow} strokeWidth="3" fill="none" strokeLinecap="round" />
              )}
              {state === "success" && (
                <path d="M88 95 Q100 110 112 95 Z" fill={glow} stroke={glow} strokeWidth="2" strokeLinejoin="round" />
              )}
              {state === "error" && (
                <path d="M91 101 Q95.5 96 100 101 T109 101" stroke={glow} strokeWidth="3" fill="none" strokeLinecap="round" />
              )}
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

const CSS = `
.tb-root{display:inline-block;line-height:0;user-select:none}
.tb-blink{transform-box:fill-box;transform-origin:center}
.tb-ring{transform-box:fill-box;transform-origin:center;opacity:0}
.tb-bar{transform-box:fill-box;transform-origin:center}
.tb-shadow{transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion:no-preference){
  .tb-bob{animation:tb-bob 3.2s ease-in-out infinite}
  .tb-shadow{animation:tb-shadow 3.2s ease-in-out infinite}
  .tb-blink{animation:tb-blink 5s infinite}
  .tb-ring-on{animation:tb-ring 1.4s ease-out infinite}
  .tb-bar{animation:tb-bar .5s ease-in-out infinite alternate}
  .tb-dot{animation:tb-dot 1s ease-in-out infinite}
  .tb-scan{animation:tb-scan 1.6s ease-in-out infinite alternate}
  .tb-walk{animation:tb-walk 2.4s ease-in-out infinite}
  .tb-wave{animation:tb-wave .7s ease-in-out infinite alternate}
  .tb-shake{animation:tb-shake .5s ease-in-out 1}
}
@keyframes tb-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes tb-shadow{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.9);opacity:.7}}
@keyframes tb-blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}
@keyframes tb-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(3);opacity:0}}
@keyframes tb-bar{from{transform:scaleY(.3)}to{transform:scaleY(1)}}
@keyframes tb-dot{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-3px);opacity:1}}
@keyframes tb-scan{from{transform:translateX(0)}to{transform:translateX(82px)}}
@keyframes tb-walk{0%,10%{transform:translateX(0)}40%,55%{transform:translateX(21px)}85%,100%{transform:translateX(42px)}}
@keyframes tb-wave{from{transform:rotate(-135deg)}to{transform:rotate(-165deg)}}
@keyframes tb-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
`;

export default TaskBot;
