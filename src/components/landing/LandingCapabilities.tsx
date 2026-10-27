import {
  IconUsers,
  IconFileText,
  IconFlag,
  IconUpload,
  IconSettings,
  IconCheck,
} from "@/components/ui/Icon";
import { capabilities, Capability } from "./landing-data";

function CapabilityIcon({ type }: { type: Capability["iconType"] }) {
  if (type === "users") return <IconUsers size={20} />;
  if (type === "fileText") return <IconFileText size={20} />;
  if (type === "flag") return <IconFlag size={20} />;
  if (type === "upload") return <IconUpload size={20} />;
  if (type === "settings") return <IconSettings size={20} />;
  return <IconCheck size={20} />;
}

export function LandingCapabilities() {
  return (
    <section id="features" className="w-full bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Institutional Excellence
        </h2>
        <p className="text-3xl font-bold tracking-tight text-neutral-900 mt-2">
          Enterprise Grade Capabilities
        </p>
        <p className="text-sm text-neutral-600 mt-3">
          Built on secure relational models, strict access controls, and transparent academic principles.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {capabilities.map((c, i) => (
          <div
            key={i}
            className="rounded-lg p-6 bg-white hover:border-neutral-400 transition-colors"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded mb-4"
              style={{ backgroundColor: "#f3f4f6", color: "#1e3a5f" }}
            >
              <CapabilityIcon type={c.iconType} />
            </div>
            <h3 className="text-base font-bold text-neutral-900">{c.title}</h3>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
}
