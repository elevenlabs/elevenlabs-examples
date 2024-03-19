const checkPrice = require('../functions/checkPrice');

test('Expect Airpods Pro to cost $249', () => {
  expect(checkPrice({model: 'airpods pro'})).toBe('{"price":249}');
});

test('Expect Airpods Max to cost $549', () => {
  expect(checkPrice({model: 'airpods max'})).toBe('{"price":549}');
});

test('Expect all other models to cost $149', () => {
  expect(checkPrice({model: 'anything'})).toBe('{"price":149}');
});