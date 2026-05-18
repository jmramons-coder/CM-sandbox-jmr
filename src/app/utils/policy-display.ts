/** Single subtitle line for policy listbox rows (product / plan, no policy id). */
export function formatPolicyListSubtitle(policy: {
  product?: string;
  planName?: string;
  label?: string;
}): string | undefined {
  const line = [policy.product, policy.planName].filter(Boolean).join(' · ').trim();
  if (!line) return undefined;
  if (policy.label && line === policy.label) return undefined;
  return line;
}
