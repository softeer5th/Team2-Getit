interface Coordinate {
	lat: number;
	lng: number;
}

export const HanyangUniversity: Coordinate = {
	lat: 37.558056,
	lng: 127.045833,
};

export const UniversityList: { name: string; img: string }[] = [
	{
		name: "고려대학교",
		img: "고려대학교.svg",
	},
	{
		name: "서울시립대학교",
		img: "서울시립대학교.svg",
	},
	{
		name: "이화여자대학교",
		img: "이화여자대학교.svg",
	},
	{
		name: "인하대학교",
		img: "인하대학교.svg",
	},
	{
		name: "한양대학교",
		img: "한양대학교.svg",
	},
];
