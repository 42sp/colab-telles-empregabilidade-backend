import type { AxiosInstance } from "axios";
import type * as collection from "../index";
import { mockedSearchKeywordResponse, mockedSearchLinkedInResponse } from "./mocks";

export default class Service {
	$brightdata: AxiosInstance;

	constructor($brightdata: AxiosInstance) {
		this.$brightdata = $brightdata;
	}

	// -------------------------------------------------------------------- GET --------------------------------------------------------------------
	// -------------------------------------------------------------------- GET --------------------------------------------------------------------

	// -------------------------------------------------------------------- POST --------------------------------------------------------------------
	async searchGlassdoorKeyword(data: collection.GlassdoorParameters, accessToken: string, password?: string)
	{
		try
		{
			let params = "";

			if (process.env.BRIGHTDATA_ENDPOINT && process.env.BRIGHTDATA_GRASSDOOR_DATASET_ID)
			{
				params = `?dataset_id=${process.env.BRIGHTDATA_GRASSDOOR_DATASET_ID}&endpoint=${process.env.BRIGHTDATA_ENDPOINT}&auth_header=${accessToken}&format=json&uncompressed_webhook=true&include_errors=true&type=discover_new&discover_by=keyword&limit_per_input=1`;
			}
			// console.log("searchKeyword", params, data);
			console.log("searchKeyword", accessToken);
			if (password == "monkey")
			{
				const response = await this.$brightdata.post(`/datasets/v3/trigger${params}`, data);
				return response.data;
			}
			// return mockedSearchKeywordResponse;
			return { snapshot_id: "s_mf066fzy1w3p6knufp", type: "Mocked" }
		}
		catch (error)
		{
			console.error("Error searching keyword:", error);
		}
	}

	async searchLinkedIn(data: collection.SearchLinkedIn, accessToken: string)
	{
		try
		{
			let params = "";

			if (
				process.env.BRIGHTDATA_LIKEDIN_DATASET_ID
				&& process.env.BRIGHTDATA_ENDPOINT
			)
			{
				params = `?dataset_id=${process.env.BRIGHTDATA_LIKEDIN_DATASET_ID}`;
				params += '&include_errors=true';
				params += `&endpoint=${process.env.BRIGHTDATA_ENDPOINT}`;
				params += `&auth_header=${accessToken}`;
				params += '&format=json';
				params += '&uncompressed_webhook=true';
			}

			console.log(params)

			const response = await this.$brightdata.post(`/datasets/v3/trigger${params}`, data.urls);

			console.log(response.data);

			return response;
		}
		catch (error)
		{
			console.error("Error searching LinkedIn:", error);
		}
	}
	// -------------------------------------------------------------------- POST --------------------------------------------------------------------

	// -------------------------------------------------------------------- PUT --------------------------------------------------------------------
	// -------------------------------------------------------------------- PUT --------------------------------------------------------------------

	// -------------------------------------------------------------------- DELETE --------------------------------------------------------------------
	// -------------------------------------------------------------------- DELETE --------------------------------------------------------------------
}
