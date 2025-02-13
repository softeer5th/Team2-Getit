package com.softeer5.uniro_backend.admin.interceptor;

import com.softeer5.uniro_backend.admin.jwt.JwtTokenProvider;
import com.softeer5.uniro_backend.admin.jwt.SecurityContext;
import com.softeer5.uniro_backend.common.exception.custom.AdminException;
import com.softeer5.uniro_backend.common.error.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.stereotype.Component;

@Component
public class JwtInterceptor implements HandlerInterceptor {
	private final JwtTokenProvider jwtTokenProvider;

	public JwtInterceptor(JwtTokenProvider jwtTokenProvider) {
		this.jwtTokenProvider = jwtTokenProvider;
	}

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		String uri = request.getRequestURI();

		// ✅ 로그인 API는 인터셉터 우회
		if (uri.startsWith("/admin/auth/")) {
			return true;
		}

		// ✅ "/admin/{univId}/*" 패턴만 인증 적용
		if (!uri.matches("^/admin/\\d+/.*$")) {
			return true;
		}

		String authHeader = request.getHeader("Authorization");
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			throw new AdminException("Invalid token", ErrorCode.INVALID_TOKEN);
		}

		String token = authHeader.substring(7); // "Bearer " 제거

		if (!jwtTokenProvider.validateToken(token)) {
			throw new AdminException("Invalid token", ErrorCode.INVALID_TOKEN);
		}

		Long univId = jwtTokenProvider.getUnivId(token);

		// ✅ SecurityContext에 저장 (ThreadLocal 방식)
		SecurityContext.setUnivId(univId);

		return true; // 컨트롤러 실행 허용
	}

	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
		// 요청 처리 후 SecurityContext 비우기
		SecurityContext.clear();
	}
}

