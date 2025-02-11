package com.softeer5.uniro_backend.admin.aspect;

import org.hibernate.envers.boot.internal.EnversService;
import org.hibernate.envers.event.spi.EnversPostUpdateEventListenerImpl;
import org.hibernate.event.spi.PostUpdateEvent;

import com.softeer5.uniro_backend.admin.setting.RevisionContext;
import com.softeer5.uniro_backend.admin.setting.RevisionType;

public class CustomPostUpdateListener extends EnversPostUpdateEventListenerImpl {
	public CustomPostUpdateListener(EnversService enversService) {
		super(enversService);
	}

	@Override
	public void onPostUpdate(PostUpdateEvent event) {
		RevisionType revisionType = RevisionContext.getRevisionType();

		if (revisionType == RevisionType.IGNORE) {
			// Ignore this entity
			return;
		}
		super.onPostUpdate(event);
	}
}
