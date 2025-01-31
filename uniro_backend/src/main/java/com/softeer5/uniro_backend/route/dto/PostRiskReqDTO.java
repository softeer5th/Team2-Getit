package com.softeer5.uniro_backend.route.dto;

import com.softeer5.uniro_backend.route.entity.CautionType;
import com.softeer5.uniro_backend.route.entity.DangerType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PostRiskReqDTO {
    private List<CautionType> cautionTypes;
    private List<DangerType> dangerTypes;
}
