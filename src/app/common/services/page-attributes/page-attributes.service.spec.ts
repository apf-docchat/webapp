import { TestBed } from '@angular/core/testing';

import { PageAttributesService } from './page-attributes.service';

describe('PageAttributesService', () => {
  let service: PageAttributesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageAttributesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
