package com.softeer5.uniro_backend.admin.jwt;

public class SecurityContext {
	private static final ThreadLocal<Long> univIdHolder = new ThreadLocal<>();

	public static void setUnivId(Long univId) {
		univIdHolder.set(univId);
	}

	public static Long getUnivId() {
		return univIdHolder.get();
	}

	public static void clear() {
		univIdHolder.remove();
	}
}

