import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Diaper } from './diaper';

describe('Diaper', () => {
  let component: Diaper;
  let fixture: ComponentFixture<Diaper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Diaper],
    }).compileComponents();

    fixture = TestBed.createComponent(Diaper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
