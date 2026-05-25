/** Router location state for Cases workspace left panel visibility. */
export type CasesLocationState = {
  casesPanelOpen?: boolean;
};

export function casesPanelOpenState(): CasesLocationState {
  return { casesPanelOpen: true };
}

export function casesPanelClosedState(): CasesLocationState {
  return { casesPanelOpen: false };
}
