package com.softeer5.uniro_backend.external;

import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.custom.ElevationApiException;
import com.softeer5.uniro_backend.node.entity.Node;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class MapClientImpl implements MapClient{
    @Value("${map.api.key}")
    private String apiKey;
    private final String baseUrl = "https://maps.googleapis.com/maps/api/elevation/json";
    private final Integer MAX_BATCH_SIZE = 100;
    private final String SUCCESS_STATUS = "OK";
    private final WebClient webClient;

    public MapClientImpl() {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    @Getter
    @Setter
    public static class ElevationResponse {
        private List<Result> results;
        private String status;

        @Getter
        @Setter
        public static class Result {
            private double elevation;
        }
    }


    @Override
    public void fetchHeights(List<Node> nodes) {
        List<Node> nodesWithoutHeight = nodes.stream()
                .filter(node -> node.getId() == null)
                .toList();

        if(nodesWithoutHeight.isEmpty()) return;

        List<List<Node>> partitions = partitionNodes(nodesWithoutHeight, MAX_BATCH_SIZE);

        List<Mono<Void>> apiCalls = partitions.stream()
                .map(batch -> fetchElevationAsync(batch)
                        .subscribeOn(Schedulers.boundedElastic())
                        .doOnNext(response -> mapElevationToNodes(response, batch))
                        .then())
                .toList();

        // 모든 비동기 호출이 완료될 때까지 대기
        Mono.when(apiCalls).block();
    }

    // 노드를 512개씩 분할
    private List<List<Node>> partitionNodes(List<Node> nodes, int batchSize) {
        List<List<Node>> partitions = new ArrayList<>();
        for (int i = 0; i < nodes.size(); i += batchSize) {
            partitions.add(nodes.subList(i, Math.min(i + batchSize, nodes.size())));
        }
        return partitions;
    }

    // 병렬로 Google Map Elevation API 호출
    private Mono<ElevationResponse> fetchElevationAsync(List<Node> nodes) {
        StringBuilder coordinateBuilder = convertCoordinatesToStringBuilder(nodes);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("locations", coordinateBuilder.toString())
                        .queryParam("key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(ElevationResponse.class);
    }

    private StringBuilder convertCoordinatesToStringBuilder(List<Node> nodes) {
        StringBuilder result =  new StringBuilder();
        for (Node node : nodes) {
            result.append(node.getCoordinates().getY())
                    .append(",")
                    .append(node.getCoordinates().getX())
                    .append("|");
        }
        result.setLength(result.length() - 1);
        return result;
    }

    // 응답결과(해발고도)를 매핑해주는 메서드
    private void mapElevationToNodes(ElevationResponse response, List<Node> batch) {
        log.info("Current Thread: {}", Thread.currentThread().getName());

        if (!response.getStatus().equals(SUCCESS_STATUS)) {
            throw new ElevationApiException("Google Elevation API Fail: " + response.getStatus(), ErrorCode.ELEVATION_API_ERROR);
        }

        if (response.results.size() != batch.size()) {
            log.error("The number of responses does not match the number of requests. " +
                    "request size: {}, response size: {}", batch.size(), response.results.size());
            throw new ElevationApiException("The number of responses does not match the number of requests. " +
                    "request size: " + batch.size() + "response size: " + response.results.size(), ErrorCode.ELEVATION_API_ERROR);
        }

        log.info("Google Elevation API Success. batch size: " + batch.size());

        List<ElevationResponse.Result> results = response.getResults();
        for (int i = 0; i < results.size(); i++) {
            batch.get(i).setHeight(results.get(i).getElevation());
        }

    }

}
