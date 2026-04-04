export function formatCurrency(amountCents: number, currencyCode = 'EUR', locale = 'en-IE') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amountCents / 100);
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
