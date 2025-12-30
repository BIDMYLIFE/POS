package com.example.demo;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataLoader(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() > 0)
            return; // don't reseed

        var products = Arrays.asList(
            new Product(null, "Intel Core i9-13900K", new BigDecimal("589.99"), new BigDecimal("589.99"), 12, "CPU001", "CPUs"),
            new Product(null, "AMD Ryzen 9 7950X", new BigDecimal("549.99"), new BigDecimal("549.99"), 15, "CPU002", "CPUs"),
            new Product(null, "Intel Core i7-13700K", new BigDecimal("409.99"), new BigDecimal("409.99"), 20, "CPU003", "CPUs"),
            new Product(null, "AMD Ryzen 7 7800X3D", new BigDecimal("449.99"), new BigDecimal("449.99"), 18, "CPU004", "CPUs"),

            new Product(null, "ASUS ROG Maximus Z790", new BigDecimal("599.99"), new BigDecimal("599.99"), 8, "MB001", "Motherboards"),
            new Product(null, "MSI MAG B650 Tomahawk", new BigDecimal("249.99"), new BigDecimal("249.99"), 14, "MB002", "Motherboards"),
            new Product(null, "Gigabyte X670 AORUS Elite", new BigDecimal("329.99"), new BigDecimal("329.99"), 10, "MB003", "Motherboards"),
            new Product(null, "ASRock B760M Pro", new BigDecimal("159.99"), new BigDecimal("159.99"), 22, "MB004", "Motherboards"),

            new Product(null, "Corsair Vengeance DDR5 32GB", new BigDecimal("159.99"), new BigDecimal("159.99"), 30, "RAM001", "RAM"),
            new Product(null, "G.Skill Trident Z5 RGB 64GB", new BigDecimal("299.99"), new BigDecimal("299.99"), 15, "RAM002", "RAM"),
            new Product(null, "Kingston Fury Beast 16GB", new BigDecimal("79.99"), new BigDecimal("79.99"), 45, "RAM003", "RAM"),
            new Product(null, "Crucial DDR4 32GB Kit", new BigDecimal("89.99"), new BigDecimal("89.99"), 40, "RAM004", "RAM"),

            new Product(null, "NVIDIA RTX 4090", new BigDecimal("1599.99"), new BigDecimal("1599.99"), 5, "GPU001", "Graphics Cards"),
            new Product(null, "AMD RX 7900 XTX", new BigDecimal("999.99"), new BigDecimal("999.99"), 8, "GPU002", "Graphics Cards"),
            new Product(null, "NVIDIA RTX 4070 Ti", new BigDecimal("799.99"), new BigDecimal("799.99"), 12, "GPU003", "Graphics Cards"),
            new Product(null, "AMD RX 7800 XT", new BigDecimal("499.99"), new BigDecimal("499.99"), 16, "GPU004", "Graphics Cards"),

            new Product(null, "Samsung 990 PRO 2TB", new BigDecimal("189.99"), new BigDecimal("189.99"), 25, "SSD001", "Storage"),
            new Product(null, "WD Black SN850X 1TB", new BigDecimal("119.99"), new BigDecimal("119.99"), 35, "SSD002", "Storage"),
            new Product(null, "Crucial P5 Plus 500GB", new BigDecimal("59.99"), new BigDecimal("59.99"), 50, "SSD003", "Storage"),
            new Product(null, "Seagate BarraCuda 4TB HDD", new BigDecimal("89.99"), new BigDecimal("89.99"), 20, "HDD001", "Storage"));

        productRepository.saveAll(products);
    }
}
