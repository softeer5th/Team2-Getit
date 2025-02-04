package com.softeer5.uniro_backend.admin.entity;

import com.softeer5.uniro_backend.admin.setting.CustomReversionListener;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;

@Entity
@RevisionEntity(CustomReversionListener.class)
@Getter
@Setter
@Table(name = "Revinfo")
public class RevInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @RevisionNumber
    private Long rev;

    @RevisionTimestamp
    @Column(name = "revtstmp")
    private long revTimeStamp;
    @Column(name = "univ_id")
    private Long univId;
    private String action;
}
