package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {
    private int totalRows = 0;
    private int successfulRecords = 0;
    private int failedRecords = 0;
    private List<String> duplicatePrns = new ArrayList<>();
    private List<ErrorDetail> errors = new ArrayList<>();
}
