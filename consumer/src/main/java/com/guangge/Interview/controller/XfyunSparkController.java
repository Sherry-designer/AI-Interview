package com.guangge.Interview.controller;

import com.guangge.Interview.service.XfyunSparkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class XfyunSparkController {

    private final XfyunSparkService xfyunSparkService;

    @Autowired
    public XfyunSparkController(XfyunSparkService xfyunSparkService) {
        this.xfyunSparkService = xfyunSparkService;
    }

    @GetMapping("/xfyun/chat")
    public String chat(@RequestParam String message) {
        return xfyunSparkService.getResponse(message);
    }
}