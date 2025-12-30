package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "pos_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosOrder {

    @Id
    private Long id; // frontend-generated timestamp ID

    @Column(nullable = false)
    private BigDecimal subtotal;

    @Column(nullable = false)
    private BigDecimal discount;

    @Column(nullable = false)
    private BigDecimal total;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private OffsetDateTime timestamp;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<PosOrderItem> items;

    /** keep bidirectional relationship in sync */
    public void setItems(List<PosOrderItem> items) {
        this.items = items;
        items.forEach(i -> i.setOrder(this));
    }
}
