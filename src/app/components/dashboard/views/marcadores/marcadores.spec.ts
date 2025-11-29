import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Marcadores } from './marcadores';

describe('Marcadores', () => {
  let component: Marcadores;
  let fixture: ComponentFixture<Marcadores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Marcadores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Marcadores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
