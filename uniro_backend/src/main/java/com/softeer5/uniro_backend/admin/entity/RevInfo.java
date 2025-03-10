package com.softeer5.uniro_backend.admin.entity;

import java.time.LocalDateTime;

import com.softeer5.uniro_backend.admin.setting.CustomReversionListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;

@Entity
@RevisionEntity(CustomReversionListener.class)
@Getter
@Setter
public class RevInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @RevisionNumber
    private Long rev;

    @RevisionTimestamp
    @Column(name = "revtstmp")
    private LocalDateTime revTimeStamp;

    @Column(name = "univ_id")
    @NotNull
    private Long univId;

    private String action;
}
