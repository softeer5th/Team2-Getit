package com.softeer5.uniro_backend.common.config;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.alibaba.fastjson2.JSONReader;
import com.alibaba.fastjson2.JSONWriter;
import com.alibaba.fastjson2.support.config.FastJsonConfig;
import com.alibaba.fastjson2.support.spring6.http.converter.FastJsonHttpMessageConverter;
import com.softeer5.uniro_backend.admin.interceptor.AdminInterceptor;
import com.softeer5.uniro_backend.admin.interceptor.JwtInterceptor;

import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebMvc
@Slf4j
public class WebMvcConfig implements WebMvcConfigurer {
	private final AdminInterceptor adminInterceptor;
	private final JwtInterceptor jwtInterceptor; // JWT 인터셉터 추가

	public WebMvcConfig(AdminInterceptor adminInterceptor, JwtInterceptor jwtInterceptor) {
		this.adminInterceptor = adminInterceptor;
		this.jwtInterceptor = jwtInterceptor;
	}

	// @Override
	// public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
	// 	FastJsonHttpMessageConverter converter = new FastJsonHttpMessageConverter();
	// 	//custom configuration...
	// 	FastJsonConfig config = new FastJsonConfig();
	// 	config.setDateFormat("yyyy-MM-dd HH:mm:ss");
	// 	config.setReaderFeatures(JSONReader.Feature.FieldBased, JSONReader.Feature.SupportArrayToBean);
	// 	config.setWriterFeatures(JSONWriter.Feature.WriteMapNullValue, JSONWriter.Feature.PrettyFormat);
	// 	converter.setFastJsonConfig(config);
	// 	converter.setDefaultCharset(StandardCharsets.UTF_8);
	//
	// 	converter.setSupportedMediaTypes(List.of(
	// 		MediaType.APPLICATION_JSON, // application/json 지원
	// 		new MediaType("application", "json", StandardCharsets.UTF_8),
	// 		new MediaType("application", "openmetrics-text", StandardCharsets.UTF_8)
	// 	));
	//
	// 	converters.add(0, converter);
	// 	converters.forEach(c -> log.info("✔ {}", c.getClass().getName()));
	// }

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


