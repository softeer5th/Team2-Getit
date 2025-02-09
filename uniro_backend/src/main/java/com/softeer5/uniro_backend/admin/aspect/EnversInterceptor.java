package com.softeer5.uniro_backend.admin.aspect;


import org.hibernate.EmptyInterceptor;
import org.hibernate.type.Type;

import java.io.Serializable;

public class EnversInterceptor extends EmptyInterceptor {
	private static final ThreadLocal<Boolean> AUDIT_DISABLED = ThreadLocal.withInitial(() -> false);

	public static void disableAudit() {
		AUDIT_DISABLED.set(true);
	}

	public static void enableAudit() {
		AUDIT_DISABLED.set(false);
	}

	@Override
	public boolean onSave(
		Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types
	) {
		if (AUDIT_DISABLED.get()) {
			return false; // 감사 로깅을 하지 않음
		}
		return super.onSave(entity, id, state, propertyNames, types);
	}

	@Override
	public boolean onFlushDirty(
		Object entity, Serializable id, Object[] currentState, Object[] previousState,
		String[] propertyNames, Type[] types
	) {
		if (AUDIT_DISABLED.get()) {
			return false; // 업데이트 감사를 하지 않음
		}
		return super.onFlushDirty(entity, id, currentState, previousState, propertyNames, types);
	}
}

