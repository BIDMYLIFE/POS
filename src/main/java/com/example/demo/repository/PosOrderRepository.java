package com.example.demo.repository;

import com.example.demo.entity.PosOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PosOrderRepository extends JpaRepository<PosOrder, Long> {
}
