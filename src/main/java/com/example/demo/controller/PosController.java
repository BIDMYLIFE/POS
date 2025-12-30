package com.example.demo.controller;

import com.example.demo.entity.PosOrder;
import com.example.demo.repository.PosOrderRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pos")
@CrossOrigin(origins = "http://localhost:5173")
public class PosController {

    private final PosOrderRepository repository;

    public PosController(PosOrderRepository repository) {
        this.repository = repository;
    }

    /**
     * Save POS order (Entity binding)
     */
    @PostMapping("/posSave")
    @ResponseStatus(HttpStatus.CREATED)
    public PosOrder saveOrder(@RequestBody PosOrder order) {

        // ensure bidirectional relation is set
        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setOrder(order));
        }

        return repository.save(order);
    }
}
