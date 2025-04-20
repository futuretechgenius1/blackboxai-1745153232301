package com.regulerrules.repository;

import com.regulerrules.model.Rule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RuleRepository extends MongoRepository<Rule, String> {
}
