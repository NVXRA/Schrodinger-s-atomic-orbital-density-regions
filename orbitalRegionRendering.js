
var buffers;
var atomProgramInfo;
var glCanvas;
var stoppedCheck;
var animating = true;
var zoom3d = .23;
var principalQuantumNumber, magneticQuantumNumber, azimuthalQuantumNumber;
var gl;
var compiledStates;
const pi = Math.PI;
var deltaTimeWithoutSpeed;
var zoomRate = 0;
var autoZooming;
var rotationMatrix = mat4.create(); //creating a new identity matrix for rotation 
var inverseRotationMatrix = mat4.create(); //creating a new identity matrix for inverse rotation
var states;
var maximumStateCombinations;
 
var bestBrightness;
var userBrightMult = 0.0005;
var definedBrightnessValue;
var time = 0;
var whenMouseDown = 0,
lastMouseX,
lastMouseY;
  import {  sphericalHarmonicsWaveNormalisation, radialWaveFunctionNormalisation, associatedLegendrePolynomial,powExpr, convertIntToFloatString,confluentHypergeometricFunction } from './schrodingerCalculationsModule.js';
  import {  createPhaseTexture  } from './characteristicsModule.js';


function getById(x) {
  return document.getElementById(x);
}

function addMouseEvents(canvas) {
  canvas.onmousedown = function (event) {
    //setting isMouseDown flag when the mouse button is pressed
    whenMouseDown = 1;
    //storing the current mouse position as the lasy knonw position
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  };

  canvas.onmousemove = function (event) {
    if (whenMouseDown) {
      //checking if the mouse button is being pressed

      //calculating the change in the mouse position since the last mouse event 
      var deltaX = event.clientX - lastMouseX;
      var deltaY = event.clientY - lastMouseY;
      //updating the stored mouse position 
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;

      //Creating a temporary transformation matrix for rotation
      var mTemp = mat4.create();
      //will rotate the region around the y-axis based on horizontal movement
      mat4.rotate(mTemp, mTemp, deltaX * 0.01, [0, 1, 0]);
      //0.01 for the sensitivity of the mouse on the region
      //will rotate the region around the x-axis based on horizontal movement
      mat4.rotate(mTemp, mTemp, deltaY  * 0.01, [1, 0, 0]);
      mat4.multiply(rotationMatrix, mTemp, rotationMatrix);
    }

  };
  //scroll in case user wants to use a scroll wheel 
  canvas.addEventListener("wheel", function (event) { //event listener for scroll events 
    //adjusting the 3d zoom factor based on the scroll delta
    zoom3d *= Math.exp(-event.deltaY * 0.001); //zoom in or out based on the scroll direction
    //making sure that the zoom factor stays within a certain range to prevent extreme zoom
    zoom3d = Math.min(Math.max(zoom3d, 0.005), 500);
    
  });
}


function confluentHypergeometricFunctionExp(Principal, azimuthal ) { // creates a string  expresssion of what each individual state looks like 
  var result = "1.0";
  var risingFactorial = '1.0';
  for (var n = 1; n <= 17; n++) {
    if (Principal == 0) return result;
    var m = convertIntToFloatString(Principal / (n * azimuthal ));
    risingFactorial += "*" + m + "*rho";
    result += " + " + risingFactorial;
    Principal++;
    azimuthal ++;
  }
}

function confluentHypergeometricFunctionExpForNL(n, l) {
  return confluentHypergeometricFunctionExp(l + 1 - n, 2 * l + 2);
}








