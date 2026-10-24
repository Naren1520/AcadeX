import { Metadata } from "next";
import { OnboardingClient } from "./OnboardingClient";

export const metadata: Metadata = { title: "AcadeX — Student Onboarding" };

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <OnboardingClient token={token} />;
}
