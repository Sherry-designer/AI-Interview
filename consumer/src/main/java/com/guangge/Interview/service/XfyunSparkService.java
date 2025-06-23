package com.guangge.Interview.service;

import com.guangge.Interview.client.XfyunSparkClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class XfyunSparkService {

    private final XfyunSparkClient xfyunSparkClient;

    @Autowired
    public XfyunSparkService(XfyunSparkClient xfyunSparkClient) {
        this.xfyunSparkClient = xfyunSparkClient;
    }

    public String getResponse(String message) {
        try {
            return xfyunSparkClient.chat(message);
        } catch (IOException e) {
            e.printStackTrace();
            return "获取响应失败";
        }
    }
}