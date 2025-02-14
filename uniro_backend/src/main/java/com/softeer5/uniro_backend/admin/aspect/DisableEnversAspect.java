package com.softeer5.uniro_backend.admin.aspect;

import static com.softeer5.uniro_backend.common.constant.UniroConst.*;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.softeer5.uniro_backend.admin.setting.RevisionContext;
import com.softeer5.uniro_backend.admin.setting.RevisionType;

@Component
@Aspect
@Order(BEFORE_DEFAULT_ORDER)
public class DisableEnversAspect {
	@Around("@annotation(com.softeer5.uniro_backend.admin.annotation.DisableAudit)")
	public Object disableAudit(ProceedingJoinPoint joinPoint) throws Throwable {
		// 현재 스레드에서 Envers 감사 비활성화
		RevisionContext.setRevisionType(RevisionType.IGNORE);
		try {
			return joinPoint.proceed(); // 트랜잭션 실행
		} finally {
			// 트랜잭션 종료 후 다시 감사 활성화
			RevisionContext.clear();
		}
	}
}

