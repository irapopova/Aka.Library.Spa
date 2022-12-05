import { BooksService } from '../../services/books.service';
import { forkJoin, throwError, Subscription } from 'rxjs';
import { map, catchError, tap, take } from 'rxjs/operators';
import { Book } from '../../shared/book';
import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { find, filter } from 'lodash';
import { AuthService } from '../../services/auth.service';
import { MemberService } from '../../services/member.service';
import { slideInDownAnimation } from '../../animations';
import { GoogleBooksMetadata } from '../../shared/google-books-metadata';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss'],
  animations: [slideInDownAnimation]
})
export class BookDetailsComponent implements OnInit {
  @HostBinding('@routeAnimation') routeAnimation = true;
  @HostBinding('class.book-details') cssClass = true;
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.position') position = 'initial';

  bookSubscription: Subscription;
  book: Book;
  numBooksSignedOut: number;
  numBooksAvailable: number;
  bookMetadata: GoogleBooksMetadata;
  numOfThisBookSignedOutByUser: number;
  libraryId: number;
  bookId: number;
  maximumAllowedNumberOfBooksSignedOut: number = 2;
  
  constructor(
    private route: ActivatedRoute,
    private books: BooksService,
    private authService: AuthService,
    private memberService: MemberService
  ) { }

  ngOnInit(): void {
    this.route.paramMap
      .subscribe((params: ParamMap) => {
        this.libraryId = +params.get('lid');
        this.bookId = +params.get('id');
        this.getBookDetails();
      });
  }

  /**
   * Check if the maximum number of books for the current member has been reached
   *
   * @returns {boolean}
   * @memberof BookDetailsComponent
   */
  isMaximumNumberOfBooksSignedOut(): boolean {
    return this.numBooksSignedOut >= this.maximumAllowedNumberOfBooksSignedOut;
  }

  checkOutBook(): void {
    if(this.isMaximumNumberOfBooksSignedOut()) {
      return;
    }

    this.books.checkOutBook(this.libraryId, this.bookId, this.authService.currentMember.memberId)
      .pipe(
        take(1)
      )
      .subscribe(() => {
        this.getBookDetails();
      });
  }

  returnBook(): void {
    this.books.returnBook(this.libraryId, this.bookId, this.authService.currentMember.memberId)
      .pipe(
        take(1)
      )
      .subscribe(() => {
        this.getBookDetails();
      });
  }

  /**
   * Gets all the details for the passed book to be used for displaying in the books details
   *
   * @memberof BookDetailsComponent
   */
  getBookDetails(): void {
    forkJoin([
      this.books.getBook(this.libraryId, this.bookId),
      this.books.getNumberOfAvailableBookCopies(this.libraryId, this.bookId),
      this.memberService.getSignedOutBooks(this.authService.currentMember)
    ]).pipe(
      take(1),
      tap(([book, numberOfAvailableCopies, signedOutBooks]) => {
        this.numBooksSignedOut = signedOutBooks.length;
        this.numBooksAvailable = numberOfAvailableCopies;
        this.numOfThisBookSignedOutByUser = filter(signedOutBooks, (signedOutBook) => signedOutBook.bookId === book.bookId).length;
        const isbn = book.isbn;
        this.books.getBookMetaData(isbn)
          .pipe(take(1))
          .subscribe((bookMetadata: GoogleBooksMetadata) => {
            this.bookMetadata = bookMetadata;
          });
      }),
      map(([book, numberOfAvailableCopies, signedOutBooks]) => {
        const areBooksAvailable = numberOfAvailableCopies > 0;
        const hasUserCheckedThisBookOut = !!find(signedOutBooks, { bookId: book.bookId });
        return { ...book, isAvailable: areBooksAvailable, isCheckedOut: hasUserCheckedThisBookOut };
      }),
      catchError(err => {
        return throwError(err);
      })
    ).subscribe((book) => { this.book = book });
  }

}
