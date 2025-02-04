package com.softeer5.uniro_backend.admin.aspect;

import com.softeer5.uniro_backend.admin.annotation.RevisionOperation;
import com.softeer5.uniro_backend.admin.entity.RevisionOperationType;
import com.softeer5.uniro_backend.admin.setting.RevisionContext;
import com.softeer5.uniro_backend.route.dto.PostRiskReqDTO;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Order(-1)
public class RevisionOperationAspect {

    @Around("@annotation(revisionOperation)")
    public Object around(ProceedingJoinPoint joinPoint, RevisionOperation revisionOperation) throws Throwable {
        RevisionOperationType opType = revisionOperation.value();

        Object result;
        switch (opType) {
            case UPDATE_RISK -> result = updateRiskHandler(joinPoint);
            default -> result = joinPoint.proceed();
        }

        return result;
    }

    private Object updateRiskHandler(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        Long univId = null;
        String action = null;
        for (int i = 0; i < args.length; i++) {
            if (args[i] instanceof Long && "univId".equals(parameterNames[i])) {
                univId = (Long) args[i];
            }
            else if(args[i] instanceof PostRiskReqDTO postRiskReqDTO){
                int cautionSize = postRiskReqDTO.getCautionTypes().size();
                int dangerSize = postRiskReqDTO.getDangerTypes().size();

                if (cautionSize > 0) {
                    action = "주의요소 업데이트";
                } else if (dangerSize > 0) {
                    action = "위험요소 업데이트";
                } else {
                    action = "위험/주의요소 해제";
                }
            }
        }
        RevisionContext.setUnivId(univId);
        RevisionContext.setAction(action);
        try{
            return joinPoint.proceed();
        }
        finally {
            RevisionContext.clear();
        }
    }

}
