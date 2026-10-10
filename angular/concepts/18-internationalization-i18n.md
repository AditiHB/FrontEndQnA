# 18. Internationalization (i18n)

> **Like I'm 5:** i18n lets your app speak many languages. You write each word in a labelled box (a key), and the app fills in the right language for each visitor.

## Key concepts
- **i18n**: preparing the app for multiple languages and regions.
- **Localization (l10n)**: providing translated content and locale-specific formats.
- Angular offers two approaches:
  - **Built-in i18n** (`@angular/localize`): compile-time translation, one build per locale.
  - **Runtime translation** (for example `@ngx-translate/core`): loads translation files at runtime.

## Built-in i18n: mark text

```html
<h1 i18n="@@welcomeTitle">Welcome to Orders</h1>
<p i18n="Shown on checkout">Total: {{ total | currency }}</p>
<span i18n>{count, plural, =0 {No items} =1 {One item} other {{{count}} items}}</span>
```

## Setup

```bash
ng add @angular/localize
ng extract-i18n --output-path src/locale
```

Create translation files (`messages.fr.xlf`) and configure locales in `angular.json`:

```json
"i18n": {
  "sourceLocale": "en-US",
  "locales": {
    "fr": "src/locale/messages.fr.xlf"
  }
}
```

Build and serve per locale:

```bash
ng build --localize
ng serve --configuration=fr
```

## Locale formatting

```ts
// main.ts
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);
```

```html
{{ price | currency:'EUR' }}
{{ date | date:'longDate' }}
```

Use `LOCALE_ID` to set the default locale in dependency injection.

## Runtime translation (ngx-translate style)

```html
<button>{{ 'ACTIONS.SAVE' | translate }}</button>
```

Load JSON files per language, and switch with `translate.use('fr')`.

## Pluralization and interpolation

```html
{{ count, plural, =0 {no messages} =1 {one message} other {{{ count }} messages} }}
```

## Right-to-left (RTL)
- Set `dir="rtl"` on the document, and use logical CSS properties (`margin-inline-start`) instead of `margin-left`.

## Important points
- Never concatenate translated strings in code. Use placeholders.
- Keep translation keys stable, and review missing translations in CI.
- Dates, numbers, and currencies must use locale-aware pipes or `Intl`.
