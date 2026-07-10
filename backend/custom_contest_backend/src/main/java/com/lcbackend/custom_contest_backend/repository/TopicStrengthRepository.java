package com.lcbackend.custom_contest_backend.repository;

import com.lcbackend.custom_contest_backend.model.TopicStrength;
import com.lcbackend.custom_contest_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface TopicStrengthRepository extends JpaRepository<TopicStrength, Long> {
    Optional<TopicStrength> findByUserAndTopicName(User user, String topicName);

    List<TopicStrength> findByUser(User user);

}
