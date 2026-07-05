# Phase 4 – Enterprise Context Synchronization

## Goal
Upgrade `collectLiveData` to produce a **structured, relevance‑driven** snapshot of the CivicPilot state and adapt the Gemini request flow to inject only the data required for the user’s query while keeping the premium UI untouched.

---

## 1. Files to Modify
| File | Reason |
|------|--------|
| `src/utils/appContextHelper.ts` | Redefine `LiveData` with nested sections (dashboard, complaintAnalysis, predictionCenter, decisionCenter, analytics, notifications, auditLogs, reports). Implement dynamic aggregation logic and limit list sizes (latest 20 complaints, latest 10 notifications, latest 20 audit logs). |
| `src/services/geminiService.ts` | Build a **context selector** that, based on the incoming user prompt, extracts the relevant slices from the `LiveData` object, creates a concise JSON snippet, and prepends a short system prompt. Ensure token budget (<~3000 tokens) by summarising large arrays. |
| Type imports / small helper files | Add missing type definitions (`Report`, `AnalyticsData`, etc.) if they do not exist. |
| `tsconfig.json` (optional) | Ensure strict mode does not break after schema change. |

---

## 2. Detailed `LiveData` Schema (to replace current interface)
```ts
export interface LiveData {
  // Core identifier
  selectedWard: WardData | null;

  /** Dashboard snapshot */
  dashboard: {
    communityHealthScore: number | null;
    riskScore: number | null;
    incidentCount: number;
    activeComplaints: number;
    resolvedComplaints: number;
    selectedWardKPIs: Record<string, unknown>;
  };

  /** Complaint analysis */
  complaintAnalysis: {
    history: ComplaintAnalysis[];          // latest 20 only
    categoryCounts: Record<string, number>;
    severityCounts: Record<string, number>;
    departmentCounts: Record<string, number>;
    latestComplaints: ComplaintAnalysis[]; // same as history (latest 20)
  };

  /** Prediction center */
  predictionCenter: {
    flood: PredictionData | null;
    traffic: PredictionData | null;
    waste: PredictionData | null;
    power: PredictionData | null;
    confidenceValues: Record<string, number>;
    recommendations: Record<string, string>;
  };

  /** Decision center */
  decisionCenter: {
    pumpsDeployed: boolean;
    cleaningCrewsActive: boolean;
    trafficReroutingActive: boolean;
    activeSimulations: number;
    resourceStatus: Record<string, unknown>;
  };

  /** Analytics snapshot */
  analytics: {
    totalComplaints: number;
    topCategories: string[]; // top 5
    topWards: string[];      // top 5
    trendSummary: string;
    searchFilterSummary: string;
  };

  /** Notifications */
  notifications: {
    unreadCount: number;
    latest: Notification[]; // latest 10
  };

  /** Audit logs */
  auditLogs: {
    latestActions: AuditLog[]; // latest 20
    dispatchHistory: AuditLog[]; // filtered subset if needed
    userActions: AuditLog[]; // filtered subset if needed
  };

  /** Reports */
  reports: {
    lastGeneratedReport: string | null; // filename or ID
    executiveSummary: string | null;
    currentReportStats: Record<string, unknown>;
  };
}
```

---

## 3. `collectLiveData` Implementation Steps
1. **Read raw slices** from `localStorage` using the existing `safeParse` helper.
2. **Compute aggregates**:
   - `dashboard.incidentCount` → total complaints marked as `Critical` or `High`.
   - `dashboard.activeComplaints` → complaints where `status !== 'Resolved'`.
   - `dashboard.resolvedComplaints` → count of `status === 'Resolved'`.
   - `dashboard.riskScore` → simple heuristic, e.g., `(incidentCount / totalComplaints) * 100` capped 0‑100.
   - `dashboard.selectedWardKPIs` → pull from a stored key `civicpilot_selectedWardKPIs` if present.
3. **Complaint analysis**:
   - Use the raw complaint array, limit to the latest 20 (sorted by timestamp descending).
   - Reduce to `categoryCounts`, `severityCounts`, `departmentCounts`.
