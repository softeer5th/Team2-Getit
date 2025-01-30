package com.softeer5.uniro_backend.common.utils;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;

public final class Utils {
    private static final GeometryFactory geometryFactory = new GeometryFactory();

    private Utils(){
        // 인스턴스화 방지
    }

    public static Point convertDoubleToPoint(double lat, double lng) {
        return geometryFactory.createPoint(new Coordinate(lat, lng));
    }

    public static String convertDoubleToWTK(double lat, double lng) {
        return String.format("POINT(%f %f)", lat, lng);
    }

}