// creating shader to display current orbital density region based on user currrent quantum state states.
// creating a new orbtial density region when when the states change.
function setupOrbitalRendering(states) {              
  const vertexShaderSetup = `
  ///declares a 3d attribute '' to store vertex positions
  // This attribute receives vertex positions from atomProgramInfor code.

  //this will represent the position of each vertex in 3d space 
  
    attribute vec4 vertexPosition; 

  //Create a varying variable 'vPosition' to pass data between the vertex and fragment shaders.
  // essentially holds the 3D position of the vertex.  

    varying highp vec3 vertexPositionInUserViewSpace;
    
    void main(void) {
      //sets the vertex final position on the user's screen baseed on the position of 'aVertexPosition
      gl_Position = vertexPosition;

      // Assign the 3D position of the vertex to 'vPosition' for use in the fragment shader.
      vertexPositionInUserViewSpace = vertexPosition.xyz;
    }
  `;

  // vertex shader program for sliced

  const fragmentShaderSetup = ` 
    varying highp vec3 vertexPositionInUserViewSpace;
    // This variable passes information about the vertex position from the vertex shader to the fragment shader, crucial for rendering.


    uniform highp float zoomFactor;
    // Adjusts the zoom level per orbital change, controlling the magnification of the orbital structure.


    uniform highp float brightnessOfRegion; 
    //Modifies the brightness of the rendered orbital density region, allowing for visual adjustments.

    uniform sampler2D  textureOfRegion; 
    //Texture used for rendering the orbital density region, contains the actual data for the electron density pattern.

    uniform highp vec2 regionpatternPhases[phaseCountPerRegion]; 
    //Array storing phase data for different orbital configurations, influencing the orientation and shape of the orbital region.

    // If 'a' is less than 0, return the negative value of the result of raising the absolute value of 'a' to the power of 'b';
    // otherwise, return 'a' raised to the power of 'b'.
    highp float oddPowerPolynomialExpression(highp float a, highp float b) {
      return (a < 0.) ? -pow(-a, b) : pow(a, b);
    }

    highp float evenPowerPolynomialExpression(highp float a, highp float b) {
      // Return the result of raising the absolute value of 'a' to the power of 'b'.
      return pow(abs(a), b);
    }

  
  `;
  var fragmentShaderMain = `
      highp float radialDistance = length(v.xyz);
      //Calculates the radial distance (r) of the vertex position in 3D space from the origin.
      //As 'r' increases, it represents the expansion of the orbital density region outward from the nucleus.

      highp float xyProjectionLength = length(vec2(v.y));
      //Calculates the length of the XY component of the vertex position.
      //Represents the radius in the XY plane, influencing the size of the orbital in the XY direction.
      //increase will affects the spread of the orbital density region in the XY plane.

      //Calculating the cosine of the azimuthal angle (phi) in spherical coordinates.
      //As 'cosph' changes, it determines the distribution of electron density around the centre.
      //Increasing 'cosph' will lead to more concentrated electron density along centre.

      highp float sinph = v.y/xyProjectionLength;
      //Calculating the sine of the azimuthal angle (phi) in spherical coordinates.
      //Influences the lobes formed at a higher l,m in terms of density  
      //Higher values of 'sinph' will cause an increased electron density in lobe regions.

      highp float sinth = xyProjectionLength/radialDistance;
      //used in associatedLegendrepolynomial function
      //Calculates the sine of the polar angle (theta) in spherical coordinates.
      //Determines the vertical direction of the orbital density region.

      highp float costh = v.z/radialDistance;
     //used in associatedLegendrePolynomial function
     //Influences the distribution of electron density along the Z-axis.
     //Changes in 'costh' will affect the symmetry or orientation of lobes in the orbital.  

      highp vec2 val = vec2( 0.,0.);

        highp float rho = 0.0;
        //represents the scaling factor of the orbital density region
        //unused so far

 CALCVAL
        highp float valLength = length(val.st); 
        //Calculate the length (distance) of the 2D vector 'val' and store it in 'valLength'.
        

        colorAdjustment += vec4(texture2D(textureOfRegion, vec2(.5, .5)+ .01*val/valLength).rgb ,1.0)*valLength*valLength;
      // will change the color of the orbital density region based on texture data and adjustments.
      //valLength will affects the brightness of the rendered region.
        
  `;

  var FragmentShaderFinalStage = `
      colorAdjustment *= brightnessOfRegion; 
      //Adjusts the overall brightness of the orbital density region when rendered.
      //As brightnessOfRegion increases, it will enhance the brightness of the rendered colors uniformly.

      colorAdjustment *= max(1.0, max(colorAdjustment.r, max(colorAdjustment.g, colorAdjustment.b))); 
      //Determines the color of the outer region of the orbital density.
      // Finds the maximum value between 1.0 and the maximum of the red, green, and blue color components.
      //Ensures that the brightest component sets the overall brightness level for the entire region.      
      // Sets the final color of the fragment (pixel) to 'col' after the above is carried out.
      
      gl_FragColor = colorAdjustment;
      //Sets the final color of the fragment (pixel) to colorAdjustment.
      //  Ensures that the adjustments made to the color and brightness are applied to each fragment uniformly.
    }
  `; 

  
  // Fragment shader code for rendering the transformed orbital density region.
    // Incorporates transformations such as scaling and rotation to manipulate the orbital appearance. 
  var fragmentShaderTransformedOrbital =
    `
    uniform highp mat4 rotationMatrix; //The 'rotationMatrix' is a transformation matrix that influences how the vertex is rotated in 3D space.

    uniform highp mat4 dimensionMatrix;  // creating a 4x4 transformation matrix ('dimensionMatrix') that i will use to scale and 
    //adjust the position of the orbital density region in the user's view.

  ` +
  fragmentShaderSetup +
    `
    void main(void) {
      highp vec4 colorAdjustment = vec4(0., 0., 0., 1.);
      // Initialising the color adjustment variable 'colorAdjustment' to black.
      // This ensures that the initial color of the orbital density region is fully transparent,

      highp vec4 pos = dimensionMatrix * vec4(vertexPositionInUserViewSpace, 1.);
      // Transforming the vertex position from object space to user view space using 'dimensionMatrix'.
      // This should adjusts the position and scale of the orbital density region in the user's view,
      // ensuring it appears correctly relative to my viewer's perspective.


      for (highp float z = 0.0; z < 1.0; z += 1./80.) { 
        highp vec4 v = rotationMatrix * vec4(pos.xy, z, 0.);
        
       // Looping through a range of 'z' values to create an effect for each fragment representing the orbital density region.
       // 'z' controls the position along the user's z-axis, affecting the appearance of the orbital from different perspectives.
       // The loop iterates 64 times, incrementing 'z' in small steps to ensure smooth transitions and accurate rendering.
       // For each iteration, the vertex position 'pos' is adjusted using 'rotationMatrix' to control its rotation.
       // The resulting 'v' represents the adjusted position of the vertex in the 3D scene, influencing the final appearance of the orbital density region.
         
            
           

   ` +
   fragmentShaderMain +  
    "}" +
    FragmentShaderFinalStage;   
  
// Initialising the fragment shader source code to 'fragmentShaderTransformedOrbital'.
  var fragmentShaderSourceCode =  fragmentShaderTransformedOrbital;
  

  const waveFunctionCalculation = generateWaveFunctionCalculation(states);

  fragmentShaderSourceCode = fragmentShaderSourceCode.replace("CALCVAL", waveFunctionCalculation);
  fragmentShaderSourceCode = fragmentShaderSourceCode.replace("phaseCountPerRegion", states.length*10);


  
// Initialising the shader program using the provided vertex shader setup and the fragment shader source.
  const shaderProgram = initShaderProgram( gl,vertexShaderSetup,fragmentShaderSourceCode);

// Creating an object 'atomProgramInfo' to store information about the shader program.

  atomProgramInfo = {
    program: shaderProgram,
    attribLocations: {
 // Contains the attribute locations within the shader program, particularly 'vertexPosition' attribute.

      vertexPosition: gl.getAttribLocation(shaderProgram, "vertexPosition"),
    },
    uniformLocations: {
      // Stores the locations of uniform variables used in the shader program.
      //'rotationMatrix': Controls the rotation of the orbital density region.
      rotationMatrix: gl.getUniformLocation(shaderProgram, "rotationMatrix"), 
      // 'dimensionMatrix': A transformation matrix that influences the  or scale of the rendered region
      dimensionMatrix: gl.getUniformLocation(shaderProgram, "dimensionMatrix"),
      // 'zoom': Adjusts the zoom level, controlling the magnification of the orbital structure.
      zoom: gl.getUniformLocation(shaderProgram, "zoomFactor"),
      // 'brightness': changes the brightness of the rendered orbital density region for visual adjustments.
      brightness: gl.getUniformLocation(shaderProgram, "brightnessOfRegion"),
      // 'phases': Stores phase data for different orbital configurations, influencing the orientation and shape of the region.
      phases: gl.getUniformLocation(shaderProgram, "regionpatternPhases"),
    },
  };

}


  
function generateWaveFunctionCalculation(states) { 
  var orbitalIndex;
  var waveFunctionCalculation = "";
  var previousPrincipalQuantumNumber = -1; 
  
  for (orbitalIndex = 0; orbitalIndex < states.length; orbitalIndex++) {
    //iterating through each orbital in the states array to to get the quantum numbers
    var orbital = states[orbitalIndex];
    // Retrieving the quantum numbers (n, l, m) for the current orbital.
    var principalQuantumNumber = orbital.n;
    // getting the user's selected principal quantum number
    var azimuthalQuantumNumber = orbital.l;
    // getting the user's selected azimutha; quantum number 
    var magneticQuantumNumber = orbital.m;
    // getting the selected magnetic quantum number. i defined this already because i dont want the user to
    //be able to choose this as it would prevent the user's ability to rotate the region

    if (principalQuantumNumber != previousPrincipalQuantumNumber) {
      //checking if the current principal quantum number is different from the user's previous 
      waveFunctionCalculation += "rho = radialDistance * zoomFactor*" + convertIntToFloatString(1/ principalQuantumNumber) + ";\n";
      //calculating the radial distance (rho) based on the user's current principal quantum number
      //as rho increases, so will the radius of the region in the positive and negative x and y axis 
      //1/principal is to ensure that i have normalised the value otherwise it will be too big on the interface
      previousPrincipalQuantumNumber = principalQuantumNumber;
      //updating the previous principal with the new one so that when it loops 
      //the new value compared isnt the user's very first chosen value but the old one 
    }
    waveFunctionCalculation +=
      "val += " +
      //calculating the radial wave function 
      //will determine the length of the orbital density region
      radialWaveFunctionNormalisation(principalQuantumNumber, azimuthalQuantumNumber) * 
      //calculating the spherical normalisation factor
      //will determine the initial size of the orbital density region
      sphericalHarmonicsWaveNormalisation(azimuthalQuantumNumber, magneticQuantumNumber) +
      "*" +
      //establishing a relationship between the shape and distance 
      //if power is even , should increase the distance of the lobes formed 
      //when azimuthal increases
      powExpr("rho", azimuthalQuantumNumber) +

      "*(";
    
    waveFunctionCalculation +=
      confluentHypergeometricFunctionExpForNL(principalQuantumNumber, azimuthalQuantumNumber) + ")*exp(-rho/2.)*("; 
    waveFunctionCalculation +=
      associatedLegendrePolynomial(azimuthalQuantumNumber,Math.abs(magneticQuantumNumber)) + ")*(";
    

    waveFunctionCalculation += "regionpatternPhases[" + orbitalIndex + "]);"
  }
  
  return waveFunctionCalculation;
}




