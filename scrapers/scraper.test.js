const {findDetailsMatch} = require('./facebook').test;

it('should extract details data', function () {
  const details = [
    'Zaposlitev: Zavod za gozdove Slovenije',
    'Študij: Gozdarstvo na Biotehniška fakulteta Ljubljana',
    'Šolanje: Srednja gozdarska šola Postojna',
    'Iz kraja Tolmin'
  ];
  let match = findDetailsMatch(/Zaposlitev: /, details);
  expect(match).toEqual('Zavod za gozdove Slovenije');
});