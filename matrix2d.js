// Array.equals from http://stackoverflow.com/a/14853974
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

if (Number.prototype.add) {
	console.warn("Overriding existing numeric.prototype.add")
}

Number.prototype.add = function(other) {
	if (other instanceof Matrix2D) {
		return other.add(this+0)
	}
	else {
		return this + other
	}
}

Number.prototype.subtract = function(other) {
	if (other instanceof Matrix2D) {
		return other.reverse_subtract(this+0)
	}
	else {
		return this - other
	}
}

Number.prototype.multiply = function(other) {
	if (other instanceof Matrix2D) {
		return other.multiply(this+0)
	}
	else {
		return this * other
	}
}

Number.prototype.divide = function(other) {
	if (other instanceof Matrix2D) {
		return other.reverse_divide(this+0)
	}
	else {
		return this / other
	}
}

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

class Matrix2D {
	constructor(data) {
		if (data instanceof Matrix2D)
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
				throw "Error: Matrix2D constructor: wrong shape"
			}
			this.data = data
			this.shape = [data.length, data[0].length]
		}
		this._dispatch_scalarity = this._dispatch_scalarity.bind(this)
		this._element_wise_operation = this._element_wise_operation.bind(this)
		this._scalar_operation = this._scalar_operation.bind(this)
	}

	_dispatch_scalarity(other) {
		if (other instanceof Array || other instanceof Matrix2D) {
			return this._element_wise_operation
		}
		else if (typeof other === "number") {
			return this._scalar_operation
		}
		else {
			throw "Error: operation not available between Matrix2D and " + other
		}
	}

	_element_wise_operation(op, other) {
		other = new Matrix2D(other)
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
		return new Matrix2D(res)
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
		return new Matrix2D(res)
	}

	_unary_operation(op) {
		var res = []
		for (var i = 0; i < this.shape[0]; ++i)
		{
			res.push([])
			for (var j = 0; j < this.shape[1]; ++j)
			{
				res[i].push(op(this.data[i][j]))
			}
		}
		return new Matrix2D(res)
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

	_negate(a) {
		return -a
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

	negate() {
		return this._unary_operation(this._negate)
	}

	reverse_subtract(other) {
		return this.negate().add(other)
	}

	reverse_divide(other) {
		return this.map((x) => other / x)
	}

	map(fn, other) {
		if (!other) {
			return this._unary_operation(fn)
		}
		else {
			return this._element_wise_operation(fn, other)
		}
	}
}

module.exports = Matrix2D