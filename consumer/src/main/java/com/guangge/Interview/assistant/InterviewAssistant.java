package com.guangge.Interview.assistant;

import com.guangge.Interview.advisor.LoggingAdvisor;
import com.iflytek.spark.api.SparkApi;
import com.iflytek.spark.api.SparkApiBuilder;
import com.iflytek.spark.api.req.ChatReq;
import com.iflytek.spark.api.req.Msg;
import com.iflytek.spark.api.resp.ChatResp;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

/**
 * 面试助手
 */
@Service
public class InterviewAssistant {

    private final SparkApi sparkApi;

    @SneakyThrows
    public InterviewAssistant(@Value("${spring.ai.xfspark.api-key}") String apiKey,
                              @Value("${spring.ai.xfspark.secret-key}") String secretKey) {
        this.sparkApi = new SparkApiBuilder()
                .appKey(apiKey)
                .appSecret(secretKey)
                .build();
    }

    public String chat(String chatId, String userMessageContent) {
        List<Msg> messages = new ArrayList<>();
        messages.add(new Msg("user", userMessageContent));
        ChatReq chatReq = new ChatReq("模型名称", messages);
        ChatResp chatResp = sparkApi.chat(chatReq);
        return chatResp.getChoices().get(0).getMessage().getContent();
    }

    public Flux<String> chatByStream(String chatId, String userMessageContent) {
        List<Msg> messages = new ArrayList<>();
        messages.add(new Msg("user", userMessageContent));
        ChatReq chatReq = new ChatReq("模型名称", messages);
        return Flux.fromStream(sparkApi.chatStream(chatReq).map(resp -> resp.getChoices().get(0).getMessage().getContent()));
    }
}