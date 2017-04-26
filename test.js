var Matrix2D = require('./matrix2d.js')

function test_speed() {
	var matrix = require('matrix-js')

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

	var now = Date.now()
	for (var i = 0; i < N_TEST; ++i) {
		var a = new Matrix2D(random_matrix(MATRIX_SIZE))
		var b = new Matrix2D(random_matrix(MATRIX_SIZE))
		a.multiply(b)
	}
	var my_time = Date.now() - now

	var now = Date.now()
	for (var i = 0; i < N_TEST; ++i) {
		var a = matrix(random_matrix(MATRIX_SIZE))
		var b = matrix(random_matrix(MATRIX_SIZE))
		a.mul(b)
	}
	var matrix_js_time = Date.now() - now
	console.assert(my_time < matrix_js_time)
}

function assertThrows(fn, exception) {
	var good = false
	try {
		fn()
	}
	catch(err) {
		console.assert(err === exception)
		good = true
	}
	if (! good) {
		throw fn + " did not throw " + exception
	}
}

function test_element_wise() {
	var A = new Matrix2D([[0, 1], [2, 3]])
	var B = new Matrix2D([[4, 5], [6, 7]])
	console.assert(A.add(B).data.equals([[4, 6], [8, 10]]))
	console.assert(A.subtract(B).data.equals([[-4, -4], [-4, -4]]))
	console.assert(A.multiply(B).data.equals([[0, 5], [12, 21]]))
	console.assert(A.divide(B).data.equals([[0, 1/5], [2/6, 3/7]]))
}
function test_scalar() {
	var A = new Matrix2D([[0, 1], [2, 3]])
	var b = 5
	console.assert(A.add(b).data.equals([[5, 6], [7, 8]]))
	console.assert(A.subtract(b).data.equals([[-5, -4], [-3, -2]]))
	console.assert(A.multiply(b).data.equals([[0, 5], [10, 15]]))
	console.assert(A.divide(b).data.equals([[0, 1/5], [2/5, 3/5]]))
}
function test_wrong_shape() {
	assertThrows(() => new Matrix2D([[0, 1], [1]]), "Error: Matrix2D constructor: wrong shape")
	assertThrows(() => new Matrix2D([[0], [1, 2]]), "Error: Matrix2D constructor: wrong shape")
	var A = new Matrix2D([[0], [1]])
	var B = new Matrix2D([[0, 1], [1, 2]])
	assertThrows(() => A.add(B), "Error: matrices do not have the same shape")
	assertThrows(() => new Matrix2D([]), "Error: Matrix2D constructor: wrong shape")
	assertThrows(() => new Matrix2D([[]]), "Error: Matrix2D constructor: wrong shape")
	assertThrows(() => new Matrix2D([0]), "Error: Matrix2D constructor: wrong shape")
}
function test_dispatch() {
	var A = new Matrix2D([[0, 1], [1, 2]])
	var B = [[0, 1], [1, 2]]
	console.assert(A.add(B).equals([[0, 2], [2, 4]]))
	assertThrows(() => A.add("lol"), "Error: operation not available between Matrix2D and lol")
	assertThrows(() => A.add({}), "Error: operation not available between Matrix2D and [object Object]")
	assertThrows(() => A.add(undefined), "Error: operation not available between Matrix2D and undefined")
	assertThrows(() => A.add(true), "Error: operation not available between Matrix2D and true")
	assertThrows(() => A.add(null), "Error: operation not available between Matrix2D and null")
}
function test_equals() {
	var A = new Matrix2D([[0, 1, 2], [2, 3, 4]])
	console.assert(A.add([[0, 1, 2], [2, 3, 4]]))
	console.assert(A.equals([[0, 1, 2], [2, 3, 5]]) == false)
	assertThrows(() => A.equals([[0], [1]]), "Error: matrices do not have the same shape")
}
test_element_wise()
test_scalar()
test_wrong_shape()
test_dispatch()
test_equals()

// test_speed()