import Image from "next/image";
import { IconGitHub, IconLinkedIn, IconGlobe } from "@/components/ui/Icon";
import { teamMembers } from "./about-data";

export function AboutTeam() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Student Engineering Team
        </p>
        <h2 className="text-2xl font-bold text-neutral-900 mt-1">
          Project Developers
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          5th Semester Information Science &amp; Engineering (Section B)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamMembers.map((member) => (
          <div
            key={member.name}
            className="rounded-xl bg-white p-5 flex flex-col justify-between transition-colors hover:border-neutral-400"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div>
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 mb-4 border border-neutral-200">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                  priority={member.isLead}
                />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-neutral-900 text-base">{member.name}</h3>
                {member.isLead && (
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-bold text-white shrink-0 uppercase tracking-wider"
                    style={{ backgroundColor: "#1e3a5f" }}
                  >
                    Lead
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-neutral-500">{member.role}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-100">
              {member.socials ? (
                <div className="flex items-center gap-2">
                  {member.socials.github && (
                    <a
                      href={member.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded text-neutral-600 hover:text-white hover:bg-neutral-900 transition-colors"
                      style={{ border: "1px solid #e5e7eb" }}
                      title="GitHub Profile"
                      aria-label={`${member.name} GitHub`}
                    >
                      <IconGitHub size={15} />
                    </a>
                  )}

                  {member.socials.linkedin && (
                    <a
                      href={member.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded text-neutral-600 hover:text-white hover:bg-[#0a66c2] transition-colors"
                      style={{ border: "1px solid #e5e7eb" }}
                      title="LinkedIn Profile"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <IconLinkedIn size={15} />
                    </a>
                  )}

                  {member.socials.portfolio && (
                    <a
                      href={member.socials.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded text-neutral-600 hover:text-white hover:bg-[#1e3a5f] transition-colors"
                      style={{ border: "1px solid #e5e7eb" }}
                      title="Portfolio Website"
                      aria-label={`${member.name} Portfolio`}
                    >
                      <IconGlobe size={15} />
                    </a>
                  )}
                </div>
              ) : (
                <span className="text-[11px] text-neutral-400">
                  ISE Dept • Section B
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
