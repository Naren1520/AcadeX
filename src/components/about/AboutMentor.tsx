import Image from "next/image";
import { IconLinkedIn } from "@/components/ui/Icon";
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
              <Image
                src={mentorData.image || "/images/team/image.png"}
                alt={mentorData.name}
                fill
                sizes="(max-width: 640px) 96px, 112px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <span
                className="inline-block rounded px-2.5 py-0.5 text-xs font-semibold text-white mb-2"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                {mentorData.role}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
                {mentorData.name}
              </h3>
              <p className="text-sm sm:text-base font-semibold mt-0.5" style={{ color: "#1e3a5f" }}>
                {mentorData.designation}
              </p>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {mentorData.department} • {mentorData.institution}
              </p>
            </div>
          </div>

          {mentorData.linkedin && (
            <a
              href={mentorData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-white hover:bg-[#0a66c2] transition-colors shrink-0"
              style={{ border: "1px solid #e5e7eb" }}
              title="LinkedIn Profile"
              aria-label={`${mentorData.name} LinkedIn`}
            >
              <IconLinkedIn size={15} />
              <span>Connect on LinkedIn</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
