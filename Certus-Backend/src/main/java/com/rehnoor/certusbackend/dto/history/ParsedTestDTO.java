package com.rehnoor.certusbackend.dto.history;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ParsedTestDTO {

    private String testName;
    private Boolean abnormal;
    private String category;
    private String value;
    private String unit;
    private String referenceRange;

}
