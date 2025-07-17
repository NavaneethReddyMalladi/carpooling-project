import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderSidebarComponent } from './rider-sidebar.component';

describe('RiderSidebarComponent', () => {
  let component: RiderSidebarComponent;
  let fixture: ComponentFixture<RiderSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiderSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiderSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
