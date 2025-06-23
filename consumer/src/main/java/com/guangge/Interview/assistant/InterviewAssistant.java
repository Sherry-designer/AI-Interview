package com.guangge.Interview.assistant;

import com.guangge.Interview.advisor.LoggingAdvisor;
import com.guangge.Interview.client.XfyunSparkClient;
import lombok.SneakyThrows;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.io.IOException;

/**
 * 面试助手
 */
@Service
public class InterviewAssistant {

    private final XfyunSparkClient xfyunSparkClient;

    @Autowired
    public InterviewAssistant(XfyunSparkClient xfyunSparkClient) {
        this.xfyunSparkClient = xfyunSparkClient;
    }

    public String chat(String chatId, String userMessageContent) {
        try {
            return xfyunSparkClient.chat(userMessageContent);
        } catch (IOException e) {
            e.printStackTrace();
            return "获取响应失败";
        }
    }

    public Flux<String> chatByStream(String chatId, String userMessageContent) {
        // 这里需要根据实际情况实现流式响应逻辑
        // 目前先返回一个空的Flux
        return Flux.empty();
    }
}