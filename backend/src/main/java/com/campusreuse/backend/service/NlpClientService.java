package com.campusreuse.backend.service;

import com.campusreuse.backend.model.Product;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class NlpClientService {

    private final RestTemplate restTemplate;
    private final String nlpServiceUrl;

    public NlpClientService(RestTemplate restTemplate, @Value("${NLP_SERVICE_URL:http://localhost:8000}") String nlpServiceUrl) {
        this.restTemplate = restTemplate;
        this.nlpServiceUrl = nlpServiceUrl;
    }

    public void indexProduct(Product product) {
        if (product.getStatus() != Product.Status.AVAILABLE) {
            deleteProduct(product.getId());
            return;
        }

        try {
            String text = product.getTitle() + " " + product.getCategory() + " " + product.getDescription();
            Map<String, Object> request = Map.of(
                    "id", product.getId(),
                    "text", text
            );
            restTemplate.postForEntity(nlpServiceUrl + "/index", request, Map.class);
        } catch (Exception e) {
            System.err.println("Failed to index product in NLP service: " + e.getMessage());
        }
    }

    public void deleteProduct(Long productId) {
        try {
            restTemplate.delete(nlpServiceUrl + "/index/" + productId);
        } catch (Exception e) {
            System.err.println("Failed to delete product from NLP service: " + e.getMessage());
        }
    }

    public List<Long> searchProducts(String query, int topK) {
        try {
            String url = nlpServiceUrl + "/search?q=" + query + "&k=" + topK;
            ResponseEntity<List<Long>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Long>>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Failed to search products in NLP service: " + e.getMessage());
            return Collections.emptyList();
        }
    }
}
