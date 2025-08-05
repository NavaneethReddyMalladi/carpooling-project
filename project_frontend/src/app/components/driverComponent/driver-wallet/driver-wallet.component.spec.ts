import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverWalletComponent } from './driver-wallet.component';

describe('DriverWalletComponent', () => {
  let component: DriverWalletComponent;
  let fixture: ComponentFixture<DriverWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverWalletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
