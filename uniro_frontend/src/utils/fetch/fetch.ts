import { BadRequestError, NotFoundError, UnProcessableError } from "../../constant/error";

export default function Fetch() {
	const baseURL = import.meta.env.VITE_REACT_SERVER_BASE_URL;

	const get = async <T>(url: string, params?: Record<string, string | number | boolean>): Promise<T> => {
		console.log("GET : ", url);

		const paramsURL = new URLSearchParams(
			Object.entries(params || {}).map(([key, value]) => [key, String(value)]),
		).toString();

		const response = await fetch(`${baseURL}${url}?${paramsURL}`, {
			method: "GET",
		});

		if (!response.ok) {
			if (response.status === 400) {
				throw new BadRequestError("Bad Request");
			} else if (response.status === 404) {
				throw new NotFoundError("Not Found");
			} else if (response.status === 422) {
				throw new UnProcessableError("UnProcessable");
			} else {
				throw new Error("UnExpected Error");
			}
		}

		return response.json();
	};

	const post = async <T = boolean, K = unknown>(
		url: string,
		body?: Record<string, K | K[]>,
	): Promise<T | boolean> => {
		console.log("POST : ", url);

		const response = await fetch(`${baseURL}${url}`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			if (response.status === 400) {
				throw new BadRequestError("Bad Request");
			} else if (response.status === 404) {
				throw new NotFoundError("Not Found");
			} else {
				throw new Error("UnExpected Error");
			}
		}

		const text = await response.text();

		return text.length > 0 ? (JSON.parse(text) as T) : response.ok;
	};

	const put = async <T, K>(url: string, body?: Record<string, K>): Promise<T> => {
		const response = await fetch(`${baseURL}${url}`, {
			method: "PUT",
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			throw new Error(`${response.status}-${response.statusText}`);
		}

		return response.json();
	};

	return {
		get,
		post,
		put,
	};
}

const { get, post, put } = Fetch();
export { get as getFetch, post as postFetch, put as putFetch };
