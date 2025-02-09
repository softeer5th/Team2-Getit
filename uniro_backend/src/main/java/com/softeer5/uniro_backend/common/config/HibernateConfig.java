package com.softeer5.uniro_backend.common.config;

import org.hibernate.Interceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.softeer5.uniro_backend.admin.aspect.EnversInterceptor;

@Configuration
public class HibernateConfig {
	@Bean
	public Interceptor hibernateInterceptor() {
		return new EnversInterceptor();
	}
}
