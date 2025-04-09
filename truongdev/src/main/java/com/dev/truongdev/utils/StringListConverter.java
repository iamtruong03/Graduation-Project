package com.dev.truongdev.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Collections;
import java.util.List;

@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {

  private static final ObjectMapper mapper = new ObjectMapper();

  @Override
  public String convertToDatabaseColumn(List<String> list) {
    try {
      return mapper.writeValueAsString(list);
    } catch (Exception e) {
      return "[]";
    }
  }

  @Override
  public List<String> convertToEntityAttribute(String data) {
    try {
      return mapper.readValue(data, new TypeReference<List<String>>() {});
    } catch (Exception e) {
      return Collections.emptyList();
    }
  }
}