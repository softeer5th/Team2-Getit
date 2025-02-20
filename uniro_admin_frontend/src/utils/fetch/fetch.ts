export default function Fetch() {
	const baseURL = import.meta.env.VITE_REACT_SERVER_BASE_URL;

	const get = async <T>(
		url: string,
		params?: Record<string, string | number | boolean>,
		token?: string,
	): Promise<T> => {
		const paramsURL = new URLSearchParams(
			Object.entries(params || {}).map(([key, value]) => [key, String(value)]),
		).toString();

		const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await fetch(`${baseURL}${url}?${paramsURL}`, {
			method: "GET",
			headers: headers,
		});

		if (!response.ok) {
			throw new Error(`${response.status}-${response.statusText}`);
		}
		return response.json();
	};

	const post = async <T, K>(url: string, body?: Record<string, K | K[]>): Promise<T> => {
		const response = await fetch(`${baseURL}${url}`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`${response.status}-${response.statusText}`);
		}

		try {
			const res = await response.json();

			return res;
		} catch (err) {
			if (err instanceof SyntaxError) {
				return true as T;
			}
		}

		return response.json();
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

	const patch = async <T, K>(url: string, body?: Record<string, K>, token?: string): Promise<boolean> => {
		const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await fetch(`${baseURL}${url}`, {
			method: "PATCH",
			body: JSON.stringify(body),
			headers: headers,
		});

		if (!response.ok) {
			const res = await response.json();
			throw new Error(`${response.status}-${response.statusText}`);
		}

		return true;
	};

	return {
		get,
		post,
		put,
		patch,
	};
}

const { get, post, put, patch } = Fetch();
export { get as getFetch, post as postFetch, put as putFetch, patch as patchFetch };
