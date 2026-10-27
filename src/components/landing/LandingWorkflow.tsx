"use client";

import { useState } from "react";
import { IconArrowRight } from "@/components/ui/Icon";
import { lifecycleStages } from "./landing-data";

export function LandingWorkflow() {
  const [activeStage, setActiveStage] = useState(0);
  const currentStage = lifecycleStages[activeStage];

  return (
    <section
      id="workflow"
      className="w-full py-16 sm:py-20"
      style={{
        backgroundColor: "#f1f5f9",
        borderTop: "1px solid #e2e8f0",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Structured Project Governance
        </h2>
        <p className="text-3xl font-bold tracking-tight text-neutral-900 mt-2">
          The 5-Stage Academic Workflow
        </p>
        <p className="text-sm text-neutral-600 mt-3">
          Standardized milestone phases guiding departments from student onboarding to final viva grade lock.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-2">
          {lifecycleStages.map((stage, idx) => {
            const isSelected = activeStage === idx;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStage(idx)}
                className="w-full text-left p-4 rounded-lg transition-all"
                style={{
                  border: isSelected ? "2px solid #1e3a5f" : "1px solid #e5e7eb",
                  backgroundColor: isSelected ? "#f9fafb" : "#ffffff",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: isSelected ? "#1e3a5f" : "#f3f4f6",
                        color: isSelected ? "#ffffff" : "#6b7280",
                      }}
                    >
                      {stage.step}
                    </span>
                    <h3 className="text-sm font-semibold text-neutral-900">
                      {stage.title}
                    </h3>
                  </div>
                  <IconArrowRight
                    size={14}
                    className={`transition-transform ${isSelected ? "translate-x-1" : "text-neutral-400"}`}
                    style={{ color: isSelected ? "#1e3a5f" : undefined }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2 line-clamp-1">
                  {stage.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7">
          <div
            className="rounded-xl p-6 sm:p-8 bg-white"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "#e5e7eb" }}>
              <div>
                <span className="text-xs font-mono font-semibold" style={{ color: "#1e3a5f" }}>
                  PHASE {currentStage.step}
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mt-0.5">
                  {currentStage.title}
                </h3>
              </div>
              <span
                className="rounded px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: currentStage.preview.badgeType === "approved" ? "#dcfce7" : "#fef3c7",
                  color: currentStage.preview.badgeType === "approved" ? "#15803d" : "#92400e",
                }}
              >
                {currentStage.preview.badge}
              </span>
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed mt-4">
              {currentStage.description}
            </p>

            <div className="mt-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Key Platform Enforcement Rules:
              </p>
              {currentStage.keyPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-700">
                  <span className="mt-0.5 text-green-600 font-bold">✓</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            <div
              className="mt-6 rounded-lg p-4"
              style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
            >
              <p className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                {currentStage.preview.type}
              </p>
              <div className="space-y-2 text-xs">
                {currentStage.preview.rows.map((r, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-neutral-100 last:border-0">
                    <span className="font-medium text-neutral-500">{r.label}</span>
                    <span className="font-semibold text-neutral-800">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
}
