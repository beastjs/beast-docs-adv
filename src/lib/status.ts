export function getProjectStatus(version: string) {
  return `┌─ BEAST ────────────┐
 │ source   .btsx     │
 │ output   .tsrx     │
 │ runtime  octane    │
 │ status   ${version}    │
 └────────────────────┘`
}
