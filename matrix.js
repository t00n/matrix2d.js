var matrix = require('matrix-js')
// var Matrix = require('matrixjs'); // does not have element wise product

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

class Matrix {
	constructor(data) {
		if (data instanceof Matrix)
		{
			this.data = data.data
			this.shape = data.shape
		}
		else
		{
			if (! data.length
				|| ! data[0].length
				|| data.some((row) => row.length !== data[0].length))
			{
				throw "Error: Matrix constructor: wrong shape"
			}
			this.data = data
			this.shape = [data.length, data[0].length]
		}
		this._dispatch_scalarity = this._dispatch_scalarity.bind(this)
		this._element_wise_operation = this._element_wise_operation.bind(this)
		this._scalar_operation = this._scalar_operation.bind(this)
	}

	_dispatch_scalarity(other) {
		if (other instanceof Array || other instanceof Matrix) {
			return this._element_wise_operation
		}
		else if (typeof other === "number") {
			return this._scalar_operation
		}
		else {
			throw "Error: operation not available between Matrix and " + other
		}
	}

	_element_wise_operation(op, other) {
		other = new Matrix(other)
		if (! other.shape.equals(this.shape)) {
			throw "Error: matrices do not have the same shape"
		}
		var res = []
		for (var i = 0; i < this.shape[0]; ++i)
		{
			res.push([])
			for (var j = 0; j < this.shape[1]; ++j)
			{
				res[i].push(op(this.data[i][j], other.data[i][j]))
			}
		}
		return new Matrix(res)
	}

	_scalar_operation(op, other) {
		var res = []
		for (var i = 0; i < this.shape[0]; ++i)
		{
			res.push([])
			for (var j = 0; j < this.shape[1]; ++j)
			{
				res[i].push(op(this.data[i][j], other))
			}
		}
		return new Matrix(res)
	}

	_plus(a, b) {
		return a + b
	}

	_minus(a, b) {
		return a - b
	}

	_mul(a, b) {
		return a * b
	}

	_div(a, b) {
		return a / b
	}

	_equals(a, b) {
		return a === b
	}

	add(other) {
		var meta_op = this._dispatch_scalarity(other)
		return meta_op(this._plus, other)
	}

	subtract(other) {
		var meta_op = this._dispatch_scalarity(other)
		return meta_op(this._minus, other)
	}

	multiply(other) {
		var meta_op = this._dispatch_scalarity(other)
		return meta_op(this._mul, other)
	}

	divide(other) {
		var meta_op = this._dispatch_scalarity(other)
		return meta_op(this._div, other)
	}

	equals(other) {
		var meta_op = this._dispatch_scalarity(other)
		var res = meta_op(this._equals, other)
		if (res)
			return res.data.every((row) => row.every((cell) => cell))
	}
}

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