// WebGL - 2D Geometry Matrix Transform with Projection
// from https://webglfundamentals.org/webgl/webgl-2d-geometry-matrix-transform-with-projection.html


"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");

  // lookup uniforms
  var colorLocation = gl.getUniformLocation(program, "u_color");
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put geometry data into buffer
  setGeometry(gl);

  var translation = [100, 150];
  var angleInRadians = 0;
  var scale = [1, 1];
  var color = [Math.random(), Math.random(), Math.random(), 1];

  drawScene();

  // Setup a ui.
  webglLessonsUI.setupSlider("#x", {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y", {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#angle", {slide: updateAngle, max: 360});
  webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
  webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});

  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    var angleInDegrees = 360 - ui.value;
    angleInRadians = angleInDegrees * Math.PI / 180;
    drawScene();
  }

  function updateScale(index) {
    return function(event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }

  // Draw the scene.
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // set the color
    gl.uniform4fv(colorLocation, color);

    // Compute the matrices
    var projectionMatrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    var translationMatrix = m3.translation(translation[0], translation[1]);
    var rotationMatrix = m3.rotation(angleInRadians);
    var scaleMatrix = m3.scaling(scale[0], scale[1]);

    // Multiply the matrices.
    var matrix = m3.multiply(projectionMatrix, translationMatrix);
    matrix = m3.multiply(matrix, rotationMatrix);
    matrix = m3.multiply(matrix, scaleMatrix);

    // Set the matrix.
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 129;  // 6 triangles in the 'F', 3 points per triangle
    gl.drawArrays(primitiveType, offset, count);
  }
}

var m3 = {
  projection: function(width, height) {
    // Note: This matrix flips the Y axis so that 0 is at the top.
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
  },

  identity: function() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
  },

  translation: function(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },

  rotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c,-s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  scaling: function(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
};

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          //Gambar 1 Model Tangga
          // Tiang Kiri Tangga
          0, 0,
          30, 0,
          0, 280,
          0, 280,
          30, 0,
          30, 280,

          // Anak Tangga 1
          30, 50,
          150, 50,
          30, 20,
          30, 20,
          150, 50,
          150, 20,

          // Anak Tangga 2
          30, 100,
          150, 100,
          30, 70,
          30, 70,
          150, 100,
          150, 70,

          // Anak Tangga 3
          30, 150,
          150, 150,
          30, 120,
          30, 120,
          150, 150,
          150, 120,

          // Anak Tangga 4
          30, 200,
          150, 200,
          30, 170,
          30, 170,
          150, 200,
          150, 170,

          // Anak Tangga 5
          30, 250,
          150, 250,
          30, 220,
          30, 220,
          150, 250,
          150, 220,

          // Tiang Kanan Tangga
          180, 280,
          150, 280,
          180, 0,
          180, 0,
          150, 280,
          150, 0,


 
          // Gambar 2 Model  Sisir
          //Tiang Sisir
          325, 280,
          270, 280,
          295, 0,
          295, 0,
          270, 280,
          270, 0,

          // sisir 1
          440, 10,
          280, 10,
          440, 0,
          440, 0,
          280, 10,
          280, 0,
         
          // sisir 2
          436, 30,
          280, 30,
          436, 20,
          436, 20,
          280, 30,
          280, 20,

          // sisir 3
          432, 50,
          280, 50,
          432, 40,
          432, 40,
          280, 50,
          280, 40,

          // sisir 4
          428, 70,
          280, 70,
          428, 60,
          428, 60,
          280, 70,
          280, 60,

          // sisir 5
          428, 90,
          280, 90,
          428, 80,
          428, 80,
          280, 90,
          280, 80,

          // sisir 6
          432, 110,
          280, 110,
          432, 100,
          432, 100,
          280, 110,
          280, 100,

          // sisir 7
          436, 130,
          280, 130,
          436, 120,
          436, 120,
          280, 130,
          280, 120,

          // sisir 8
          440, 150,
          280, 150,
          440, 140,
          440, 140,
          280, 150,
          280, 140,

          // Gambar 3 Model Bendera
          //Tiang-nya
          546, 230,
          534, 230,
          546, 0,
          546, 0,
          534, 230,
          534, 0,

          //Tali-nya
          553, 200,
          550, 200,
          553, 0,
          553, 0,
          550, 200,
          550, 0,

          //Pengait Atas
          550, 5,
          546, 5,
          550, 0,
          550, 0,
          546, 5,
          546, 0,

          //Pengait Bawah
          550, 200,
          546, 200,
          550, 195,
          550, 195,
          546, 200,
          546, 195,



          // Bendera-nya
          645, 60,
          550, 70,
          665, 0,
          665, 0,
          550, 70,
          550, 10,

          // Segitiga Bawah
          540, 220,
          580, 280,
          500, 280,


      ]),
      gl.STATIC_DRAW);
}

main();