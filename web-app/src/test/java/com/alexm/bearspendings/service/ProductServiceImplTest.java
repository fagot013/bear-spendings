package com.alexm.bearspendings.service;

import com.alexm.bearspendings.dto.ProductCommand;
import com.alexm.bearspendings.entity.Product;
import com.alexm.bearspendings.repository.ProductRepository;
import com.alexm.bearspendings.service.impl.ProductServiceImpl;
import org.assertj.core.api.Assertions;
import org.assertj.core.util.Lists;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static com.alexm.bearspendings.test.SAMPLE_PRODUCTS.*;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

/**
 * @author AlexM
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {
    @Mock
    ProductRepository productRepository;
    ProductService productService;

    @BeforeEach
    void setUp() {
        productService = new ProductServiceImpl(productRepository);
    }

    @Test
    void products() {
        when(productRepository.findAll()).thenReturn(Arrays.asList(
                Product.builder().name("Lapte").build()
        ));
        assertThat(productService.products(), containsInAnyOrder(Product.builder().name("Lapte").build()));
    }

    @Test
    void product() {
        when(productRepository.findById(CHEFIR.id)).thenReturn(Optional.of(Product.builder().id(1L).name(CHEFIR.productName).build()));
        ProductCommand product = productService.findProduct(CHEFIR.id);
        assertEquals(CHEFIR.productName, product.getName());
        verify(productRepository, times(1)) .findById(CHEFIR.id);
    }

    @Test
    void noProductFound(){
        assertThrows(NoSuchElementException.class, () -> productService.findProduct(222355L));
    }

    @Test
    void findStartWith() {
        //given
        when(productRepository.findByNameStartsWithIgnoreCase("cA"))
                .thenReturn(Lists.list(CARTOFI.product, CARNE.product));
        //when
        final List<ProductCommand> productCommands = productService.findStartWith("cA");
        //then
        Assertions.assertThat(productCommands).extracting(ProductCommand::getId).containsExactly(1L, 2L);
    }

    @Test
    void getOrInsert() {
        //todo: implement me
    }
}
