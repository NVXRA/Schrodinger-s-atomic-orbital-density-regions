//creating a factorial function recursively
//will calculate a factorial of quantum states value
function factorial(quantumStateNumber) {
  if (!Number.isInteger(quantumStateNumber)) {
    // If the quantum state number is not an integer, will display an error message and return undefined.
    console.error("Error output: quantum state value must be an integer.");
    return undefined;
}
  //checking to see if the value is either 1 or 0 since it is not possible to find a factorial 
  //of 1 or 0
    if (quantumStateNumber === 0 || quantumStateNumber === 1) {
      return 1;
    } else {

      // If the quantum state number is greater than 1, calculating the factorial recursively by multiplying
      // the quantum state number by the factorial of (quantumStateNumber - 1).
      return quantumStateNumber * factorial(quantumStateNumber - 1);
    }
  }
  
// creating a function named 'radialWaveFunctionNormalisation' which takes two parameters: 'Principal' and 'azimuthal'
function radialWaveFunctionNormalisation(Principal, azimuthal) {
  // Checking if Principal and azimuthal are non-negative integers
  if (!Number.isInteger(Principal) || Principal < 0 || !Number.isInteger(azimuthal) || azimuthal < 0) {
    // If not, returning an error message
    return "Invalid input: Principal and azimuthal must be non-negative integers.";
  }
  
  return (
    // Csquare root of the ratio of two expressions:
    Math.sqrt(
      // Numerator: 4 times the factorial of (Principal + azimuthal)
      (4 * factorial(Principal + azimuthal))
      // Denominator: Principal cubed times the factorial of (Principal - azimuthal - 1)
      / (Principal * Principal * Principal * factorial(Principal - azimuthal - 1))
    )
    // Divide by the factorial of (2 * azimuthal + 1)
    / factorial(2 * azimuthal + 1)
  );
}


// Define the sphericalNorm function
function sphericalHarmonicsWaveNormalisation(azimuthal, magnetic) {
  var normalisedSphericalNormForm = Math.sqrt(
    ((2 * azimuthal + 1) * factorial(azimuthal - magnetic)) /
      (4 * Math.PI * factorial(azimuthal + magnetic))
  );
  return normalisedSphericalNormForm;
}


function binomial(n, k) {
  // Initialize the result to 1
  var result = 1;
  // Looping through the values of i from 0 to k-1
  for (var i = 0; i != k; i++) {
    // Multiplying the result by n and decrement n
    result *= n;
    n -= 1;
  }
  // Dividing the result by the factorial of k and return it
  return result / factorial(k);
}

function evenOddPowExpr(x, k) {
    //important
    var power = k % 2 == 0 ? "evenPowerPolynomialExpression" : "oddPowerPolynomialExpression";
    return power + "(" + x + ", " + k + ".0)";
}
  


function associatedLegendrePolynomial(l, m) {
 
  var k; 
  //initialising the polynomial espression with its leading term 
  //This term involves a constant coefficient (2^l) multiplied by powers of sin(theta) and cos(theta), represented by the evenOddPowExpr function, and a constant factor (0.0) at the end.
  // The power of sin(theta) is determined by the quantum number 'l', which represents the degree of the polynomial.
  // This line sets up the initial structure of the polynomial expression before adding individual terms.

  var result = Math.pow(2, l) + ".0*" + evenOddPowExpr("sinth", l) + "*(0.0"; 
  //have a constant coefficient (2^l) multiplied by powers of sin(theta) and cos(theta), 
  //represented by the evenOddPowExpr function, and a constant factor (0.0) at the end.
  // The power of sin(theta) is determined by the quantum number 'l', for the degree of the polynomial.
  // This line sets up the initial structure of the polynomial expression before adding individual terms.

  //iterating through the term of the polynomial, starting from degree m up to degree l
  for (k = m; k <= l; k++) {8
    //calculating the normailsation factor "c" using factorial and the binomial function that i programmed 
    //earlier
    var c = factorial(k) / factorial(k - m); // factor determined by dividing the factorial of the current degree 'k' 
    //by the factorial of the difference between 'k' and the starting degree 'm'.

    c *= binomial(l, k) * binomial((l + k - 1) / 2, l);
    // If the coefficient is non-zero, add the term to the polynomial expression
    // validating If the coefficient is zero, it means the contribution of this term to the polynomial wont work, 
    //so skip adding it
    if (c != 0)
    //This line constructs each term of the associated Legendre polynomial by multiplying the coefficient 'c' with the corresponding power of cos(theta), 
  //determined by the difference between the current degree 'k' and the starting degree 'm'.
      result += "+ " + convertIntToFloatString(c) + "*" + evenOddPowExpr("costh", k - m);
  }
    // Closing the parentheses and return the complete polynomial expression
  return result + ")";
}



function powExpr(x, n) {
  if (n == 0) return "(1.0)";
  if (n == 1) return "(" + x + ")";
  return "pow(" + x + ", " + n + ".0)";
}

// same as powExpr but works if first argument is negative


function convertIntToFloatString(x) {
  // Checking if x is already a float type or a string representing a float
  if (typeof x === 'number' && Number.isInteger(x)) {
    // Converting the number to a string
    var intToFloatString = x.toString();
    // Checking if the string representation contains a decimal point
    if (intToFloatString.indexOf(".") < 0) {
      // If not, appending ".0" to the string
      intToFloatString += ".0";
    }
    // Returning the modified string
    return intToFloatString;
  } else {
    // If x is already a float or a string representing a float, returning it as it is
    return x.toString();
  }
}


function confluentHypergeometricFunction(Principal, azimuthal, distanceFromCentre) {
  var risingFactorial = 1;
  var result = 1;
  var convergenceThreshold = 1e-10; // threshold for convergence 

  //Iterating through a maximum of 1000 iterations
  for (var n = 1; n <= 1000; n++) {
    //calculating the next term of the rising factorial 
    risingFactorial *= (Principal * distanceFromCentre) / (n * azimuthal);
    
    //checking if the absolute value of the rising factorial falls below the convergence 
    //threshold region
    if (Math.abs(risingFactorial) < convergenceThreshold) 
    //if convergence is reached then result is returned
      return result;

    // Incrementing the Principal and azimuthal quantum numbers for the next iteration
    result += risingFactorial;
    Principal++;
    azimuthal++;
  }
  return result ; 
}


export {sphericalHarmonicsWaveNormalisation,
  radialWaveFunctionNormalisation,
  factorial,
  binomial,
  associatedLegendrePolynomial,
  powExpr,
  evenOddPowExpr,
  convertIntToFloatString,confluentHypergeometricFunction
};
//  // standard is -a,b and a,b
    //when set to a, lobe is formed rather than the pattern
    //same goes for -a
    //b represent the shaded region, think of it being cricle
    //when it sliced in half, you get two lobes adjacent to one another 
    //thats the structure of the orbital regions i want
