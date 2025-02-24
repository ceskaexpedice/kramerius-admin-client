import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowLongtextComponent } from './show-longtext.component';

describe('ShowLongtextComponent', () => {
  let component: ShowLongtextComponent;
  let fixture: ComponentFixture<ShowLongtextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowLongtextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowLongtextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
