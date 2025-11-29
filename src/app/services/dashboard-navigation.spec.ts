import { TestBed } from '@angular/core/testing';

import { DashboardNavigation } from './dashboard-navigation';

describe('DashboardNavigation', () => {
  let service: DashboardNavigation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardNavigation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
