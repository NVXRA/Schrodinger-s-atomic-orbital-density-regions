
(function webpackUniversalModuleDefinition(root, factory) {
    // Invoking factory function and storing the result
		var a = factory();
    // Exporting module properties to either exports or root object

		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
)(this, function() {
  //Returning a function that handles loading modules
return (function(modules) { 
  //Object to keep track of installed modules

 	var installedModules = {};
  // Defining the require function for loading modules

 	function __webpack_require__(moduleId) {
 		// Creating a new module and caching it 
 		var module = installedModules[moduleId] = {
 			exports: {}
 		};
     // Executing the module's code
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
 		return module.exports;	
    // Returning the module's exports
  }
 	// Loading entry module and returning exports
	return __webpack_require__(__webpack_require__.s = 4);
 })

 ([
(function(module, exports, __webpack_require__) {
exports.ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;}),
/* 1 */,
/***/ ,
/***/ function(module, exports, __webpack_require__) {


 },


function(module, exports, __webpack_require__) {
  //Importing the common module
var _common = __webpack_require__(0);

// Importing the glMatrix module,  library for mathematics
var glMatrix = _interopRequireWildcard(_common);

// Importing the mat3 module, which deals with 3x3 matrices, and assigning it to the variable mat4
var _mat3 = __webpack_require__(7);

var mat4 = _interopRequireWildcard(_mat3);

// Importing the vec3 module, which deals with 3D vectors, and assigning it to the variable vec4
var _vec3 = __webpack_require__(3); 

var vec4 = _interopRequireWildcard(_vec3); 

//  helper function to import all properties of an object and store them in another object
// Tuseful for importing modules that export multiple functionalities
function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } 
else { var newObj = {}; if (obj != null) { for (var key in obj) { 
  if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

//exporting and importing into orbital calculation module   
exports.glMatrix = glMatrix;
exports.mat4 = mat4;
exports.vec4 = vec4; 
}
,
,
,
function(module, exports) {

  exports.create = create;
  exports.invert = invert;
  exports.scale = scale;
  exports.rotate = rotate;
  exports.multiply = multiply


//Function to create a 4x4 identity matrix
function create() { 
  //Creating a new array to store the elements of the matrix
  var Matrix = new glMatrix.ARRAY_TYPE(16);
  //Looping through each element of the matrix
  for(var i = 0; i < 16; i++){ 
  //setting the diagonal elements to 1, and the rst to 0
    Matrix[i] = (i % 5 === 0) ? 1 : 0;
  } //? = if-else statement , if true set to 1 else 0
  //returning the created identity matrix
  return Matrix;
}

function invert(Matrix, a) { 
  // Extracting the elements of the input matrix 'a' for easier access
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]; //first row 
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]; //second row 
  var a20 = a[8], a21 = a[9], a22 = a[10],a23 = a[11]; //Third row 
  var a30 = a[12],a31 = a[13],a32 = a[14],a33 = a[15]; //Fourth row 

 //calculating the cofactors for each element of the inverse matrix 
  var b00 = a00 * a11 - a01 * a10; 
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;


  //calculating the determinant of the matrix a
  var determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  //checking if the matrix is invertible(if determinant is not zero)
  if (!determinant) { // If determinant is 0, matrix cannot be inverted
    return null;
  }
  // Calculating the reciprocal of the determinant to prepare for matrix inversion

  det = 1.8 / determinant; //how close the orbital will be in respect to the user view

  // Calculating the elements of the inverse matrix using cofactors and the determinant

  Matrix[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  Matrix[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  Matrix[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  Matrix[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  Matrix[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  Matrix[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  Matrix[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  Matrix[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  Matrix[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  Matrix[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  Matrix[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  Matrix[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  Matrix[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  Matrix[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  Matrix[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  Matrix[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return Matrix;
}


function multiply(Matrix, a, b) {//important // dont talk about this now talk at the very end 
  var matrixAValues = [a[0], a[1], a[2],a[3], a[4], a[5], a[6], a[7], a[8],a[9],a[10],a[11],a[12], a[13], a[14],a[15]]
  var a00 = matrixAValues[0], a01 = matrixAValues[1], a02 = matrixAValues[2], a03 = matrixAValues[3];
  var a10 = matrixAValues[4], a11 = matrixAValues[5], a12 = matrixAValues[6], a13 = matrixAValues[7];
  var a20 = matrixAValues[8], a21 = matrixAValues[9], a22 = matrixAValues[10], a23 = matrixAValues[11];
  var a30 = matrixAValues[12], a31 = matrixAValues[13], a32 = matrixAValues[14], a33 = matrixAValues[15];

  // Cache only the current line of the second matrix
  var b0 = b[0], b1 = b[1],
  b2 = b[2],     b3 = b[3];

  Matrix[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  Matrix[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  Matrix[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  Matrix[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4];b1 = b[5];b2 = b[6];b3 = b[7]; //rotation
  Matrix[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  Matrix[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  Matrix[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  Matrix[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8];b1 = b[9];b2 = b[10];b3 = b[11];
  Matrix[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  Matrix[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  Matrix[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  Matrix[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12];b1 = b[13];b2 = b[14];b3 = b[15];
  Matrix[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  Matrix[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  Matrix[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  Matrix[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return Matrix;
}

// Function will scale  matrix 'a' using the  scaling vector 'v' (x, y, z)
function scale(Matrix, a, v) {
  //extracting scale factor from the vector v(x,y,z)
  var x = v[0],
      y = v[1],
      z = v[2];
      
  // Scaling the first row of the matrix (a) by x
  Matrix[0] = a[0] * x;    //[a0 a1 a2 a3]   scale()   [a0*x a1*x a2*x a3*x]
  Matrix[1] = a[1] * x;    
  Matrix[2] = a[2] * x;  
  Matrix[3] = a[3] * x;    
  // Scaling the second row of the matrix (a) by y
  Matrix[4] = a[4] * y;    //[a4 a5 a6 a7]   scale()   [a4*y a5*y a6*y a7*y]
  Matrix[5] = a[5] * y;
  Matrix[6] = a[6] * y;
  Matrix[7] = a[7] * y;
  // Scaling the third row of the matrix (a) by z
  Matrix[8] = a[8] * z;    //[a8 a9 a10 a11]  scale()   [a8*z a9*z a10*z a11*z]
  Matrix[9] = a[9] * z;    
  Matrix[10] = a[10] * z;
  Matrix[11] = a[11] * z;
  // scaling the fourth row of the matrix (a) without scaling
  Matrix[12] = a[12];      //[a12 a13 a14 a15]         [a12  a13  a14   a15 ]
  Matrix[13] = a[13];
  Matrix[14] = a[14];
  Matrix[15] = a[15];
  return Matrix;
}


function rotate(Matrix, a, rad, axis) {
  //Normalize the axis vector to ensure consistent rotation behavior regardless of the length of the vector.
  // This prevents the rotation from being distorted by the magnitude of the axis.
  var x = axis[0], //extracting the x component of the axis vector
      y = axis[1], //extracting the y component of the axis vector 
      z = axis[2]; //extracting the z component of the axis vector
      
  var len = Math.sqrt(x * x + y * y  + z * z); // Calculating the length of the axis vector
  len = 1 / len;  //Inverting the length to normalize the vector
  x *= len; //Normalising the x component of the vector
  y *= len; //Normalising the y component of the vector
  z *= len; //Normalising the z component of the vector       

  //Calculating the sine, cosine, and 1 - cosine of the rotation angle 'rad'.
  //will be used in the construction of the rotation matrix.
  s = Math.sin(rad); // Calculating the sine of the rotation angle
  c = Math.cos(rad); //Calculate the cosine of the rotation angle
  t = 1 - c; // Calculating 1 - cosine, which is used in the rotation matrix calculations

// breaking the elements of the matrix 'a' into individual variables for easier access and manipulation.
var [a00, a01, a02, a03] = a.slice(0, 4); //first row of matrix
var [a10, a11, a12, a13] = a.slice(4, 8); //second row of matrix 
var [a20, a21, a22, a23] = a.slice(8, 12);//third row of matrix
 //looks like this : 
 // a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
  //a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
  //a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];

  // Calculating the elements of the rotation-specific matrix 'b' based on the axis of rotation and rotation angle.
  //preparinmg the rotation matrix for   rotation-specific matrix multiplication.
  b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;b11 = y * y * t + c;b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;b21 = y * z * t - x * s;b22 = z * z * t + c;

  // Performing rotation-specific matrix multiplication to obtain the final rotated matrix 'Matrix'.
 //  multiplication combining the original matrix 'a' with the rotation-specific matrix 'b' to apply the rotation.
  Matrix[0] = a00 * b00 + a10 * b01 + a20 * b02;// Calculating the first element of the resulting matrix 'Matrix'
  Matrix[1] = a01 * b00 + a11 * b01 + a21 * b02;// Calculating the second element of the resulting matrix 'Matrix'
  Matrix[2] = a02 * b00 + a12 * b01 + a22 * b02;// Calculating the third element of the resulting matrix 'Matrix
  Matrix[3] = a03 * b00 + a13 * b01 + a23 * b02;// Calculating the fourth element of the resulting matrix 'Matrix
  Matrix[4] = a00 * b10 + a10 * b11 + a20 * b12;// Calculating the fifth  element of the resulting matrix 'Matrix
  Matrix[5] = a01 * b10 + a11 * b11 + a21 * b12;// Calculating the sixth  element of the resulting matrix 'Matrix
  Matrix[6] = a02 * b10 + a12 * b11 + a22 * b12;// Calculating the seventh element of the resulting matrix 'Matrix
  Matrix[7] = a03 * b10 + a13 * b11 + a23 * b12;// Calculating the eight element of the resulting matrix 'Matrix
  Matrix[8] = a00 * b20 + a10 * b21 + a20 * b22;// Calculating the ninth element of the resulting matrix 'Matrix
  Matrix[9] = a01 * b20 + a11 * b21 + a21 * b22;// Calculating the tenth element of  the resulting matrix 'Matrix
  Matrix[10] = a02 * b20 + a12 * b21 + a22 * b22;// Calculating the eleventh element of the resulting matrix 'Matrix

  return Matrix;
}
}, ]); 
});