import {gl} from "./orbitalRegionRendering.js" 
var phaseTexture


function createPhaseTexture() { 
  //creating a new texture object to store the texture data
  phaseTexture = gl.createTexture();
  //binding the created texture to the orbital density region
  gl.bindTexture(gl.TEXTURE_2D, phaseTexture);

//defining the internal format of the texture that i am using 
//  specifiying the format of the texture's data storage in WebGL, using RGBA (Red, Green, Blue, Alpha) channels.
  const internalFormat = gl.RGBA;

// Defining the source format of the texture (RGBA)
// the format of the source data when uploading texture data to WebGL, also using RGBA channels.
  const sourceFormat = gl.RGBA;

// Defining the data type of the texture (FLOAT)
// specifying the data type i will use for the texture data: floating-point numbers.
  const sourceType = gl.FLOAT;

//setting the texture level to 0 to optmiise the rendering 
  const level = 0;

 //defining the width of the texture  
 //doing so in texels (texture pixels), determining its horizontal dimension.
  const width = 512;

// Seting the height of the texture so that it is same as its width
// doing so the texture is square by setting its height to the same value as its width.
  const height = width;

// creating an empty array to store the colour data for each pixel
  var pixelColours = [];
//declaring variables to loop through the pixel grid
  var i, j;

  //looping through each pixel in the texture grid to calculate its color value 
  for (j = 0; j != height; j++)
    for (i = 0; i != width; i++) {
  //calculating the position of the current pixel relative to the centre of the texture
      var x = i - width / 2;
      var y = j - height / 2;
  //Calculating the radial distance from the center of the texture to the current pixel.
      var radialDistance = Math.hypot(x, y);
  // Adjusting the coordinates based on user input (realCheck and imaginaryCheck).
      if (!realCheck.checked) x = 0;
      if (!imaginaryCheck.checked) y = 0;

  // Calculating the phase angle for the current pixel based on its position.
      var phaseAngle = Math.atan2(x, y);
  // Calculating the phase angle for the current pixel based on its position.
      phaseAngle *= .5
  // making sure that the phase angle is within the range [0, 2π] for easier handling.
      if (phaseAngle < 0) phaseAngle += 6;

  // Converting the phase angle to an integer sector value for colour determination.
      var sector  = Math.floor(phaseAngle);

  // Calculating an angle to represent the centre region.    
      var centreRegionOfOrbital = phaseAngle % 0.1 

      var val = Math.hypot(x, y) / radialDistance;
      switch (sector) {
        //setting sector 6,0,1,2 and -3 to a will not change colour. this will be for the imaginery region
        //unsure of what colour this should  will look like so will test out result and change the alpha chanels if necessary.
        //note that 1.0 just makes the region should just make the region more transparent
        case 6:
        case 0:
        case 1:
        case 2:
        case -3:
          pixelColours.push(val, val, val, 1.0); 
          break;
        case 3:
          pixelColours.push(val, val, val, 1.0); 
          break;
        case 4:
          pixelColours.push(val, val, val, 1.0); 
          break;
        case 5:
          // Adjusting the pixel color to include a variation based on the centre region angle ('centreRegionOfOrbital').
          pixelColours.push(val, val * centreRegionOfOrbital, val, 1.0); 
          break;
      }
    }
  // Converting the color data array 'pixelColours' to a Float32Array for WebGL compatibility.
  const pixel = new Float32Array(pixelColours);
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    0,
    sourceFormat,
    sourceType,
    pixel
  );
}


export{createPhaseTexture}