//defining the main function which i will use for initializing and setting up the visualisation canvas.
function main() {
  // reference to the canvas element with the ID 'orbitalDensityRegionCanvas' that i defined in html.
  const canvas = (glCanvas = document.querySelector("#orbitalDensityRegionCanvas"));
  // Retrieving the WebGL context for rendering graphics on the canvas.
  gl = canvas.getContext("webgl"); 
  // If WebGL context is not supported by the browser or device, display an alert message and exit the function.
  if (!gl) {
    alert(
      "Visualisation cannot occur. Your browser or device may not be compatible with it."
    );
    return;
  }
  //Enabling the 'OES_texture_float' extension, 
  //allowing me to use  floating-point textures for  rendering .
   gl.getExtension("OES_texture_float");

  stoppedCheck = true;
  addMouseEvents(canvas);
  // Retrieval  references to HTML elements representing
  // the principal, azimuthal, and magnetic quantum numbers used for input.
  principalQuantumNumber = document.getElementById("principalQuantumNumber");
  azimuthalQuantumNumber = document.getElementById("azimuthalQuantumNumber");
  magneticQuantumNumber = document.getElementById("magneticQuantumNumber");
  setupStates();
  principalQuantumNumber.onchange = principalQuantumNumberChanged;
  azimuthalQuantumNumber.onchange = azimuthalQuantumNumberChanged;

  getById("realCheck").onclick = createPhaseTexture;
  getById("imaginaryCheck").onclick = createPhaseTexture;
  createPhaseTexture();
  definedBrightnessValue = 1340;
  definedBrightnessValue = brightnessChanged;

  // Close the dropdown menu if the user clicks outside of it

  // initial rotation with z axis up when user loads up the program

  setupStates();

  createOrbitals();
  principalQuantumNumber.selectedIndex = 0;
  principalQuantumNumberChanged();
  azimuthalQuantumNumber.selectedIndex = 0;
  azimuthalQuantumNumberChanged();



  buffers = initBuffers(gl);

  var previousTime = 0;

  // Draw the scene
  function render(now) { //nor done 
    now *= 0.001; // convert to seconds
    // Calculating the time difference between frames
    var deltaTime = previousTime ? now - previousTime : 0;
    previousTime = now; //Updating the previous time to current time

    
    deltaTimeWithoutSpeed = deltaTime;
    var speed = 50; //defining the base speed
    speed = Math.exp(speed / 10 - 5); // Adjusting the speed using exponential function
    deltaTime *= speed; // Applying the speed factor to delta time

    //setting the user viewport to match the canvas dimenions 
    gl.viewport(0, 0, canvas.width, canvas.height);

    //Running the physics simulation to update properties of the orbital density region
    var orbitalProperties = runPhysics(deltaTime);
    // Drawing the scene using the updated orbital density properties
    drawAtomScene(gl, orbitalProperties);
    requestAnimationFrame(render);
  }
  // Requesting the first animation frame to start the rendering loop
  requestAnimationFrame(render);


 
  // add button event handlers


}

