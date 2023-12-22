import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverBikeComponent } from './deliver-bike.component';

describe('DeliverBikeComponent', () => {
  let component: DeliverBikeComponent;
  let fixture: ComponentFixture<DeliverBikeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeliverBikeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeliverBikeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
