/**
 * Sample data for modules whose API is not deployed yet.
 *
 * A screen falls back to these when its endpoints answer 404 (see
 * `isEndpointUnavailable`), so the UI can be reviewed and signed off before the
 * backend lands. Values are fixed rather than generated: a sample screen has to
 * render identically on the server and the client, and look the same in
 * tomorrow's screenshot.
 *
 * Which screens are running on samples is recorded in one place —
 * `src/config/pending-integrations.ts`, rendered at `/pending-backend` — rather
 * than repeated as a banner on every screen.
 */
export * from "./community";
export * from "./comms";
export * from "./commerce";
export * from "./event-ops";
export * from "./finance";
export * from "./promoters";
export * from "./publications";
export * from "./team";
