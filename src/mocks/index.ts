/**
 * Sample data for modules whose API is not deployed yet.
 *
 * A screen falls back to these when its endpoints answer 404 (see
 * `isEndpointUnavailable`) and shows a `SampleDataNotice` above the content, so
 * the UI can be reviewed and signed off before the backend lands. Values are
 * fixed rather than generated: a sample screen has to render identically on the
 * server and the client, and look the same in tomorrow's screenshot.
 *
 * `src/config/pending-integrations.ts` lists what each module still needs.
 */
export * from "./community";
export * from "./comms";
export * from "./commerce";
export * from "./event-ops";
export * from "./finance";
export * from "./promoters";
export * from "./publications";
export * from "./team";
