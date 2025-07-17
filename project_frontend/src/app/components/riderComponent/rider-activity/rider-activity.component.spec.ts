import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderActivityComponent } from './rider-activity.component';

describe('RiderActivityComponent', () => {
  let component: RiderActivityComponent;
  let fixture: ComponentFixture<RiderActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiderActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiderActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
