import Image from "next/image";
import { mentorData } from "./about-data";

export function AboutMentor() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Faculty Supervision
        </p>
        <h2 className="text-2xl font-bold text-neutral-900 mt-1">Project Mentorship</h2>
      </div>

      <div
        className="rounded-xl p-6 sm:p-7 bg-white"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-5 border-b border-neutral-100">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
              <Image
                src={mentorData.image || "/images/team/image.png"}
                alt={mentorData.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div>
              <span
                className="inline-block rounded px-2.5 py-0.5 text-xs font-semibold text-white mb-1.5"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                {mentorData.role}
              </span>
              <h3 className="text-xl font-bold text-neutral-900">{mentorData.name}</h3>
              <p className="text-sm font-semibold mt-0.5" style={{ color: "#1e3a5f" }}>
                {mentorData.designation}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {mentorData.department} • {mentorData.institution}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          {mentorData.description}
        </p>
      </div>
    </section>
  );
}
