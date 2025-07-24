import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverChatComponent } from './driver-chat.component';

describe('DriverChatComponent', () => {
  let component: DriverChatComponent;
  let fixture: ComponentFixture<DriverChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
