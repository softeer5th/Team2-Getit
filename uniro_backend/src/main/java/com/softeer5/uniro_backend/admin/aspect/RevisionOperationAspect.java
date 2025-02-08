package com.softeer5.uniro_backend.admin.aspect;

import com.softeer5.uniro_backend.admin.annotation.RevisionOperation;
import com.softeer5.uniro_backend.admin.entity.RevisionOperationType;
import com.softeer5.uniro_backend.admin.setting.RevisionContext;
import com.softeer5.uniro_backend.node.dto.request.CreateBuildingNodeReqDTO;
import com.softeer5.uniro_backend.route.dto.request.PostRiskReqDTO;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import static com.softeer5.uniro_backend.common.constant.UniroConst.*;

@Aspect
@Component
@Order(BEFORE_DEFAULT_ORDER)
public class RevisionOperationAspect {

    @Around("@annotation(revisionOperation)")
    public Object around(ProceedingJoinPoint joinPoint, RevisionOperation revisionOperation) throws Throwable {
        RevisionOperationType opType = revisionOperation.value();

        Object result;
        switch (opType) {
            case UPDATE_RISK -> result = updateRiskHandler(joinPoint);
            case CREATE_ROUTE -> result = updateRouteHandler(joinPoint);
            case CREATE_BUILDING_NODE -> result = createBuildingNodeHandler(joinPoint);
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

    private Object updateRouteHandler(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

		Long univId = null;
		String action = "새로운 길 추가";

        for (int i = 0; i < args.length; i++) {
            if (args[i] instanceof Long && "univId".equals(parameterNames[i])) {
                univId = (Long) args[i];
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

    private Object createBuildingNodeHandler(ProceedingJoinPoint joinPoint) throws Throwable {
        Object[] args = joinPoint.getArgs();

        Long univId = null;
        String action = "빌딩 노드 추가";

        for (int i = 0; i < args.length; i++) {
            if (args[i] instanceof CreateBuildingNodeReqDTO createBuildingNodeReqDTO) {
                univId = createBuildingNodeReqDTO.getUnivId();
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
