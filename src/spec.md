# Specification

## Summary
**Goal:** Make “try again” reliably re-run the most recent deployment after a failure, with correct retry state and clear English UI feedback.

**Planned changes:**
- Add a visible, user-invokable retry control on deployment failure that re-runs the most recently saved deployment attempt without requiring an app reload.
- Ensure retry-in-progress UI state is consistent: disable the retry control during manual retry and show an English “retry running” indicator.
- Fix attempt counter/status text handling so internal retries display accurate attempt X/Y, and manual retries reset counters/state for the new run (no stale values).
- Allow the failure banner to be dismissed, and clear the failed state on dismiss so it does not reappear unless a new failure occurs.
- If a user triggers manual retry with no saved prior attempt, show a clear English message explaining there is nothing to retry and how to proceed, without exposing raw stack traces by default.

**User-visible outcome:** After a deployment fails, the user can click a clear “try again”/retry control to start a new attempt, see accurate attempt/status information during retries, dismiss the failure banner, and receive a clear English message if there is nothing available to retry.
