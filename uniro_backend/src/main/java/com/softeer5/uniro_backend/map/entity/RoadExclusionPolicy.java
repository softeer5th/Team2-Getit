package com.softeer5.uniro_backend.map.entity;

import static com.softeer5.uniro_backend.common.constant.UniroConst.PEDESTRIAN_SECONDS_PER_MITER;

public enum RoadExclusionPolicy {

    PEDES,
    WHEEL_FAST,
    WHEEL_SAFE;

    public static boolean isAvailableRoute(RoadExclusionPolicy policy, Route route) {
        boolean isCaution = !route.getCautionFactors().isEmpty();
        boolean isDanger = !route.getDangerFactors().isEmpty();
        return switch(policy){
            case PEDES -> !isCaution && !isDanger;
            case WHEEL_FAST -> !isDanger;
            case WHEEL_SAFE -> true;
            default -> false;
        };
    }

    public static Double calculateCost(RoadExclusionPolicy policy, double type, double cost){
        boolean isWheel = (type==PEDESTRIAN_SECONDS_PER_MITER);
        double totalCost = type * cost;
        if(isWheel && policy == PEDES) return null;
        if(!isWheel && policy != PEDES) return null;
        return totalCost;
    }
}
