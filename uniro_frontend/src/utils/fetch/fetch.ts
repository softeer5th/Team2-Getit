export default function Fetch() {
	const baseURL = import.meta.env.VITE_REACT_SERVER_BASE_URL;

	const get = async <T>(url: string, params?: Record<string, string | number | boolean>): Promise<T> => {
		const paramsURL = new URLSearchParams(
			Object.entries(params || {}).map(([key, value]) => [key, String(value)]),
		).toString();

		const response = await fetch(`${baseURL}${url}?${paramsURL}`, {
			method: "GET",
		});

		if (!response.ok) {
			throw new Error(`${response.status}-${response.statusText}`);
		}

		return response.json();
	};

	const post = async <T, K>(url: string, body?: Record<string, K | K[]>): Promise<boolean> => {
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

		return response.ok;
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
