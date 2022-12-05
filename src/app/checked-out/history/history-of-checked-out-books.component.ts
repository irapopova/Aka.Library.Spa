import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material";
import { forkJoin, Subscription, zip } from "rxjs";
import { map, mergeAll } from "rxjs/operators";
import { slideInDownAnimation } from '../../animations';
import { AuthService } from '../../services/auth.service';
import { MemberService } from '../../services/member.service';
import { SignedOutBook } from '../../shared/signed-out-book';
import { SignedOutBookDetails } from '../../shared/signed-out-book-details';
import { LibrariesService } from '../../services/libraries.service';
import { BooksService } from '../../services/books.service';

@Component({
    selector: 'app-history-of-checked-out-books',
    templateUrl: './history-of-checked-out-books.component.html',
    styleUrls: ['./history-of-checked-out-books.component.scss'],
    animations: [slideInDownAnimation]
  })
  export class HistoryOfCheckedOutBooksComponent implements OnInit, OnDestroy {
    @HostBinding('@routeAnimation') routeAnimation = true;
    @HostBinding('style.display')   display = 'block';
    @HostBinding('style.position')  position = 'initial';

    displayedColumns = ['id', 'library', 'title', 'dateCheckedOut', 'dateReturned'];
    dataSource = new MatTableDataSource();
  	subscription: Subscription = new Subscription();

    constructor(
      private authService: AuthService,
      private memberService: MemberService,
      private libraryService: LibrariesService,
      private booksService: BooksService) {
    }

    ngOnInit(): void {
      this.subscription.add(this.memberService.getMemberBookHistory(this.authService.currentMember)
      .pipe(
        map((signedOutBooks: SignedOutBook []) => {
          const obss = signedOutBooks.map(signedOutBook => forkJoin([
            this.libraryService.getLibrary(signedOutBook.libraryId),
            this.booksService.getBook(signedOutBook.libraryId, signedOutBook.bookId)
          ])
                .pipe(
                  map(([library, book]) => ({ ...signedOutBook, libraryName: library.name, bookName: book.title }))
                ));
          return zip(...obss);
        }),
        mergeAll()
      ).subscribe((signedOutBooksDetails: SignedOutBookDetails []) => {
        this.dataSource.data = signedOutBooksDetails;
      }));
    }

    ngOnDestroy(): void {
      this.subscription.unsubscribe();
    }
  }  