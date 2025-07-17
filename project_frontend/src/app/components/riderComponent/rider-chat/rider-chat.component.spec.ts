import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderChatComponent } from './rider-chat.component';

describe('RiderChatComponent', () => {
  let component: RiderChatComponent;
  let fixture: ComponentFixture<RiderChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiderChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiderChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
