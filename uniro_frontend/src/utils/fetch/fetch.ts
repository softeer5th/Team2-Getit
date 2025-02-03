export default function customFetch() {
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

	const post = async () => {};

	const put = () => {};

	return {
		get,
		post,
		put,
	};
}
