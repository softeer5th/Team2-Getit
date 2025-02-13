package com.softeer5.uniro_backend.common.logging;

import java.util.List;

public enum ArgType {
	NULL,
	LIST,
	CUSTOM_DTO,
	ENTITY,
	OTHER;

	public static ArgType getArgType(Object arg) {
		if (arg == null) {
			return NULL;
		} else if (arg instanceof List<?>) {
			return LIST;
		} else if (isCustomDto(arg)) {
			return CUSTOM_DTO;
		} else if (isEntity(arg)) {
			return ENTITY;
		} else {
			return OTHER;
		}
	}

	private static boolean isCustomDto(Object arg) {
		return arg.getClass().getName().contains("dto");
	}

	private static boolean isEntity(Object arg) {
		return arg.getClass().getName().contains("entity");
	}
}

