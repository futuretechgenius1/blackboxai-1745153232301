package com.regulerrules.controller;

import com.regulerrules.service.RuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rules")
@CrossOrigin(origins = "*")
public class RuleController {

    @Autowired
    private RuleService ruleService;

    @GetMapping("/fields")
    public List<String> getFields() {
        return ruleService.getFields();
    }

    @GetMapping
    public Map<String, Object> getRules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        List<Map<String, Object>> data = ruleService.getRules(page, size);
        long total = ruleService.getTotalCount();
        return Map.of(
                "data", data,
                "total", total,
                "page", page,
                "size", size
        );
    }

    @PostMapping
    public void addRule(@RequestBody Map<String, Object> fields) {
        ruleService.addRule(fields);
    }

    @PutMapping("/{id}")
    public void updateRule(@PathVariable String id, @RequestBody Map<String, Object> fields) {
        ruleService.updateRule(id, fields);
    }
}
