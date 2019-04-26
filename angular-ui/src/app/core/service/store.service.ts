import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '../model/store.model';
import { Observable } from 'rxjs';

@Injectable()
export class StoreService {
  //todo: use `${environment.api}`
  storesUrl: string = "assets/stores.json";
  constructor(private http: HttpClient) {}

  getStores(): Observable<Store[]> {
    return this.http.get<Store[]>(this.storesUrl);
  }

}