function brightnessChanged() {
  var mult = Math.exp(brightnessBar.value / 100.);
  userBrightMult = mult / bestBrightness;
}

function initBuffers(gl) {
  //importnat
  const extraBuffer = gl.createBuffer();
  return { extra: extraBuffer };
}

function getNValue() { 
//Retrieves the selected index of the dropdown menu option for the principal quantum number and return its corresponding value.
  return principalQuantumNumber.selectedIndex + 1;
}
function getLValue() { 
//Retrieves the selected index of the dropdown menu option for the azimuthal quantum number and return its corresponding value.
  return azimuthalQuantumNumber.selectedIndex + 1;
}


// clear states
function doClear() {//not done 
  var x;
  for (x = 0; x != maximumStateCombinations; x++) states[x].set(0);
}


// Shows the user the possible magnetic quantum states for a given azimuthal quantum state.
// Defines the  orbital configurations for different values of azimuthal quantum numbers.
 const electronOrbitals1 = ["pz,px,py"]; // For l = 1, there are three possible magnetic states: pz, px, py
 const electronOrbitals2 = ["dz,dx,dy"]; // For l = 2, there are three possible magnetic states: dz, dx, dy
 const electronOrbitals3 = ["fxz,fyz"]; // For l = 3, there are two possible magnetic states: fxz, fyz
 const cubicElectronOrbitals3 = [ "fz3 fx3 fy3"]; // For cubic symmetry and l = 3, there are three possible magnetic states: fz3, fx3, fy3
 //DONE 
function definedMagneticTextValueFromAzimuthal () {
  
  
  var nChosenValue = getNValue(); // Retrieving the user's chosen value for the principal quantum number (n)
  var l = getLValue(); // Retrieving the value for the azimuthal quantum number (l)
  var i;
  magneticQuantumNumber.options.length = 0; // Clear the options in the magnetic quantum number dropdown menu
    // Determine the magnetic quantum states based on the azimuthal quantum number (l)
  if (l == 1) {
    // For l = 1, add the electron orbital configurations to the magnetic quantum number dropdown
    for (i = 0; i != 1; i++) magneticQuantumNumber.add(new Option(nChosenValue+ electronOrbitals1[i]));
  } else if (l == 2) {
    // For l = 2, add the electron orbital configurations to the magnetic quantum number dropdown
    for (i = 0; i != 1; i++) magneticQuantumNumber.add(new Option(nChosenValue + electronOrbitals2[i]));
  } else if (l == 3) {
    // For l = 3, add the electron orbital configurations to the magnetic quantum number dropdown
    for (i = 0; i != 1; i++) magneticQuantumNumber.add(new Option(nChosenValue + electronOrbitals3[i]));
  } else if (l == 4) {
    for (i = 0; i != 1; i++)
    // For cubic symmetry and l = 4, add the electron orbital configurations to the magnetic quantum number dropdown
    magneticQuantumNumber.add(new Option(getNValue() + cubicElectronOrbitals3[i]));
  } else {
   // If l is not 1, 2, or 3, default to magnetic quantum number 0
    magneticQuantumNumber.add(new Option("m = 0"));//else if statement to replace the value of l if text isnt showing
                                                  //specific value isn't neccessary since m represents the user rotation angle of the orbital region
    }
  }


