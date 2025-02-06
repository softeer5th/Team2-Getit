package com.softeer5.uniro_backend.common.logging;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.Enumeration;
import java.util.Objects;
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
		+ "&& !within(com.softeer5.uniro_backend.resolver..*) "
	)
	public Object logExecutionTrace(ProceedingJoinPoint pjp) throws Throwable {
		// 요청에서 userId 가져오기 (ThreadLocal 사용)
		String userId = userIdThreadLocal.get();
		if (userId == null) {
			userId = UUID.randomUUID().toString().substring(0, 12);
			userIdThreadLocal.set(userId);
		}

		Object target = pjp.getTarget();
		Annotation[] declaredAnnotations = target.getClass().getDeclaredAnnotations();

		for(Annotation annotation : declaredAnnotations){
			if(annotation instanceof RestController){
				logHttpRequest(userId);
			}
		}

		HttpServletRequest request = ((ServletRequestAttributes)RequestContextHolder.currentRequestAttributes()).getRequest();
		RequestMethod httpMethod = RequestMethod.valueOf(request.getMethod());

		String className = pjp.getSignature().getDeclaringType().getSimpleName();
		String methodName = pjp.getSignature().getName();
		String task = className + "." + methodName;

		log.info("");
		log.info("🚨 [ userId = {} ] {} Start", userId, className);
		log.info("[ userId = {} ] [Call Method] {}: {}", userId, httpMethod, task);

		Object[] paramArgs = pjp.getArgs();
		for (Object object : paramArgs) {
			if (Objects.nonNull(object)) {
				log.info("[Parameter] {} {}", object.getClass().getSimpleName(), object);

				String packageName = object.getClass().getPackage().getName();
				if (packageName.contains("java")) {
					break;
				}

				Field[] fields = object.getClass().getDeclaredFields();
				for (Field field : fields) {
					field.setAccessible(true);
					try {
						Object value = field.get(object);
						log.info("[Field] {} = {}", field.getName(), value);
					} catch (IllegalAccessException e) {
						log.warn("[Field Access Error] Cannot access field: {}", field.getName());
					}
				}
			}
		}

		StopWatch sw = new StopWatch();
		sw.start();

		Object result = null;
		try {
			result = pjp.proceed();
		} catch (Exception e) {
			log.warn("[ERROR] [ userId = {} ] {} 메서드 예외 발생 : {}", userId, task, e.getMessage());
			throw e;
		} finally {
			// Controller 클래스일 때만 ThreadLocal 값 삭제
			for(Annotation annotation : declaredAnnotations){
				if(annotation instanceof RestController){
					userIdThreadLocal.remove();
				}
			}
		}

		sw.stop();
		long executionTime = sw.getTotalTimeMillis();

		log.info("[ExecutionTime] {} --> {} (ms)", task, executionTime);
		log.info("🚨 [ userId = {} ] {} End", userId, className);
		log.info("");

		return result;
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