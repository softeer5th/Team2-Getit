package com.softeer5.uniro_backend.route.entity;

public enum DirectionType {
    STRAIGHT, // 직진
    RIGHT, // 우회전
    LEFT,  // 좌회전
    SHARP_RIGHT, // 큰 우회전
    SHARP_LEFT, // 큰 좌회전
    FINISH, // 도착점
    CAUTION; //위험요소
}
