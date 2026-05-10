import type { Specialist } from "../types";

function createSpecialist(name: string, domain: string, finding: string, ventureImpact: string): Specialist {
  return {
    id: crypto.randomUUID(),
    name,
    domain,
    finding,
    ventureImpact,
  };
}

export function allscaleFallback(idea: string): Specialist[] {
  const lower = ` ${idea.toLowerCase()} `;
  const specialists: Specialist[] = [];
  if (lower.includes("health") || lower.includes("medical") || lower.includes("clinic")) {
    specialists.push(
      createSpecialist(
        "HIPAA Compliance Agent",
        "Regulatory",
        "Protected health information exposure must be scoped before pilots.",
        "Compliance constraints may narrow the first workflow but improve enterprise credibility."
      )
    );
  }
  if (lower.includes("fintech") || lower.includes("payment") || lower.includes("bank")) {
    specialists.push(
      createSpecialist(
        "Fintech Compliance Agent",
        "Regulatory",
        "Money movement or regulated financial advice requires controls and auditability.",
        "The MVP should avoid custody and focus on workflow intelligence until licensing is clear."
      )
    );
  }
  if (lower.includes("blockchain") || lower.includes("crypto") || lower.includes("token")) {
    specialists.push(
      createSpecialist(
        "Tokenomics Advisor",
        "Financial",
        "On-chain auditability is useful only if it reduces reconciliation or trust costs.",
        "Lead with verifiable disbursement records rather than speculative token mechanics."
      )
    );
  }
  if (lower.includes("construction") || lower.includes("contractor")) {
    specialists.push(
      createSpecialist(
        "Construction Operations Agent",
        "Operations",
        "Adoption depends on fitting superintendent and project executive routines.",
        "The first wedge should reduce coordination drag without replacing existing project systems."
      )
    );
  }
  if (lower.includes(" ai ") || lower.includes("agent") || lower.includes("model")) {
    specialists.push(
      createSpecialist(
        "AI Safety Agent",
        "Risk",
        "Automated recommendations need human approval and clear confidence boundaries.",
        "Position the system as decision support with traceable evidence, not autonomous execution."
      )
    );
  }
  return specialists;
}

export async function allscaleDetect(idea: string, findings: string[]): Promise<Specialist[]> {
  try {
    const res = await fetch("https://api.allscale.ai/v1/detect-specialists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_ALLSCALE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idea, findings }),
    });
    if (!res.ok) throw new Error("AllScale unavailable");
    return (await res.json()) as Specialist[];
  } catch {
    return allscaleFallback(idea);
  }
}
