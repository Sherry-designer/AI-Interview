package com.guangge.Interview.client;

import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Component
public class XfyunSparkClient {

    private final String apiKey;
    private final String apiSecret;
    private final String apiUrl;
    private final OkHttpClient client = new OkHttpClient();

    public XfyunSparkClient(@Value("${xfyun.api-key}") String apiKey,
                            @Value("${xfyun.api-secret}") String apiSecret,
                            @Value("${xfyun.api-url}") String apiUrl) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.apiUrl = apiUrl;
    }

    public String chat(String message) throws IOException {
        MediaType JSON = MediaType.get("application/json; charset=utf-8");
        String requestBody = "{\"header\": {\"app_id\": \"" + apiKey + "\"}, \"parameter\": {\"chat\": {\"domain\": \"generalv3\", \"temperature\": 0.5, \"max_tokens\": 2048}}, \"payload\": {\"message\": {\"text\": [{\"role\": \"user\", \"content\": \"" + message + "\"}]}}}";
        RequestBody body = RequestBody.create(requestBody, JSON);

        String authorization = generateAuthorization();
        Request request = new Request.Builder()
               .url(apiUrl)
               .post(body)
               .addHeader("Authorization", authorization)
               .addHeader("Content-Type", "application/json")
               .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful() && response.body() != null) {
                return response.body().string();
            } else {
                throw new IOException("Unexpected code " + response);
            }
        }
    }

    private String generateAuthorization() {
        String date = Instant.now().toString().replace("Z", "GMT");
        String host = apiUrl.replace("https://", "").split("/")[0];
        String path = apiUrl.substring(apiUrl.indexOf(host) + host.length());
        String digest = "SHA-256=47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";

        String stringToSign = "host: " + host + "\ndate: " + date + "\nPOST " + path + " HTTP/1.1\ndigest: " + digest;
        String signature = hmacSha256(stringToSign, apiSecret);

        String authorization = "api_key=\"" + apiKey + "\", algorithm=\"hmac-sha256\", headers=\"host date request-line digest\", signature=\"" + signature + "\"";
        return authorization;
    }

    private String hmacSha256(String data, String key) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] bytes = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(bytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            e.printStackTrace();
            return null;
        }
    }
}