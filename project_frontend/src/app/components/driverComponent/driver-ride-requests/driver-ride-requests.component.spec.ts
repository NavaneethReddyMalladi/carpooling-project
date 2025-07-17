import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideRequestsComponent } from './driver-ride-requests.component';

describe('RideRequestsComponent', () => {
  let component: RideRequestsComponent;
  let fixture: ComponentFixture<RideRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
