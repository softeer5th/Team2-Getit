package com.softeer5.uniro_backend.admin.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditDisableAspect {
	@Around("@annotation(DisableAudit)")
	public Object disableAudit(ProceedingJoinPoint joinPoint) throws Throwable {
		EnversInterceptor.disableAudit();
		try {
			return joinPoint.proceed();
		} finally {
			EnversInterceptor.enableAudit();
		}
	}
}

