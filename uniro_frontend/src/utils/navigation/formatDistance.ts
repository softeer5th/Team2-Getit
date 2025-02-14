export const formatDistance = (distance: number) => {
	if (distance < 1) {
		return `${Math.ceil(distance * 1000) / 1000}m`;
	}

	if (distance < 1000) {
		return `${Math.ceil(distance)}m`;
	}

	return distance >= 1000
		? `${(distance / 1000).toFixed(1)} km` // 1000m 이상이면 km 단위로 변환
		: `${distance} m`; // 1000m 미만이면 m 단위 유지
};
