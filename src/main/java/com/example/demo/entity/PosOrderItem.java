package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pos_order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rowId; // DB primary key

    /** product id from frontend JSON */
    @Column(nullable = false)
    private Long productId;

    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer quantity;

    private Integer stock;

    private String barcode;

    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PosOrder order;

    /** map JSON "id" -> productId */
    @JsonProperty("id")
    public void mapProductId(Long id) {
        this.productId = id;
    }
}
