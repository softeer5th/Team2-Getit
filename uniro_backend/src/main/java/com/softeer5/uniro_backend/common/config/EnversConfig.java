package com.softeer5.uniro_backend.common.config;

import org.hibernate.envers.boot.internal.EnversService;
import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventType;
import org.hibernate.internal.SessionFactoryImpl;
import org.hibernate.service.spi.ServiceRegistryImplementor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.softeer5.uniro_backend.admin.aspect.CustomPostUpdateListener;

import jakarta.persistence.EntityManagerFactory;

@Configuration
public class EnversConfig {

	@Bean
	public EventListenerRegistry listenerRegistry(EntityManagerFactory entityManagerFactory) {
		ServiceRegistryImplementor serviceRegistry = entityManagerFactory.unwrap(SessionFactoryImpl.class).getServiceRegistry();

		EnversService enversService = serviceRegistry.getService(EnversService.class);
		EventListenerRegistry listenerRegistry = serviceRegistry.getService(EventListenerRegistry.class);

		// listenerRegistry.setListeners(EventType.POST_INSERT, new CustomPostInsertListener(enversService));
		listenerRegistry.setListeners(EventType.POST_UPDATE, new CustomPostUpdateListener(enversService));

		return listenerRegistry;
	}
}
