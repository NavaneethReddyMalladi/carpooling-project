import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderLayoutComponent } from './rider-layout.component';

describe('RiderLayoutComponent', () => {
  let component: RiderLayoutComponent;
  let fixture: ComponentFixture<RiderLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiderLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiderLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
