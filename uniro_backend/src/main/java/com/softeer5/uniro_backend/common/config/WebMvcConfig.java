package com.softeer5.uniro_backend.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskDecorator;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.RequestContextListener;
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

	@Bean(name = "taskExecutor")
	public ThreadPoolTaskExecutor taskExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(10);
		executor.setMaxPoolSize(20);
		executor.setQueueCapacity(100);
		executor.setTaskDecorator(new TaskDecorator() {
			@Override
			public Runnable decorate(Runnable runnable) {
				// 현재 스레드의 RequestAttributes를 가져옵니다.
				RequestAttributes context = RequestContextHolder.getRequestAttributes();
				return () -> {
					try {
						// 비동기 스레드에 컨텍스트를 설정합니다.
						RequestContextHolder.setRequestAttributes(context);
						runnable.run();
					} finally {
						// 작업 후 컨텍스트 초기화
						RequestContextHolder.resetRequestAttributes();
					}
				};
			}
		});
		executor.initialize();
		return executor;
	}

	/*
	@Bean
	public RequestContextListener requestContextListener() {
		return new RequestContextListener();
	}

	 */

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


