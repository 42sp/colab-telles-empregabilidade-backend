import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";

interface UseBrightdataResult<T = unknown> {
	loading: boolean;
	error: unknown;
	data: T | null;
	get: (
		url: string,
		params?: Record<string, unknown>,
		config?: AxiosRequestConfig
	) => Promise<AxiosResponse<T> | void>;
	post: <D = unknown>(
		url: string,
		data?: D,
		config?: AxiosRequestConfig
	) => Promise<AxiosResponse<T> | void>;
	put: <D = unknown>(
		url: string,
		data?: D,
		config?: AxiosRequestConfig
	) => Promise<AxiosResponse<T> | void>;
	del: (
		url: string,
		config?: AxiosRequestConfig
	) => Promise<AxiosResponse<T> | void>;
	instance: AxiosInstance;
}

export function useBrightdata<T = unknown>(): UseBrightdataResult<T> {
	let loading = false;
	let error = null;
	let data = null;

	async function handleRequest(requestFn: () => Promise<AxiosResponse<T>>) {
		loading = true;
		error = null;
		data = null;
		try {
			const response = await requestFn();
			data = response.data;
			return response;
		} catch (err) {
			error = err;
		} finally {
			loading = false;
		}
	}

	const baseURL = process.env.BRIGHTDATA_URL || undefined;

	if (baseURL === undefined)
		throw new Error("A variável de ambiente BRIGHTDATA URL não está definida.");

	const instance = axios.create({
		baseURL,
	});

	// Adiciona o accessToken do sessionStorage no header Authorization
	instance.interceptors.request.use(config => {
		if (process.env.BRIGHTDATA_TOKEN) {
			config.headers = config.headers || {};
			config.headers["Authorization"] = `Bearer ${process.env.BRIGHTDATA_TOKEN}`;
			config.headers["Content-Type"] = `application/json`;
		}
		else {
			throw new Error("A variável de ambiente BRIGHTDATA TOKEN não está definida.");
		}
		return config;
	});

	const get = (
		url: string,
		params?: Record<string, unknown>,
		config?: AxiosRequestConfig
	) => {
		return handleRequest(() => instance.get<T>(url, { params, ...config }));
	};

	const post = <D = unknown>(
		url: string,
		postData?: D,
		config?: AxiosRequestConfig
	) => {
		return handleRequest(() => instance.post<T>(url, postData, config));
	};

	const put = <D = unknown>(
		url: string,
		putData?: D,
		config?: AxiosRequestConfig
	) => {
		return handleRequest(() => instance.put<T>(url, putData, config));
	};

	const del = (url: string, config?: AxiosRequestConfig) => {
		return handleRequest(() => instance.delete<T>(url, config));
	};

	return { loading, error, data, get, post, put, del, instance };
}
