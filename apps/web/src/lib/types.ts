export interface StatusMeta {
  label: string;
  /** Higher means worse; used to sort the dashboard. */
  severity: number;
  dotClass: string;
  badgeClass: string;
}
