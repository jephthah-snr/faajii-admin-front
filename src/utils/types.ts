export interface FilterItem {
  title: string;
  apiKey: string;
  default?: string;
  items?: string[];
  isDate?: boolean;
  transform?: (value: any) => any;
}
