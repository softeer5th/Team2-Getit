package com.softeer5.uniro_backend.common.utils;

import com.softeer5.uniro_backend.map.entity.Route;

import static com.softeer5.uniro_backend.common.constant.UniroConst.BUILDING_ROUTE_DISTANCE;

public final class RouteUtils {

    private RouteUtils(){
        // 인스턴스화 방지
    }

    public static boolean isBuildingRoute(Route route){
        return route.getDistance() > BUILDING_ROUTE_DISTANCE - 1;
    }
}
