package com.softeer5.uniro_backend.admin.setting;

import com.softeer5.uniro_backend.admin.entity.RevInfo;
import org.hibernate.envers.RevisionListener;

public class CustomReversionListener implements RevisionListener {
    @Override
    public void newRevision(Object revisionEntity) {
        RevInfo revinfo = (RevInfo) revisionEntity;

        if(revinfo.getUnivId() == null) {
            revinfo.setUnivId(0L);
            return;
        }

        revinfo.setUnivId(RevisionContext.getUnivId());
        revinfo.setAction(RevisionContext.getAction());
    }
}