4. **Prediction center**:
   - Load each prediction type (`flood`, `traffic`, `waste`, `power`) from separate keys or a combined object.
   - Extract `confidenceValues` and `recommendations` from the stored prediction payloads.
5. **Decision center** – pull booleans (`pumpsDeployed`, `cleaningActive`, `reroutingActive`) and numeric `activeSimulations`.
6. **Analytics** – compute `totalComplaints`, derive top‑5 categories/wards via simple sorting, and read pre‑computed `trendSummary` and `searchFilterSummary` keys.
7. **Notifications** – latest 10, plus `unreadCount`.
8. **Audit logs** – latest 20 entries, then split into three logical arrays (dispatch, user actions, others) based on a `type` field.
9. **Reports** – read keys `civicpilot_lastReport`, `civicpilot_reportSummary`, `civicpilot_reportStats`.
10. **Graceful fallback** – if a slice is missing, set the field to `null`/`[]` and let the system prompt contain the text **"No live data available."** for that section.

---

## 4. Gemini Service – Context‑Sensitive Prompt Builder
1. **Expose a helper** `buildGeminiContext(userPrompt: string, liveData: LiveData): string`.
2. **Detect intent** using simple keyword matching *only* to decide which sections are needed (this is acceptable because it does not produce a response, just context selection). Example patterns:
   - `/flood|rain|water/` → include `dashboard`, `complaintAnalysis`, `predictionCenter.flood`, `decisionCenter`.
   - `/report|executive/` → include `reports`, `analytics`, `dashboard` summary.
   - `/notification/` → include `notifications`, `auditLogs`.
   - `/overview|city|summary/` → include **all top‑level sections** but with aggregates only.
3. **Create a compact JSON** with `JSON.stringify(selectedSlice, null, 2)`.
4. **Truncate large arrays** (already limited in `collectLiveData`). If the resulting string exceeds ~3000 tokens, further summarise:
   - Replace `history` array with a count and a bullet list of the most recent 5 items (title+status).
   - Replace `notifications` and `auditLogs` with counts + last 3 entries.
5. **System Prompt Template** (kept short):
```
You are CivicPilot One, an AI Chief Decision Officer. Answer using the live data provided. If data is missing, say "No relevant live CivicPilot data is currently available."
LiveData:
<JSON_SNIPPET>
Respond with the following sections exactly:
- Executive Summary
- Current Situation
- Key Problems
- Root Cause Analysis
- Recommended Actions
- Expected Impact
- Confidence Score
```
6. **Pass both system prompt and user prompt** to Gemini in a single request.
7. **Minimal fallback** remains unchanged (missing API key, network, Gemini errors).

---

## 5. Verification Plan
### Automated
- Run `npm run build` – ensure no TS errors.
- Run unit‑like script `node ./scripts/validateLiveData.ts` (we’ll add a quick script) that calls `collectLiveData()` and asserts all top‑level keys exist and arrays are ≤ limits.
### Manual
1. Start dev server (`npm run dev`).
2. In the UI, ask the five test questions:
   - *What are the main problems in the city?*
   - *Which ward requires immediate attention?*
   - *Generate an executive report.*
   - *Show today's complaint summary.*
   - *What resources should be deployed?*
3. Confirm each answer:
   - Contains the required seven sections.
   - Data values (counts, scores, recommendations) match what is stored in `localStorage` (inspect via browser dev tools).
   - No fabricated numbers; missing pieces show the explicit "No relevant live CivicPilot data…” message.
4. Verify token usage (check network payload size in devtools – should be well below Gemini limits).

---

## 6. Open Questions (User Review Required)
> [!IMPORTANT]
> *Do you approve the simple keyword‑based intent detection for context selection?* This is the only place we use lightweight matching to decide which LiveData slices to embed. It does **not** affect answer generation.

---

**Next Steps after Approval**
- Create/modify the files per the plan.
- Update `package.json` scripts if a validation script is added.
- Run the build/dev cycle and perform the manual verification steps.

---

*Implementation will preserve the existing premium UI; all changes are confined to the data‑collection and Gemini‑service layers.*
