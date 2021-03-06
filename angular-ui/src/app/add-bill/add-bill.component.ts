import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {NGXLogger} from 'ngx-logger';
import {StoreService} from '../core/service/store.service';
import {Store} from '../core/model/store.model';
import {Product} from '../core/model/product.model';
import {BillItem} from '../core/model/bill-item.model';
import {NewBillItemComponent} from './new-bill-item/new-bill-item.component';
import {ProductsService} from '../core/service/products.service';
import {BillService} from '../core/service/bill.service';
import {Bill} from '../core/model/bill.model';
import * as moment from 'moment';
import {MessageService} from 'primeng/api';
import {StoreProduct} from '../core/model/store-product.model';

@Component({
  selector: 'app-add-bill',
  templateUrl: './add-bill.component.html',
  styleUrls: ['./add-bill.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService]
})
export class AddBillComponent implements OnInit {
  stores: Store[];
  addBillForm: FormGroup;
  topStoreProducts: StoreProduct[];
  selectedProductId: number;
  billTotal = 0.0;

  @ViewChild(NewBillItemComponent)
  newBillItemComponent: NewBillItemComponent;

  constructor(private logger: NGXLogger,
              private messageService: MessageService,
              private storeService: StoreService,
              private billService: BillService,
              private productsService: ProductsService) {
  }

  ngOnInit() {
    this.storeService.getStores().subscribe((stores: Store[])  => {
      this.logger.debug('AddBillComponent: Subscribe to getStores(): ', stores);
      this.stores = stores;
    });
    this.addBillForm = new FormGroup({
      'store-id': new FormControl(null, Validators.required),
      'bill-date': new FormControl(moment().toDate(), Validators.required),
      'bill-items': new FormArray([], Validators.required)
    });
  }

  get billItemsControls(): AbstractControl[] {
    return this.billItems().controls;
  }

  onStoreSelected() {
    const storeId: number = this.addBillForm.get('store-id').value;
    this.logger.debug('AddBillComponent: On store selected. store id:', storeId);
    // todo: need to unsubscribe ??
    this.productsService.topStoreProducts(storeId).subscribe((products) => {
      this.topStoreProducts = products;
    });
    this.resetNewBillItem();
  }

  onTopProductSelected(productId: number) {
    this.selectedProductId = productId;
    this.logger.debug('AddBillComponent: On top store product selected. ProductId:', productId );
    const selectedProduct: StoreProduct = this.topStoreProducts.find(p => p.productId === productId);
    this.productsService.getObservableById(selectedProduct.productId).subscribe((product: Product) => {
      this.newBillItemComponent.setBillItem(new BillItem(selectedProduct.productId,
        product.name, selectedProduct.price, selectedProduct.quantity));
    });
  }

  onAddBillItem(billItem: BillItem) {
    this.logger.debug('AddBillComponent: On add bill item: ', JSON.stringify(billItem));
    this.billItems().push(new FormGroup(
      {
        'product-id': new FormControl(billItem.productId),
        'product-name': new FormControl(billItem.productName),
        'price-per-unit': new FormControl(billItem.pricePerUnit),
        'quantity': new FormControl(billItem.quantity),
        'total-price': new FormControl(billItem.totalPrice)
      }
    ));
    this.calculateBillTotal();
    this.resetNewBillItem();
  }

  onDeleteBillItem(index: number) {
    this.logger.debug('AddBillComponent: On delete bill item at index:', index);
    this.billItems().removeAt(index);
    this.calculateBillTotal();
  }

  onAddBill() {
    this.logger.debug(`AddBillComponent: On add bill. addBillForm: ${this.addBillForm}`);
    const bill: Bill = new Bill(moment(this.normalizedDate(this.addBillForm.get('bill-date').value))
      , this.addBillForm.get('store-id').value);
    for (const billItemFG of this.billItems().controls) {
      bill.items.push(new BillItem(
        billItemFG.get('product-id').value,
        billItemFG.get('product-name').value,
        billItemFG.get('price-per-unit').value,
        billItemFG.get('quantity').value,
        billItemFG.get('total-price').value)
      );
    }
    bill.total = this.billTotal;
    this.billService.addBill(bill).subscribe(addedBill => {
      this.logger.debug('Bill was added. bill id:' + addedBill.id);
      this.messageService.add({severity: 'success', summary: 'Bill was added with success'});
      this.resetForm();
    });
  }

  onClearForm() {
    this.logger.debug('Clearing entire bill form');
    this.resetForm();
  }

  /**
   * JSON.stringify() return utc date; this method create a utc date based on passed param.
   * this is a hack. need to find more elegant solution
   */
  normalizedDate(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()))
  }

  private billItems(): FormArray {
    return <FormArray>this.addBillForm.get('bill-items');
  }

  private resetForm() {
    this.logger.debug('resetting new bill form ...');

    this.addBillForm.get('bill-date').setValue(moment().toDate());
    this.addBillForm.get('store-id').setValue(null);
    this.topStoreProducts.splice(0);
    this.billItems().controls = [];
    this.resetNewBillItem();
    this.addBillForm.markAsUntouched();
    this.addBillForm.markAsPristine();
    this.billTotal = 0.0;
    this.logger.debug('resetting done.');
  }

  private resetNewBillItem() {
    this.logger.debug('resetting new bill item form ...');
    this.newBillItemComponent.reset();
    this.selectedProductId = null;
    this.logger.debug('resetting done.');
  }

  private calculateBillTotal() {
    this.logger.debug('Calculating bill total ...');
    this.billTotal = 0;
    for (const billItemFG of this.billItems().controls) {
        this.billTotal += billItemFG.get('total-price').value;
    }
    this.billTotal = +this.billTotal.toFixed(2);
    this.logger.debug('Bill total is:', this.billTotal);
  }

}
