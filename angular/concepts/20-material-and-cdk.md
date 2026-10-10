# 20. Angular Material & CDK

> **Like I'm 5:** Material is a box of ready-made LEGO bricks like buttons and tables. The CDK is the set of gears and instructions underneath, so you can build your own bricks.

## Key concepts
- **Angular Material**: a set of ready-made UI components that follow Material Design.
- **Angular CDK** (Component Dev Kit): behavior building blocks without styles, such as overlays, drag and drop, virtual scrolling, layout, and accessibility utilities.
- Material is built on top of the CDK. You can use the CDK alone to build your own design system.

## Setup

```bash
ng add @angular/material     # choose a theme, typography, and animations
```

## Common Material components

```ts
imports: [MatButtonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatFormFieldModule, MatInputModule]
```

```html
<mat-form-field appearance="outline">
  <mat-label>Search</mat-label>
  <input matInput [formControl]="search" />
</mat-form-field>

<button mat-raised-button color="primary" (click)="save()">Save</button>
```

## Table with sorting and paging

```ts
dataSource = new MatTableDataSource<Order>([]);
@ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild(MatSort) sort!: MatSort;

ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
}
```

```html
<table mat-table [dataSource]="dataSource" matSort>
  <ng-container matColumnDef="id">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
    <td mat-cell *matCellDef="let o">{{ o.id }}</td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="cols"></tr>
  <tr mat-row *matRowDef="let row; columns: cols"></tr>
</table>
<mat-paginator [pageSizeOptions]="[10, 25, 50]" />
```

For server-side paging, handle the `page` and `sort` events and call the API instead of using `MatTableDataSource`.

## Dialog

```ts
private dialog = inject(MatDialog);

openEdit(order: Order) {
  this.dialog.open(EditOrderDialog, { data: order, width: '480px' })
    .afterClosed()
    .subscribe(result => { if (result) this.reload(); });
}
```

## CDK: drag and drop

```html
<div cdkDropList (cdkDropListDropped)="drop($event)">
  @for (task of tasks; track task.id) {
    <div cdkDrag>{{ task.title }}</div>
  }
</div>
```

```ts
drop(event: CdkDragDrop<Task[]>) {
  moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
}
```

## CDK: virtual scrolling

```html
<cdk-virtual-scroll-viewport itemSize="48" class="list">
  <div *cdkVirtualFor="let item of items; trackBy: trackById">{{ item.name }}</div>
</cdk-virtual-scroll-viewport>
```

## CDK: layout and responsiveness

```ts
private breakpoints = inject(BreakpointObserver);
isMobile = toSignal(
  this.breakpoints.observe(Breakpoints.Handset).pipe(map(r => r.matches)),
  { initialValue: false },
);
```

## Theming

Define theme colors with Sass and the `mat.theme` mixin, and use CSS custom properties to support light and dark modes.

## Important points
- Import only the modules you use, or standalone components, to keep bundles small.
- Keep Material overrides in one global stylesheet. Avoid deep selectors (`::ng-deep`), which are deprecated.
- Use the CDK to build reusable behavior when Material does not fit your design.