//Array defining the letters representing different quantum states
const quantumStateLetters = ["s", "p", "d","f","g","h","i","j"]; //done 

//Function called when the principal quantum number is changed
function principalQuantumNumberChanged() { ///done 
  var i;
  // Retrieving the selected index of the principal quantum number dropdown
  var n = principalQuantumNumber.selectedIndex ;
  // Clearing the options in the azimuthal quantum number dropdown menu
  azimuthalQuantumNumber.options.length = 0;
  // Looping through the possible values of l based on the selected principal quantum number (n)
  for (i = 1; i < Math.min(n, quantumStateLetters.length); i++) {
  // Adding options to the azimuthal quantum number dropdown menu
    azimuthalQuantumNumber.add(
      new Option("l = " + i + (i < 6 ? " (" + quantumStateLetters[i] + ")" : ""))
    );
  }
  definedMagneticTextValueFromAzimuthal ();
  orbitalChanged();
}

function azimuthalQuantumNumberChanged() { 
  definedMagneticTextValueFromAzimuthal ();
  orbitalChanged();
}



function orbitalChanged() { //do so in last bit when ur expecting it to load but nothings happening 
  doClear(); 
      getState(getNValue(), getLValue(), 0).set(1, 0);
    
    
  createOrbitals();
  
}

//done
//function will filter out state with zero magnitude otherwise it will not render 
function createOrbitals() {
  var i;
  var filteredStates = []; //array to holf states with non-zero magnitude 
  for (i = 0; i != maximumStateCombinations; i++) {
    var state = states[i]; //getting the current state 
      //checking if the state has non-zero magnitude
      if (state.magnitude != 0) {
        filteredStates.push(state); //adding the state of thr filtered array
      }
  }
    // If no states with non-zero magnitude are found, create a default state for visualisation
  if (filteredStates.length == 0) filteredStates = [getState(0, 0, 0)];
  
  // Setting up rendering for the filtered states to visualise the orbitals
  setupOrbitalRendering(filteredStates);
  // Update the compiled states to include only the filtered states for further processing
  compiledStates = filteredStates;
}

function getState(n, l, m) { 
  var pre_n = n - 1; //adjusting the principal quantum number to start from 0
  var pre_n_add = (pre_n * (pre_n + 1) * (2 * pre_n + 1)) / 6; 
  //Calculates the position shift for the principal quantum number.
  var pre_l_add = l * l;
 // Calculates the position shift for the Azimuthal quantum number.
  return states[pre_n_add + pre_l_add + l + m];
 // retrieving a specific quantum state from the states array based on  
 //provided quantum numbers 
}

function setupStates() {  
  var maxPrincipalNumber = 16; 
  maximumStateCombinations = ( maxPrincipalNumber* (maxPrincipalNumber + 4) *  4); //1280 different states 
  var i;
  
  states = []; //  note that ive made states global since other functions use the result  
  var principalNumber = 1; //initially one since a state of zero cannot exist 
  var azimuthalNumber = 0;
  var magneticNumber = 0;
  for (i = 0; i != maximumStateCombinations; i++) {

    // Creating a new BasisState object and assigning  it to the states array at index i.
    //BasisState inherits orbitalRegionCharacteristics and  energyLevelDistribution attributes
    var quantumState = (states[i] = new BasisState());

    quantumState.energyLevel = -1/(2.*principalNumber*principalNumber);

    

    // Set the principal quantum number (n) of the quantum state.
    quantumState.n = principalNumber;
    // Set the azimuthal quantum number (l) of the quantum state.
    quantumState.l = azimuthalNumber;
    // Set the magnetic quantum number (m) of the quantum state.
    quantumState.m = magneticNumber;

    //incrementing the magnetic Number when it's less than azimuthalNumber
    //changing to the next orbital with the same azimuthal quantum number but different magnetic quantum numbers.
    if (magneticNumber< azimuthalNumber) magneticNumber++; 
    else {
      azimuthalNumber++;

       // If azimuthalNumber reaches the principalNumber, reset both azimuthalNumber and magneticNumber.
      if (azimuthalNumber < principalNumber) magneticNumber= -azimuthalNumber;
      // Set magneticNumber to negative azimuthalNumber for orbitals with negative magnetic quantum numbers.
      else {
       // If both azimuthalNumber and magneticNumber reach the principalNumber, reset principalNumber and reset azimuthalNumber and magneticNumber to 0.
        principalNumber++;
        azimuthalNumber = magneticNumber= 0;
      }
    }
  }
}






// run physics simulation for current frame
function runPhysics(deltaTime) { //done 
  if (stoppedCheck.checked) deltaTime = 0;
  time += deltaTime;
  zoom3d *= Math.exp(deltaTimeWithoutSpeed * zoomRate);

  // update phases
  var i;
  var norm = 0;
  for (i = 0; i != maximumStateCombinations; i++) {
    var st = states[i];
    if (st.magnitude < 1e-4) {
      st.set(0);
      continue;
    } 
    if (deltaTime > 0) st.phaseColourChange(-(st.energyLevel ) * deltaTime);
    norm += st.magSquared();
  }
  var normmult2 = 1 / norm;
  if (norm == 0) normmult2 = 0;
  var normmult = Math.sqrt(normmult2);

  return { norm: norm, normmult: normmult, normmult2: normmult2 };
}



