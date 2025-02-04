package com.softeer5.uniro_backend.admin.entity;

import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;

@Entity
@RevisionEntity
@Getter
public class Revinfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @RevisionNumber
    private Long rev;

    @RevisionTimestamp
    @Column(name = "revtstmp")
    private long revTimeStamp;
}
