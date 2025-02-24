package com.softeer5.uniro_backend.external.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Component
public class RouteEventListener {
    private final TaskScheduler taskScheduler;
    private final RouteEventService routeEventService;
    private final AtomicBoolean isScheduled = new AtomicBoolean(false);

    public RouteEventListener(TaskScheduler taskScheduler, RouteEventService routeEventService) {
        this.taskScheduler = taskScheduler;
        this.routeEventService = routeEventService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRouteCreatedEvent(RouteCreatedEvent event) {
        log.info("Routes Created Event Listen");

        // 이미 스케쥴링되고있는지 판단
        if(isScheduled.compareAndSet(false, true)) {
            Date scheduledTime = new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(30));

            taskScheduler.schedule(() -> {
                try {
                    routeEventService.fetchHeight();
                } finally {
                    isScheduled.set(false);
                }
            }, scheduledTime.toInstant());

        }

    }

}

