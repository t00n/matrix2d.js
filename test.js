var matrix = require('matrix-js')
var Matrix = require('./matrix.js')

function random_matrix(n) {
	var res = []
	for (var i = 0; i < n; ++i)
	{
		res.push([])
		for (var j = 0; j < n; ++j)
		{
			res[i].push(Math.random())
		}
	}
	return res
}

MATRIX_SIZE = 1000
N_TEST = 10

console.log("custom")
var now = Date.now()
for (var i = 0; i < N_TEST; ++i) {
	var a = new Matrix(random_matrix(MATRIX_SIZE))
	var b = new Matrix(random_matrix(MATRIX_SIZE))
	a.multiply(b)
}
console.log(Date.now() - now)

console.log("matrix-js")
var now = Date.now()
for (var i = 0; i < N_TEST; ++i) {
	var a = matrix(random_matrix(MATRIX_SIZE))
	var b = matrix(random_matrix(MATRIX_SIZE))
	a.mul(b)
}
console.log(Date.now() - now)

function assertThrows(fn, exception) {
	try {
		fn()
	}
	catch(err) {
		console.assert(err === exception)
	}
}

function test_element_wise() {
	var A = new Matrix([[0, 1], [2, 3]])
	var B = new Matrix([[4, 5], [6, 7]])
	console.assert(A.add(B).data.equals([[4, 6], [8, 10]]))
	console.assert(A.subtract(B).data.equals([[-4, -4], [-4, -4]]))
	console.assert(A.multiply(B).data.equals([[0, 5], [12, 21]]))
	console.assert(A.divide(B).data.equals([[0, 1/5], [2/6, 3/7]]))
}
function test_scalar() {
	var A = new Matrix([[0, 1], [2, 3]])
	var b = 5
	console.assert(A.add(b).data.equals([[5, 6], [7, 8]]))
	console.assert(A.subtract(b).data.equals([[-5, -4], [-3, -2]]))
	console.assert(A.multiply(b).data.equals([[0, 5], [10, 15]]))
	console.assert(A.divide(b).data.equals([[0, 1/5], [2/5, 3/5]]))
}
function test_wrong_shape() {
	assertThrows(() => new Matrix([[0, 1], [1]]), "Error: Matrix constructor: wrong shape")
	assertThrows(() => new Matrix([[0], [1, 2]]), "Error: Matrix constructor: wrong shape")
	var A = new Matrix([[0], [1]])
	var B = new Matrix([[0, 1], [1, 2]])
	assertThrows(() => A.add(B), "Error: matrices do not have the same shape")
}
function test_dispatch() {
	var A = new Matrix([[0, 1], [1, 2]])
	var B = [[0, 1], [1, 2]]
	console.assert(A.add(B).equals([[0, 2], [2, 4]]))
	assertThrows(() => A.add("lol"), "Error: operation not available between Matrix and lol")
	assertThrows(() => A.add({}), "Error: operation not available between Matrix and [object Object]")
	assertThrows(() => A.add(undefined), "Error: operation not available between Matrix and undefined")
	assertThrows(() => A.add(true), "Error: operation not available between Matrix and true")
}
test_element_wise()
test_scalar()
test_wrong_shape()
test_dispatch()