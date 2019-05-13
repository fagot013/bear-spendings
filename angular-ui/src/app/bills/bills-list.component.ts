import { Component, OnInit } from '@angular/core';
import { Bill } from '../core/model/bill.model';
import { BillService } from '../core/service/bill.service';
import { NGXLogger } from 'ngx-logger';
import { StoreService } from '../core/service/store.service';
import { Store } from '../core/model/store.model';
import { Observable } from 'rxjs';
import { Product } from '../core/model/product.model';
import { ProductsService } from '../core/service/products.service';

@Component({
  selector: 'app-bills-list',
  templateUrl: './bills-list.component.html',
  styleUrls: ['./bills-list.component.css']
})
export class BillsListComponent implements OnInit {
  bills: Bill[];

  constructor(private logger: NGXLogger,
              private storeService: StoreService,
              private productService: ProductsService,
              private billService: BillService) {
  }

  ngOnInit() {
    this.billService.allBills().subscribe((bills: Bill[]) => {
      this.bills = bills;
    });
  }

  getStore(storeId: number): Observable<Store> {
    return this.storeService.getObservableById(storeId);
  }

  getProduct(productId: number): Observable<Product> {
    return this.productService.getObservableById(productId);
  }

}
