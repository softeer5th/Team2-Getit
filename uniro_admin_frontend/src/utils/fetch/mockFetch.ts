export function mockRealisticFetch<T>(
	data: T,
	minDelay: number = 1000,
	maxDelay: number = 4000,
	failRate: number = 0.2,
): Promise<T> {
	const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
	const shouldFail = Math.random() < failRate;

	return new Promise((resolve, reject) => {
		console.log(`${delay / 1000}초 동안 로딩 중...`);

		setTimeout(() => {
			if (shouldFail) {
				console.error("네트워크 오류 발생!");
				reject(new Error("네트워크 오류 발생"));
			} else {
				console.log("데이터 로드 완료:", data);
				resolve(data);
			}
		}, delay);
	});
}

export const getMockTest = async () => {
	return mockRealisticFetch({ message: "Hello from Mock API" });
};
