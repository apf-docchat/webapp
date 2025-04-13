import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingSpinnerService {

  showSpinner = signal<boolean>(false);

  constructor() {}
}
