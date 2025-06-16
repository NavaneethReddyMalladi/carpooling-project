import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemologinComponent } from './demologin.component';

describe('DemologinComponent', () => {
  let component: DemologinComponent;
  let fixture: ComponentFixture<DemologinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemologinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemologinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
