export const vertexShader = `
	uniform float uTime;
	uniform float uAmplitude;
	uniform float uFrequency;
  uniform sampler2D uPerlinTexture;
	varying vec2 vUv;

	void main() {
		vUv = uv;
    
		vec3 newPosition = position;
		newPosition.z += uAmplitude * sin((position.x - uTime/2.0) * uFrequency);
		newPosition.z += uAmplitude * sin((position.y - uTime/2.0) * uFrequency);
		gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
	}
`;

export const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform sampler2D uPerlinTexture;
  varying vec2 vUv;

  void main() {
    // Noise
    // Adjust UVs for mapping in the y direction and to animate in the x direction
    vec2 noiseUv = vUv;
    noiseUv.y *= .1; // .25 would be a perfect map, but this looks better because of foreshortening
    noiseUv.x += uTime*.01;

    // Get noise value in red channel at the UV position
    float noise = texture(uPerlinTexture, noiseUv).r;

    // Remap noise
    noise = smoothstep(1.0, .2, noise);

    // Fade out fragments at the back of the plane
    noise *= smoothstep(0.0, 0.25, vUv.y);

    vec3 baseColor = mix(uColor2, uColor1, noise);
    gl_FragColor = vec4(baseColor, noise);
  }
`;
