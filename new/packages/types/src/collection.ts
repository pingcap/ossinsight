/** Collection definition (YAML config format) */
export interface CollectionConfig {
  id: number;
  name: string;
  items: string[];
}

/** Collection as stored in DB */
export interface Collection {
  id: number;
  name: string;
  past_month_visits?: number;
  created_at?: Date;
  updated_at?: Date;
}

/** Collection item as stored in DB */
export interface CollectionItem {
  collection_id: number;
  repo_id: number;
  repo_name: string;
}
