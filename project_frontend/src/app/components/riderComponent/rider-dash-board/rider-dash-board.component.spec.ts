import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderDashBoardComponent } from './rider-dash-board.component';

describe('RiderDashBoardComponent', () => {
  let component: RiderDashBoardComponent;
  let fixture: ComponentFixture<RiderDashBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiderDashBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiderDashBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