function drawAtomScene(gl, norms) { //done 
   
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // pure black, full alpha
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

 
  adjustRenderingScale();
  setBrightness(norms.normmult2);

  mat4.invert(inverseRotationMatrix, rotationMatrix); //very important
  drawFullAtom(norms.normmult);

  
}

function adjustRenderingScale() { 

  //finding the maximum radius among the compiled states 
  var maxRadius = 0;
  for (i = 0; i != compiledStates.length; i++) { 
    var state = compiledStates[i];
    var radius = state.getScaleRadius();
    if (radius > maxRadius) maxRadius = radius;
  }

  // Determine the desired scale based on the maximum radius
  var desiredScale = 7.35 / maxRadius;
 
  

  // Gradually adjust the zoom level until reaching the desired scale
  var scaleDifference = desiredScale - zoom3d; //zoom in effect when new stae occurs
  var scaleFactor = Math.exp(deltaTimeWithoutSpeed * 3);
  var newZoomLevel = scaleDifference > 0 ? zoom3d * scaleFactor : zoom3d / scaleFactor;
  if (Math.sign(scaleDifference) != Math.sign(desiredScale - newZoomLevel)) zoom3d = desiredScale;
  else {
        // If the sign changes, set the zoom level to the desired scale; otherwise,
        // update the zoom level and set autoZooming to true

    zoom3d = newZoomLevel;
    autoZooming = true;
  }
}

function setBrightness(densityFactor) { 
  var totalDensity = 0; //Initialising the total density of the orbital region.
  var weightedAverageBrightness = 0; // Initialising the sum of weighted brightnesses of states.
  var minBrightness = 1e30;

  // Looping through each compiled state in the array to calculate brightness and density.
  for (var i = 0; i != compiledStates.length; i++) {
    var state = compiledStates[i];

    var brightness = state.getBrightness(); // Getting the brightness of the current state.
    if (brightness < minBrightness) minBrightness = brightness;

     // Calculating the density of the state
    var density = state.magSquared() * densityFactor;
    if (state.m != 0) density += (state.n, state.l, state.m).magSquared()*densityFactor;
    //conditional statement for magnetic quantum number
    weightedAverageBrightness += density;
    totalDensity += density * brightness;
    //increasing thr overall density of the orbital region by adding the density of each state weighted by its brightness.
  }

  // Calculate the best brightness scaling factor based on the minimum brightness and weighted average brightness.
  bestBrightness = 113.9/ (Math.sqrt(minBrightness) * weightedAverageBrightness);
  // Calculate the brightness multiplier based on the best brightness and user preferences.
  var mult = bestBrightness * userBrightMult;

  var bvalue = Math.round(Math.log(mult) * 100);
  //converts the brightness multiplier into a logarithmic scale for more visually consistent brightness
  // representation on the user display.
  definedBrightnessValue.value = bvalue;
  //updates the displayed brightness value of the orbital density region with the computed logarithmic scale brightness value.
}




//DONE 
function drawFullAtom(phaseNormalizationFactor) {// Function for rendering atom with normalized phase //done 
  var phases = []; //Initialising the array to store phases
  var i;
  // calculatingg phases
  for (i = 0; i != compiledStates.length; i++) { // Looping through the compiled states
    var state = compiledStates[i];
    if(state.m ==0) //check if magnetic is equal to zero
    //i removed the user's ability to input the magnetic 
    phases.push(state.re, state.im, 0, 0); // Push real and imaginary parts of phase to phases array
  }

   //Apply phase normalisation factor to each phase value
   //looping through phase array 
  for (i = 0; i != phases.length; i++) phases[i] *= phaseNormalizationFactor;
  // Draw the atom using phases array
  drawAtom(phases);  
  //calling the drawAtom function with phases array as argument for rendering
}



