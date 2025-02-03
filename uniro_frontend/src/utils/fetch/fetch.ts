export default function Fetch() {
	const baseURL = import.meta.env.VITE_REACT_SERVER_BASE_URL;

	const get = async (url: string, params?: Record<string, any>): Promise<any> => {
		const paramsURL = new URLSearchParams(params).toString();
		const response = await fetch(`${baseURL}${url}?${paramsURL}`, {
			method: "GET",
		});

		if (!response.ok) {
			throw new Error(`${response.status}-${response.statusText}`);
		}

		return response.json();
	};

	const post = async (url: string, body?: Record<string, any>): Promise<any> => {
		const response = await fetch(`${baseURL}${url}`, {
			method: "POST",
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			throw new Error(`${response.status}-${response.statusText}`);
		}

		return response.json();
	};

	const put = async () => {};

	return {
		get,
		post,
		put,
	};
}
