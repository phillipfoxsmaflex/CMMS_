package com.grash.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class RateLimiterService {

    private final ConcurrentMap<String, Bucket> cache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, this::newBucket);
    }

    private Bucket newBucket(String key) {
        // 15 requests per minute
        Bandwidth fifteenPerMinute = Bandwidth.classic(15, Refill.greedy(15, Duration.ofMinutes(1)));

        return Bucket.builder()
                .addLimit(fifteenPerMinute)
                .build();
    }
}
