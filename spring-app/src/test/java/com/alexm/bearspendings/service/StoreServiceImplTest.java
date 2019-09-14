package com.alexm.bearspendings.service;

import com.alexm.bearspendings.entity.Product;
import com.alexm.bearspendings.entity.Store;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Iterator;
import java.util.Optional;
import java.util.Set;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * @author AlexM
 * Date: 9/8/19
 **/
@SpringBootTest()
class StoreServiceImplTest {

    @Autowired
    StoreServiceImpl storeService;

    @BeforeEach
    void setup() {
//        storeService = new StoreServiceImpl();
    }


    @DisplayName("all stores test")
    @Test
    void allStores() {
        assertThat(storeService.allStores(), containsInAnyOrder(Store.builder().id(1L).name("Nr.1").build()));
    }

    @DisplayName("get store by id")
    @Test
    void store() {
        Optional<Store> optionalStore = storeService.findStore(1L);
        assertTrue(optionalStore.isPresent());
        optionalStore.ifPresent(store ->
                assertAll("store properties",
                        () -> assertEquals(1L, store.getId().longValue()),
                        () -> assertEquals("Nr.1", store.getName())
                )
        );
        optionalStore = storeService.findStore(10002L);
        assertFalse(optionalStore.isPresent());
    }


    @DisplayName("test getting of top store products")
    @Test
    void testTopProducts() {
        //given
        //when
        Set<Product> products = storeService.topProducts(1L, 2);
        //then
        assertAll(
                () -> { assertEquals(2, products.size());}
        );
        Iterator<Product> iterator = products.iterator();
        Product chefir1 = iterator.next();
        assertThat(chefir1,
                allOf(
                        hasProperty("id", equalTo(1L)),
                        hasProperty("name", equalTo("chefir jlc 1%"))
                )
        );

        Product chefir2 = iterator.next();
        assertThat(chefir2,
                allOf(
                        hasProperty("id", equalTo(2L)),
                        hasProperty("name", equalTo("chefir jlc 2.5%"))
                )
        );

    }
}