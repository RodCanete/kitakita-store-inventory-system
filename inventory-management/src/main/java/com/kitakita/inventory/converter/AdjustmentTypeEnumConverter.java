package com.kitakita.inventory.converter;

import com.kitakita.inventory.entity.InventoryAdjustment.AdjustmentType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AdjustmentTypeEnumConverter implements AttributeConverter<AdjustmentType, String> {

    @Override
    public String convertToDatabaseColumn(AdjustmentType adjustmentType) {
        if (adjustmentType == null) {
            return null;
        }
        return adjustmentType.name().toLowerCase();
    }

    @Override
    public AdjustmentType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        
        try {
            // Try to match with uppercase enum values first
            return AdjustmentType.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            // If that fails, try to match with the actual stored values
            for (AdjustmentType type : AdjustmentType.values()) {
                if (type.name().equalsIgnoreCase(dbData)) {
                    return type;
                }
            }
            throw e;
        }
    }
}