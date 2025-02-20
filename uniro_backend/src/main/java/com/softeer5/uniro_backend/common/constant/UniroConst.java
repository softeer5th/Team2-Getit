package com.softeer5.uniro_backend.common.constant;

public final class UniroConst {
	public static final String NODE_KEY_DELIMITER = " ";
	public static final int CORE_NODE_CONDITION = 3;
	public static final int BEFORE_DEFAULT_ORDER = -1;
	public static final double PEDESTRIAN_SECONDS_PER_MITER = 1.2;
	public static final double MANUAL_WHEELCHAIR_SECONDS_PER_MITER = 2.5;
	public static final double ELECTRIC_WHEELCHAIR_SECONDS_PER_MITER = 1.0;
	public static final double EARTH_RADIUS = 6378137;
	public static final double BUILDING_ROUTE_DISTANCE = 1e8;
	public static final int IS_SINGLE_ROUTE = 2;
	public static final double HEURISTIC_WEIGHT_NORMALIZATION_FACTOR = 10.0;
	public static final int STREAM_FETCH_SIZE = 2500;
	//컴파일 상수를 보장하기 위한 코드
	public static final String STREAM_FETCH_SIZE_AS_STRING = "" + STREAM_FETCH_SIZE;

	public static final int CREATE_ROUTE_LIMIT_COUNT = 2000;
}
