const { default: testmodule } = require('../src/js/testmodule');

const arr = [4, 5, 6, 7];

test('Check test module', () => {
	arr.map(el => {
		return expect(testmodule(el)).toBe(el ** 4);
	});
});