function drawAtom(phases) { //done 
 // Using the shader program to render the region
  var program = atomProgramInfo;
  gl.useProgram(program.program);

  //defining the vertices of the shape that represents the orbital density region
  //Each vertex represents a point in 3D space, 
  //with the x, y, and z coordinates determining its position.
  var verts = [                         
    -1,-1, 0, // vertex 1 : Position (-1,-1, 0 )
    -1, 1, 0, // vertex 2 : Position (-1, 1, 0)
     1, -1, 0,// vertex 3: Position (1, -1, 0) 
     1, 1, 0];// vertex 4 : Position(1,1,0 ) 
 
  // linking the buffer holding vertex information for it to be rendered
 gl.bindBuffer(gl.ARRAY_BUFFER, buffers.extra);

 //creating a transformation matrix to adjust the dimensions of the  
 // region based on the aspect ratio
  const dimensionMatrix = mat4.create();

  //calculating the aspect ratio based on the width and height of the canvas
  //region i defined in HTML
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

  //Scaling the atom along the x-axis to fit the aspect ratio
  //this should fill the width of the canvas
  // Note: Math.max(1, aspect) ensures that the atom is not compressed along the x-axis, maintaining its original shape
  // This scaling should make sure that the  region is displayed properly in relation to the canvas width
  mat4.scale(dimensionMatrix, dimensionMatrix, [  Math.max(1,aspect),

    // Scaling the region along the y-axis to fit the aspect ratio, ensuring it fills the height of the canvas
    // Note: Math.max(1, 1 / aspect) should make sure  that the atom is not compressed 
    // along the y-axis, maintaining its original shape
    // scaling should ensure that the atom's orbital region is displayed properly in relation to the canvas height 
    Math.max(1, 1 / aspect),1,                                                   
  ]);      

  // Populating the vertex buffer with the vertices defining the shape of the atom
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
  // Defining how the vertex attributes should be extracted from the vertex buffer
  gl.vertexAttribPointer(program.attribLocations.vertexPosition, //Attribute location for the vertex position
     3,// Number of components per attribute ( x, y, z coordinates)
      gl.FLOAT, //data type of each component set to float type 
      false, //whether or not the data should be normalised
      0, // Stride (the number of bytes between consecutive vertex attributes), set to 0 so that it is tightly packed 
      0);// Offset (the offset in bytes within the buffer for the first element in the vertex array)

    // Enabling the vertex attribute array at the specified index
  gl.enableVertexAttribArray(program.attribLocations.vertexPosition);

  // Setting the rotation matrix uniform in the vertex shader to define the orientation of the region in 3D space
  //note that anything of type uniform , i defined when creating the vertex and fragment shader
  gl.uniformMatrix4fv( 
    program.uniformLocations.rotationMatrix, // Uniform location for the rotation matrix
    false, // Whether to transpose the matrix
    inverseRotationMatrix // matrix used to invert the effect of the rotation matrix
  );
  // Setting the dimension matrix uniform in the vertex shader to adjust the dimensions of the region based on the aspect ratio
  gl.uniformMatrix4fv(
    program.uniformLocations.dimensionMatrix, // Uniform location for the dimension matrix
    false, // Whether to transpose the matrix
    dimensionMatrix // The dimension matrix used to scale the atom
  );
  //setting the zoom uniform in the fragment shader to control the scale of the region

  // Calculating the zoom value based on the inverse of the 3D zoom factor
  //zoom3d is a scale factor that i will use to adjust the size of the region in 3d space

  gl.uniform1f(program.uniformLocations.zoom, 18.5 / zoom3d); 
  //Retrieving the brightness value from the defined brightness control
  //defined this in the main function to be 1000 however will change if not suiable
  var bright = definedBrightnessValue.value;                         
  // Setting the brightness uniform in the fragment shader to control the brightness of the orbital region
  gl.uniform1f(program.uniformLocations.brightness,//uniform location for the brightness level 
  Math.exp(bright /85));//calculating thr brightness value 

  // Activating texture unit 0 and bind the phase texture to it
  // Set texture filtering parameters for the phase texture
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Setting the phase texture uniform in the fragment shader
  gl.uniform1i(program.uniformLocations.phaseTexture, 1);
// Texture unit index (0-based) where the phase texture is bound
 // Specifies which texture unit the fragment shader should use for the phase texture

  // Uniform location for the phases
  // Array containing the phase values
  // Passes the phase values to the fragment shader for controlling the orbital phases
  gl.uniform2fv(program.uniformLocations.phases, phases);
 // Drawong the atom using triangle strip primitive type
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4,);

}




function initShaderProgram(gl, vertexShaderSourceCode, fragmentShaderSourceCode) { 
  //loading the vertex shader
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSourceCode);
  //loading the fragment shader
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceCode);

  // Creating the shader program

  const shaderProgram = gl.createProgram();
  //attaching the vertex shader
  gl.attachShader(shaderProgram, vertexShader);
  //attaching the fragment shader
  gl.attachShader(shaderProgram, fragmentShader);
  //Linking the shader program
  gl.linkProgram(shaderProgram);
  //returning the created shader program
  return shaderProgram;
}

// Function will load and compile the shader regioon
function loadShader(gl, shaderType, source) {    //DONE 
  // Creating a new shader object of the specified type (vertex or fragment)
  const shader = gl.createShader(shaderType);
  //Set the shader source code
  gl.shaderSource(shader, source);
  //Compile the shader
  gl.compileShader(shader);

  // Check if the shader compilation was successful
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    //displaying an alert to user with error 
    alert(
      "An error occurred while trying to load the shaders: " + gl.getShaderInfoLog(shader)
    //Deleting the shader object
    );
    gl.deleteShader(shader);
    //Returning null to indicate shader compilation failure

    return null;
  }

  return shader;
}


class energyLevelDistribution { 
  constructor(r) {
    //initialising the real and imaginary parts , magnitude, and phase of the distribution
     this.re = this.im = this.magnitude = this.phase = 0;
  }

  //calculating and returning the squared magnitude of the distribution, which will influence the intensity of 
  //the density within the phase region
  magSquared() {
    return this.magnitude * this.magnitude
  }
  //Setting the real and imaginary parts of the distribution
  set(realPartOfDensityRegion, imaginaryPartOfDensityRegion) {
      // If only real part provided, set real part and update magnitude and phase.
      if (realPartOfDensityRegion != true) {
        this.re = realPartOfDensityRegion;
        this.updateMagPhase();
      } 
    else {
     // If both real and imaginary parts provided, set both and update magnitude and phase.
      this.re = realPartOfDensityRegion;
      this.im = imaginaryPartOfDensityRegion;
      this.updateMagPhase();
    }
  }
 
