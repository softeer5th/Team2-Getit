package com.softeer5.uniro_backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.softeer5.uniro_backend.admin.interceptor.AdminInterceptor;
import com.softeer5.uniro_backend.admin.interceptor.JwtInterceptor;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
	private final AdminInterceptor adminInterceptor;
	private final JwtInterceptor jwtInterceptor; // JWT 인터셉터 추가

	public WebMvcConfig(AdminInterceptor adminInterceptor, JwtInterceptor jwtInterceptor) {
		this.adminInterceptor = adminInterceptor;
		this.jwtInterceptor = jwtInterceptor;
	}

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		// JWT 인터셉터는 더 먼저 실행되도록 우선순위 낮춤
		registry.addInterceptor(jwtInterceptor)
			.addPathPatterns("/admin/{univId}/**") // "/admin/{univId}/" 패턴만 적용
			.excludePathPatterns("/admin/auth/login")
			.excludePathPatterns("/**", HttpMethod.OPTIONS.name())
			.order(0); // 가장 먼저 실행되도록 설정

		// AdminInterceptor는 그 다음에 실행
		registry.addInterceptor(adminInterceptor)
			.addPathPatterns("/admin/{univId}/**") // "/admin/{univId}/" 패턴만 적용
			.excludePathPatterns("/admin/auth/login")
			.excludePathPatterns("/**", HttpMethod.OPTIONS.name())
			.order(1); // JWT 이후에 실행되도록 설정
	}
}


