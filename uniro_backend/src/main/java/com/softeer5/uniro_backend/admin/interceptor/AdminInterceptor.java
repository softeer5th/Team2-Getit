package com.softeer5.uniro_backend.admin.interceptor;

import static com.softeer5.uniro_backend.common.error.ErrorCode.*;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.softeer5.uniro_backend.admin.jwt.SecurityContext;
import com.softeer5.uniro_backend.common.exception.custom.AdminException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AdminInterceptor implements HandlerInterceptor {
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		String requestURI = request.getRequestURI();

		// "/admin/{univId}/" 패턴만 검증
		Pattern pattern = Pattern.compile("^/admin/(\\d+)/.*$");
		Matcher matcher = pattern.matcher(requestURI);

		if (matcher.matches()) {
			Long univId = Long.valueOf(matcher.group(1)); // URL에서 univId 추출
			Long adminUnivId = SecurityContext.getUnivId(); // JWT에서 가져온 univId

			if (!univId.equals(adminUnivId)) {
				throw new AdminException("Unauthorized university access", UNAUTHORIZED_UNIV);
			}
		}
		return true;
	}
}

