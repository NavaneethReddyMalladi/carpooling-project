import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRideComponent } from './driver-create-ride.component';

describe('CreateRideComponent', () => {
  let component: CreateRideComponent;
  let fixture: ComponentFixture<CreateRideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
