import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderHelpComponent } from './rider-help.component';

describe('RiderHelpComponent', () => {
  let component: RiderHelpComponent;
  let fixture: ComponentFixture<RiderHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiderHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiderHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
