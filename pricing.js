function normalizePriceUnit(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'per night') return 'per night';
  if (normalized === 'per person' || normalized === 'per-person' || normalized === 'per person(s)') return 'per person';
  return 'per guest';
}

function getPriceUnitLabel(value) {
  const normalized = normalizePriceUnit(value);
  if (normalized === 'per night') return '/ night';
  if (normalized === 'per person') return '/ person';
  return '/ guest';
}

function getPriceUnitDisplay(value) {
  const normalized = normalizePriceUnit(value);
  if (normalized === 'per night') return 'Per Night';
  if (normalized === 'per person') return 'Per Person';
  return 'Per Guest';
}

module.exports = {
  normalizePriceUnit,
  getPriceUnitLabel,
  getPriceUnitDisplay
};
