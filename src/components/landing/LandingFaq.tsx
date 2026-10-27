"use client";

import { useState } from "react";
import { IconChevronUpDown } from "@/components/ui/Icon";
import { faqs } from "./landing-data";

export function LandingFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full bg-white py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Platform Clarifications
        </h2>
        <p className="text-3xl font-bold tracking-tight text-neutral-900 mt-2">
          Frequently Asked Questions
        </p>
        <p className="text-sm text-neutral-600 mt-2">
          Common questions about platform operation, rules, and institutional deployment.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((f, i) => {
          const isOpen = openFaq === i;
          return (
            <div
              key={i}
              className="rounded-lg transition-colors overflow-hidden"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                <span>{f.q}</span>
                <IconChevronUpDown size={14} className="text-neutral-400" />
              </button>
              {isOpen && (
                <div
                  className="px-4 pb-4 pt-1 text-xs text-neutral-600 leading-relaxed border-t"
                  style={{ borderColor: "#f3f4f6", backgroundColor: "#f9fafb" }}
                >
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
}
