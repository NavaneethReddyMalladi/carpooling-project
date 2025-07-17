import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderMyRidesComponent } from './rider-my-rides.component';

describe('RiderMyRidesComponent', () => {
  let component: RiderMyRidesComponent;
  let fixture: ComponentFixture<RiderMyRidesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiderMyRidesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiderMyRidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
