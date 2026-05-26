# SBLI address change — sales demo script

Use the **SBLI** dataset with a fresh workspace copy (first mutation forks the readonly seed).

## Path A — Existing seed (Nora Whitfield)

1. Open **Tasks** → pick up `task_ps_addr_001` (Review address change request).
2. Open linked document evidence → **Mark document reviewed** from the request panel (Links tab) if needed.
3. Use **Request info** on the task OR **Request additional info** on the request to move to `Pending info`.
4. **Complete** the task → request becomes `Completed`, client mailing address updates from the submitted form, timeline entries append.

## Path B — Manual intake (no seed IDs)

1. **Requests** → Create request → template **Mailing address change (policy service)**.
2. Select client + policy, enter current/new address, leave **case** empty.
3. Submit → request `In progress` + service task created and linked.
4. Complete the flow as in Path A.

## Acceptance checks

- [ ] No case is required for simple-service address change
- [ ] Pick up / release persists after leaving Tasks
- [ ] Task **Complete** updates request status and client address
- [ ] Request footer actions persist (`Start review`, `Pending info`, `Complete`, `Reject`)
- [ ] System initiated steps visible on request overview
