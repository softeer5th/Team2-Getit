package com.softeer5.uniro_backend.common.utils;

import org.locationtech.jts.geom.*;
import org.locationtech.jts.io.WKTWriter;

import java.util.List;

public final class GeoUtils {
    private static final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    private GeoUtils(){
        // 인스턴스화 방지
    }

    public static GeometryFactory getInstance(){
        return geometryFactory;
    }

    public static Point convertDoubleToPoint(double lat, double lng) {
        return geometryFactory.createPoint(new Coordinate(lat, lng));
    }

    public static String convertDoubleToPointWTK(double lat, double lng) {
        return String.format("POINT(%f %f)", lat, lng);
    }

    public static LineString convertDoubleToLineString(List<double[]> co){
        if(co==null || co.isEmpty()){
            throw new IllegalArgumentException("coordinates can not be null or empty");
        }

        Coordinate[] coordinates = new Coordinate[co.size()];
        for (int i = 0; i < co.size(); i++) {
            coordinates[i] = new Coordinate(co.get(i)[0], co.get(i)[1]);
        }

        return geometryFactory.createLineString(coordinates);
    }

    public static String convertDoubleToLineStringWTK(List<double[]> co){
        LineString lineString = convertDoubleToLineString(co);
        WKTWriter writer = new WKTWriter();
        return writer.write(lineString);
    }

}
