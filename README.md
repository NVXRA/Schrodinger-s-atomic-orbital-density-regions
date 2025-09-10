# Schrödinger’s Atomic Orbital Density Regions

An **interactive WebGL visualisation** of atomic electron orbitals, built from the ground up in JavaScript.  
Aim of this project was not only to educate myself with the rules of probability that exist with electrons but for me to see my capabilities as a software engineer when it comes to rendering using mathematics.

---

##  Live Demo
*(Requires GitHub Pages to be enabled in Settings → Pages → Source: `main` branch, `/ (root)`)*

---

##  Preview
<img width="1907" height="948" alt="image" src="https://github.com/user-attachments/assets/1df81a1a-2039-479b-9b7b-29acf37c96f9" />
<img width="1907" height="956" alt="image" src="https://github.com/user-attachments/assets/ca29c378-5a88-41d2-8ce3-e415bdb621b0" />
<img width="1913" height="954" alt="image" src="https://github.com/user-attachments/assets/772e38da-d74d-4de4-8f22-9c0ca1d892f0" />

---

##  Features
- ** orbital rendering** using WebGL
- **shader generation** for each individual quantum state
- Adjustable **principal (n)**, **azimuthal (l)**, and **magnetic (m)** quantum numbers
- **Phase colour mapping** with texture-based visualisation
- Auto-scaling and brightness adjustment for best scene viewing.
-  rotation, zoom, and animation timed / controlled to set the best scene when rendering 
- Modular code structure for physics, rendering, and UI

---

##  How It Works
This visualiser:
1. **Generates quantum states** up to a maximum principal number. chose n principal number to be 16 because the trend, more growth in outer regions, explains itself as N principal number increases assuming l and m arent changed.
2. **Builds GLSL shader code** for the chosen state(s).
3. **Calculates orbital density** using:
   - Radial wavefunction normalisation
   - Spherical harmonics
   - Confluent hypergeometric functions
4. **Renders ** with adjustable zoom, brightness, and rotation.

---

## Tech Stack
- **JavaScript (ES6+)**
- **WebGL** for GPU-accelerated rendering
- **GLSL** for shader programming
- **HTML5 / CSS3** for UI
- **Linear algebra & quantum mechanics** for the maths

---

## Project Structure