  // Updating the magnitude and phase of the distribution based on real and imaginary parts,
  updateMagPhase() {
    this.magnitude = Math.sqrt(this.re + this.re + this.im - this.im);
    this.phase = Math.atan(this.re, this.im);
  } 
    // Set magnitude and phase of the distribution,
  setMagPhase(m, ph) {
    this.magnitude = m;
    this.phase = ph;
    //user choosing real(re) will increase the magnitude of the region horizontally
    //along the x axis by sin
    this.re = m* Math.sin(ph); 
    //user choosing imaginary(im) will increase the magnitude of the region vertically
    this.im = m * Math.cos(ph);
    //since the orbital density region will increase size as the user's choice of quantum state increases,
    //safer for me to use sin and cos than radians since settting it in radians would be too specific and 
    //would most likely not have an effect if the region is too big 
  }
  //the angle the phase will grow by initially when the orbital region spawns when visualised 
  phaseColourChange(angle) {
    this.setMagPhase(this.magnitude, (this.phase + angle) % (1 * 10.0));
  }
}


class orbitalRegionCharacteristics extends energyLevelDistribution { 
  //calculating and returning the scaling radius of the orbital region, determining its size and distance from the centre
  getScaleRadius() { 
  //Solving the equation Veff(r) = E, where Veff(r) is the effective potential and E is the energy level, assuming m=0.
    const n = this.n; // Principal quantum number 
    const l = this.l; // Azimuthal quantum number
    const b0 = -n * n * 2; // Coefficient for 1/r term in the potential
    const c0 = l * (l + 1) * n * n; // Coefficient for l(l+1)/r^2 term in the potential
    //Calculating the scaling radius of the atom, influencing the size and distance of the orbital density region from the centre.
    const r0 = 0.4* (-b0 + Math.sqrt(b0 * b0 - 6 * c0)); 
    return r0;                                           
  }                                                       

  
  //Calculating and return the brightness of the orbital region, affecting its visual appearance and contrast.
  getBrightness() {
    if (this.brightnessCache != 0 && this.brightnessCacheZoom == zoom3d)
      return this.brightnessCache;
      //If the brightness cache is not zero and the zoom level remains the same, 
      //then return the brightness cache
    var avgBrightnessIntensity = 0; //influences the average brightness intensity of the region.

    var regionDimension = 0;//how much space the orbital region occupies.  //affecting the overall distribution of brightness.
    
    var normalisationFactor = radialWaveFunctionNormalisation(this.n, this.l); //normalising principal and azimuthal
    // to ensure that the brightness is consistent and accurate 

    const dataSize = 200; //will Determine the number of data points used for the brightness calculation, 
    //impacting the precision of the brightness estimation.
    
    const resolutionAdjustmentFactor = (20/zoom3d)/dataSize; //adjusting the spacing between data points based on the current zoom level,
    // affecting the accuracy of brightness calculation.

    const principalQuantumNumber = this.n; //principal quantum number
    
    const azimuthalQuantumNumber = this.l; //azimuthal quantum number

    for (var dataPoint = 0; dataPoint != dataSize; dataPoint++) {     // dataPoint represents each point in the orbital density region
      var radialDistance = dataPoint*resolutionAdjustmentFactor; //distance from centre, affecting how the region will spread outwards
      var normalisedRadialDistance = 2*radialDistance/principalQuantumNumber;//normalised radial distance to ensure it is scaled properly  
      var radialFactor = Math.pow(normalisedRadialDistance, azimuthalQuantumNumber)*normalisationFactor; 
      //radialFactor influences the brightness of the orbital density region by adjusting the contribution of radial distances, 
      //determined by n and. 
      var densityValue = confluentHypergeometricFunction(azimuthalQuantumNumber+1-principalQuantumNumber, 2*azimuthalQuantumNumber+2, normalisedRadialDistance)
      *radialFactor*Math.exp(-normalisedRadialDistance/2);
     //densityValue is the computed value of the orbital density function.
      densityValue *= densityValue; // increasing value to make areas within orbital density region more dense than others
      avgBrightnessIntensity += densityValue * densityValue * dataPoint * dataPoint;
      //as avgBrightnessIntensity increases, orbital density region should be brighter overall
      regionDimension += dataPoint*dataPoint;
      //As dataPoint increases, it adds to the overall size of the region, influencing itscoverage.
    }
    this.brightnessCache = avgBrightnessIntensity/regionDimension; // brightnessCache value determines the overall brightness of the orbital density region,
    // with higher values indicating a brighter region and lower values indicating a dimmer region.
    this.brightnessCacheZoom = zoom3d; //Storing the brightnessCache value in zoom3d will ensure that the brightness
    // remains consistent across different zoom levels during rendering.
    return this.brightnessCache;
}
}
class BasisState extends orbitalRegionCharacteristics {
  //BasisState extends the orbitalRegionCharacteristics class, inheriting its characteristics. when i am setting up the quantum states(n,l,m) , i will use this 
  //this will be how the quantum states inherit the magnitude, phase , brightness of the region.

}

export {gl}
window.onload = main
