export interface GlassdoorInput {
	search_url: string;
	max_search_results: number;
}

export interface GlassdoorParameters {
	input: Array<GlassdoorInput>;
	custom_output_fields: Array<string>;
}

export interface GlassdoorResponse {
	snapshot_id: string;
}