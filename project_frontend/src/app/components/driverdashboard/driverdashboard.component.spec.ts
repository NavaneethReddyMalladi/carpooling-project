import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverDashboardComponent } from './driverdashboard.component';

describe('DriverDashboardComponent', () => {
  let component: DriverDashboardComponent;
  let fixture: ComponentFixture<DriverDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
