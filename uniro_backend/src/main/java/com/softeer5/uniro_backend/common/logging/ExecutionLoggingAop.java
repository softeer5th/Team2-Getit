package com.softeer5.uniro_backend.common.logging;

import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;
import java.util.UUID;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;

@Aspect
@Component
@Log4j2
@Profile("!test")
public class ExecutionLoggingAop {

	private static final ThreadLocal<String> userIdThreadLocal = new ThreadLocal<>();

	@Around("execution(* com.softeer5.uniro_backend..*(..)) "
		+ "&& !within(com.softeer5.uniro_backend.common..*) "
		+ "&& !within(com.softeer5.uniro_backend.resolver..*)")
	public Object logExecutionTrace(ProceedingJoinPoint pjp) throws Throwable {
		String userId = userIdThreadLocal.get();
		if (userId == null) {
			userId = UUID.randomUUID().toString().substring(0, 12);
			userIdThreadLocal.set(userId);
		}

		Object target = pjp.getTarget();
		boolean isController = isRestController(target);

		String className = pjp.getSignature().getDeclaringType().getSimpleName();
		String methodName = pjp.getSignature().getName();
		String task = className + "." + methodName;

		if (isController) {
			logHttpRequest(userId);
		}
		HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
		log.info("✅ [ userId = {} Start] [Call Method] {}: {}", userId, request.getMethod(), task);

		try{
			logParameters(pjp.getArgs());
		}
		catch (Exception e){
			// 로깅 중에 발생한 에러는 무시하고 로깅을 계속 진행
			log.error("🚨🚨🚨 [ userId = {} ] {} 메서드 파라미터 로깅 중 에러 발생 : {} 🚨🚨🚨", userId, task, e.getMessage());
		}
		log.info("");

		StopWatch sw = new StopWatch();
		sw.start();

		Object result;
		try {
			result = pjp.proceed();
		} catch (Exception e) {
			log.warn("[ERROR] [ userId = {} ] {} 메서드 예외 발생 : {}", userId, task, e.getMessage());
			throw e;
		} finally {
			if (isController) {
				userIdThreadLocal.remove();
			}
		}

		sw.stop();
		log.info("[ExecutionTime] {} --> {} (ms)", task, sw.getTotalTimeMillis());
		log.info("🚨 [ userId = {} ] {} End\n", userId, className);

		return result;
	}

	private boolean isRestController(Object target) {
		return Arrays.stream(target.getClass().getDeclaredAnnotations())
			.anyMatch(RestController.class::isInstance);
	}

	private void logParameters(Object[] args) {
		StringBuilder parametersLogMessage = new StringBuilder();

		Arrays.stream(args)
			.forEach(arg -> logCommonTest(arg, "[Parameter]", parametersLogMessage, 0));

		log.info("\n{}", parametersLogMessage.toString());
	}

	private void logCommonTest(Object arg, String requestType, StringBuilder logMessage, int depth) {
		String indent = "  ".repeat(depth); // depth 수준에 따른 들여쓰기

		if (arg == null) {
			logMessage.append(indent).append(requestType).append(" null\n");
			return;
		}

		if (arg instanceof List<?>) {
			logMessage.append(indent).append(requestType).append(" ").append(arg.getClass().getSimpleName()).append("\n");
			List<?> list = (List<?>) arg;
			for (int i = 0; i < list.size(); i++) {
				logCommonTest(list.get(i), "[List Element " + i + "] ", logMessage, depth + 1);
			}
		} else if (isCustomDto(arg)) {
			logMessage.append(indent).append(requestType).append("DTO: ").append(arg.getClass().getSimpleName()).append("\n");
			logObjectFields(arg, logMessage, depth + 1);
		} else if (isEntity(arg)) {
			logMessage.append(indent).append(requestType).append(arg.getClass().getSimpleName()).append(" : ").append("\n");
			logObjectFields(arg, logMessage, depth + 1);
		}
		else {
			logMessage.append(indent).append(requestType).append(" ").append(arg.getClass().getSimpleName()).append(": ").append(arg).append("\n");
		}
	}

	private void logObjectFields(Object object, StringBuilder logMessage, int depth) {
		String indent = "  ".repeat(depth); // depth 기반 들여쓰기
		Arrays.stream(object.getClass().getDeclaredFields()).forEach(field -> {
			try {
				field.setAccessible(true);
				Object value = field.get(object);
				logCommonTest(value, "[Field] " + field.getName(), logMessage, depth + 1);
			} catch (IllegalAccessException e) {
				logMessage.append(indent).append("[Field Access Error] Cannot access field: ").append(field.getName()).append("\n");
			}
		});
	}

	private boolean isCustomDto(Object arg) {
		return arg.getClass().getName().contains("dto"); // 패키지 명에 "dto" 포함 여부로 DTO 판단 (적절히 변경 가능)
	}

	private boolean isEntity(Object arg) {
		return arg.getClass().getName().contains("entity"); // 패키지 명에 "dto" 포함 여부로 DTO 판단 (적절히 변경 가능)
	}

	private void logHttpRequest(String userId) {
		HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

		// HTTP Request 메시지 출력 (RFC 2616 형식)
		StringBuilder httpMessage = new StringBuilder();

		// 1. Start-Line (Request Line)
		String method = request.getMethod();
		String requestURI = request.getRequestURI();
		String httpVersion = "HTTP/1.1"; // 대부분의 요청은 HTTP/1.1 버전 사용
		httpMessage.append(method).append(" ").append(requestURI).append(" ").append(httpVersion).append("\r\n");

		// 2. Field-Lines (Headers)
		Enumeration<String> headerNames = request.getHeaderNames();
		while (headerNames.hasMoreElements()) {
			String headerName = headerNames.nextElement();
			String headerValue = request.getHeader(headerName);
			httpMessage.append(headerName).append(": ").append(headerValue).append("\r\n");
		}

		// 헤더 끝을 나타내는 빈 라인 추가
		httpMessage.append("\r\n");

		// 3. Message Body (있다면 추가)
		if (request.getMethod().equals("POST") || request.getMethod().equals("PUT")) {
			// POST/PUT 메서드인 경우, 메시지 본문이 있을 수 있음
			// 예시로 요청 파라미터를 출력합니다.
			StringBuilder body = new StringBuilder();
			request.getParameterMap().forEach((key, value) -> {
				body.append(key).append("=").append(String.join(",", value)).append("&");
			});

			// 마지막 "&" 제거
			if (body.length() > 0) {
				body.deleteCharAt(body.length() - 1);
				httpMessage.append(body);
			}
		}

		// 요청 메시지 출력
		log.info("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅ New request");
		log.info("[ userId = "+ userId + " ] HTTP Request: \n" + httpMessage);
	}
}