package com.regulerrules.service;

import com.regulerrules.model.Rule;
import com.regulerrules.repository.RuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RuleService {

    @Autowired
    private RuleRepository ruleRepository;

    // Mock data flag
    private boolean useMockData = true;

    // Mock fields list
    private static final List<String> MOCK_FIELDS = Arrays.asList(
            "Rule Type", "MD State", "Ship to State", "Zip Code", "Channel",
            "Reg Cat Code", "Drug Schedule", "Refill", "Quantity", "Days Supply",
            "User Location", "Dispensing Location", "Protocol", "Days Ago", "Max Days Allowed to Expiry Date"
    );

    // Mock data list
    private static final List<Map<String, Object>> MOCK_DATA = new ArrayList<>();

    static {
        // Add some mock data entries
        Map<String, Object> entry1 = new HashMap<>();
        entry1.put("Rule Type", "Type A");
        entry1.put("MD State", "CA");
        entry1.put("Ship to State", "CA");
        entry1.put("Zip Code", "90001");
        entry1.put("Channel", "Online");
        entry1.put("Reg Cat Code", "R1");
        entry1.put("Drug Schedule", "Schedule II");
        entry1.put("Refill", 2);
        entry1.put("Quantity", 30);
        entry1.put("Days Supply", 30);
        entry1.put("User Location", "Location 1");
        entry1.put("Dispensing Location", "Dispense 1");
        entry1.put("Protocol", "Protocol A");
        entry1.put("Days Ago", 5);
        entry1.put("Max Days Allowed to Expiry Date", 60);
        MOCK_DATA.add(entry1);

        Map<String, Object> entry2 = new HashMap<>();
        entry2.put("Rule Type", "Type B");
        entry2.put("MD State", "NY");
        entry2.put("Ship to State", "NY");
        entry2.put("Zip Code", "10001");
        entry2.put("Channel", "Retail");
        entry2.put("Reg Cat Code", "R2");
        entry2.put("Drug Schedule", "Schedule III");
        entry2.put("Refill", 1);
        entry2.put("Quantity", 15);
        entry2.put("Days Supply", 15);
        entry2.put("User Location", "Location 2");
        entry2.put("Dispensing Location", "Dispense 2");
        entry2.put("Protocol", "Protocol B");
        entry2.put("Days Ago", 10);
        entry2.put("Max Days Allowed to Expiry Date", 30);
        MOCK_DATA.add(entry2);
    }

    public List<String> getFields() {
        if (useMockData) {
            return MOCK_FIELDS;
        } else {
            // In real scenario, fields can be fetched dynamically from DB schema or config
            return MOCK_FIELDS;
        }
    }

    public List<Map<String, Object>> getRules(int page, int size) {
        if (useMockData) {
            int fromIndex = Math.min(page * size, MOCK_DATA.size());
            int toIndex = Math.min(fromIndex + size, MOCK_DATA.size());
            return MOCK_DATA.subList(fromIndex, toIndex);
        } else {
            // Fetch from DB with pagination
            // For simplicity, fetch all and paginate in memory (not recommended for production)
            List<Rule> allRules = ruleRepository.findAll();
            List<Map<String, Object>> allData = new ArrayList<>();
            for (Rule rule : allRules) {
                allData.add(rule.getFields());
            }
            int fromIndex = Math.min(page * size, allData.size());
            int toIndex = Math.min(fromIndex + size, allData.size());
            return allData.subList(fromIndex, toIndex);
        }
    }

    public long getTotalCount() {
        if (useMockData) {
            return MOCK_DATA.size();
        } else {
            return ruleRepository.count();
        }
    }

    public Rule addRule(Map<String, Object> fields) {
        if (useMockData) {
            // Add to mock data list
            MOCK_DATA.add(fields);
            return null;
        } else {
            Rule rule = new Rule(fields);
            return ruleRepository.save(rule);
        }
    }

    public Rule updateRule(String id, Map<String, Object> fields) {
        if (useMockData) {
            // Update mock data by id is not supported in mock mode
            return null;
        } else {
            Optional<Rule> optionalRule = ruleRepository.findById(id);
            if (optionalRule.isPresent()) {
                Rule rule = optionalRule.get();
                rule.setFields(fields);
                return ruleRepository.save(rule);
            } else {
                return null;
            }
        }
    }
}
