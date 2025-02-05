package com.softeer5.uniro_backend.admin.annotation;

import com.softeer5.uniro_backend.admin.entity.RevisionOperationType;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RevisionOperation {
    RevisionOperationType value() default RevisionOperationType.DEFAULT;
}
