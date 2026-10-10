import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { AddedEvent, ProductCard } from '../../components/product-card/product-card';
import { RecommendedToys } from '../../components/recommended-toys/recommended-toys';
import { SaleCountdown } from '../../components/sale-countdown/sale-countdown';
import { CATEGORY_LABELS } from '../../models/category-labels';
import { Category, Product } from '../../models/product';
import { CartService } from '../../services/cart-service';
import { ConfigService } from '../../services/config-service';
import { ProductService } from '../../services/product-service';
import { WishlistStore } from '../../services/wishlist-store';

type CategoryChoice = 'all' | Category;

@Component({
  imports: [
    ProductCard,
    RecommendedToys,
    SaleCountdown,
    RouterLink,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private productService = inject(ProductService);
  private cart = inject(CartService);
  wishlist = inject(WishlistStore);
  private snackBar = inject(MatSnackBar);

  lastAdded = signal('');
  loading = signal(true);
  error = signal('');

  // How long the sale lasts is a setting in config.json (change it without rebuilding!).
  saleEnds = new Date(Date.now() + inject(ConfigService).config().saleMinutes * 60 * 1000);
  showSale = signal(true);

  categories = (['all', 'cars', 'soft', 'puzzles', 'games'] as CategoryChoice[]).map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
  }));

  category = input<string>();

  selected = computed<CategoryChoice>(() => {
    const found = this.categories.find((c) => c.id === this.category());
    return found ? found.id : 'all';
  });

  // A FormControl is a little box that holds what the person typed.
  searchTerm = new FormControl('', { nonNullable: true });

  // Water pipes! The search words flow in, and we wait until typing pauses.
  private term$ = this.searchTerm.valueChanges.pipe(
    debounceTime(300), // wait 300ms of quiet
    distinctUntilChanged(), // ignore if nothing really changed
    startWith(''), // and begin with an empty search
  );

  // A BehaviorSubject remembers its latest value. Pressing "Try again" gives it a new one.
  private refresh$ = new BehaviorSubject<void>(undefined);

  // Three streams (search words + chosen group + refresh) are joined into one.
  // switchMap throws away an old request when a new one starts.
  visible = toSignal(
    combineLatest([this.term$, toObservable(this.selected), this.refresh$]).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set('');
      }),
      switchMap(([term, category]) =>
        this.productService.search(term, category).pipe(
          catchError(() => {
            this.error.set(
              $localize`:@@home.shelfStuck:Sorry, the toy shelf is stuck. Please try again.`,
            );
            return of([] as Product[]);
          }),
        ),
      ),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] as Product[] },
  );

  retry() {
    this.refresh$.next();
  }

  // The favorites: we hand the pipe straight to the template's "async" pipe.
  topRated$ = this.productService
    .getAll()
    .pipe(map((list) => [...list].sort((a, b) => b.rating - a.rating).slice(0, 3)));

  // CDK's BreakpointObserver tells us when the screen is phone-sized: show fewer toys per page.
  private onPhone = toSignal(
    inject(BreakpointObserver)
      .observe(Breakpoints.Handset)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  pageSize = computed(() => (this.onPhone() ? 4 : 6));
  page = linkedSignal({ source: this.selected, computation: () => 1 });
  pageCount = computed(() => Math.max(1, Math.ceil(this.visible().length / this.pageSize())));
  pageNumbers = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));
  pageItems = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.visible().slice(start, start + this.pageSize());
  });

  searchBox = viewChild.required<ElementRef<HTMLInputElement>>('searchBox');

  focusSearch() {
    this.searchBox().nativeElement.focus();
  }

  toggleWishlist(toy: Product) {
    const wasLiked = this.wishlist.has(toy.id);
    this.wishlist.toggle(toy.id);
    // A snackbar is a small message at the bottom. "Undo" flips it back.
    this.snackBar
      .open(
        wasLiked
          ? $localize`:@@home.removed:Removed ${toy.name}:name:`
          : $localize`:@@home.saved:Saved ${toy.name}:name: ❤️`,
        $localize`:@@home.undo:Undo`,
        { duration: 4000 },
      )
      .onAction()
      .subscribe(() => this.wishlist.toggle(toy.id));
  }

  onAdded(event: AddedEvent) {
    this.cart.add(event.product, event.quantity);
    this.lastAdded.set(`${event.quantity} × ${event.product.name}`);
  }
}
