import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EMPTY } from 'rxjs';

import { HistoryOfCheckedOutBooksComponent } from './history-of-checked-out-books.component';
import { AuthService } from '../../services/auth.service';
import { MemberService } from '../../services/member.service';
import { LibrariesService } from '../../services/libraries.service';
import { BooksService } from '../../services/books.service';

fdescribe('HistoryOfCheckedOutBooksComponent', () => {
  let component: HistoryOfCheckedOutBooksComponent;
  let fixture: ComponentFixture<HistoryOfCheckedOutBooksComponent>;
  let authService: jasmine.SpyObj<AuthService>;
	let memberService: jasmine.SpyObj<MemberService>;
	let librariesService: jasmine.SpyObj<LibrariesService>;
	let bookService: jasmine.SpyObj<BooksService>;

  beforeEach(async(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
			'currentMember'
		]);
    memberService = jasmine.createSpyObj<MemberService>('MemberService', [
			'getMemberBookHistory'
		]);
		memberService.getMemberBookHistory.and.returnValue(EMPTY);

    TestBed.configureTestingModule({
      declarations: [ HistoryOfCheckedOutBooksComponent ],
      imports: [
        MatTableModule,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: MemberService, useValue: memberService },
        { provide: LibrariesService, librariesService },
        { provide: BooksService, bookService },
        HttpTestingController
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryOfCheckedOutBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
