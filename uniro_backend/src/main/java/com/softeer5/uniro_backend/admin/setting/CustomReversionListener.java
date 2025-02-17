package com.softeer5.uniro_backend.admin.setting;

import com.softeer5.uniro_backend.admin.entity.RevInfo;
import org.hibernate.envers.RevisionListener;

public class CustomReversionListener implements RevisionListener {
    @Override
    public void newRevision(Object revisionEntity) {
        RevInfo revinfo = (RevInfo) revisionEntity;

        revinfo.setRevTimeStamp(RevisionContext.getTimeStamp());
        revinfo.setUnivId(RevisionContext.getUnivId());
        revinfo.setAction(RevisionContext.getAction());
    }
}