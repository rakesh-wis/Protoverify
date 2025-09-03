import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GettingStartedService {

  constructor(private apiService: ApiService) { }

  gettingStarted(): Observable<any> {
    const url = `/shared/getting-started`;
    return this.apiService.get(url, null, SERVICES.CMS).pipe(
      map((data) => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      })
    );
  }
}
