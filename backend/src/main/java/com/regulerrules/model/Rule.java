package com.regulerrules.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "rules")
public class Rule {

    @Id
    private String id;

    // Store dynamic fields as key-value pairs
    private Map<String, Object> fields;

    public Rule() {
    }

    public Rule(Map<String, Object> fields) {
        this.fields = fields;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Map<String, Object> getFields() {
        return fields;
    }

    public void setFields(Map<String, Object> fields) {
        this.fields = fields;
    }
}
