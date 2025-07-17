import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderWalletComponent } from './rider-wallet.component';

describe('RiderWalletComponent', () => {
  let component: RiderWalletComponent;
  let fixture: ComponentFixture<RiderWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiderWalletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiderWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
