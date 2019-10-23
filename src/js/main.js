import testmodule from './testmodule';

const test = 5;
testmodule(test);

const arr = [1, 2, 3];
const newArr = [...arr, 3];

const promise = new Promise((resolve, reject) => {
	setTimeout(() => {
		resolve('result');
	}, 1000);
});

promise.then(
	result => {
		alert(`Fulfilled: ${result}`);
	},
	error => {
		alert(`Rejected: ${error}`);
	}
);
