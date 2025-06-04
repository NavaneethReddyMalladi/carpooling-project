import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderDashboardComponent } from './riderdashboard.component';

describe('RiderDashboardComponent', () => {
  let component: RiderDashboardComponent;
  let fixture: ComponentFixture<RiderDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiderDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiderDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
