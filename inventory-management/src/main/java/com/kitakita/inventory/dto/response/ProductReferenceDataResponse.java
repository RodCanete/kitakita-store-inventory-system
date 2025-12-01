package com.kitakita.inventory.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductReferenceDataResponse {

    private List<Option> categories;
    private List<Option> suppliers;

    @Data
    @Builder
    public static class Option {
        private Integer id;
        private String label;
    }
}


