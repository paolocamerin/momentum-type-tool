precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_point1;
uniform vec2 u_point2;
uniform vec2 u_point3;
uniform vec2 u_point4;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Define 4 corner colors (vibrant colors as requested)
    vec3 colorTopLeft = vec3(0.0, 0.4, 1.0);     // Vibrant Blue
    vec3 colorTopRight = vec3(1.0, 0.2, 0.2);    // Vibrant Red
    vec3 colorBottomLeft = vec3(1.0, 0.6, 0.0);  // Vibrant Orange
    vec3 colorBottomRight = vec3(1.0, 0.9, 0.0); // Vibrant Yellow
    
 
    
    // Use the uniform points as positions for the colors
    // Convert UV coordinates to the same coordinate system as the points (-1 to 1)
    vec2 normalizedUV = (uv - 0.5) * 2.0;
    
    // Calculate distances from current pixel to each moving color point
    float dist1 = distance(normalizedUV, u_point1);
    float dist2 = distance(normalizedUV, u_point2);
    float dist3 = distance(normalizedUV, u_point3);
    float dist4 = distance(normalizedUV, u_point4);
    
    // Use inverse distance weighting for smooth color blending
    float totalWeight = 0.0;
    vec3 finalColor = vec3(0.0);
    
    // Add each color with inverse distance weighting
    float weight1 = 1.0 / (dist1 + 0.1);
    float weight2 = 1.0 / (dist2 + 0.1);
    float weight3 = 1.0 / (dist3 + 0.1);
    float weight4 = 1.0 / (dist4 + 0.1);
    
    totalWeight = weight1 + weight2 + weight3 + weight4;
    
    finalColor += colorTopLeft * weight1;
    finalColor += colorTopRight * weight2;
    finalColor += colorBottomLeft * weight3;
    finalColor += colorBottomRight * weight4;
    
    finalColor /= totalWeight;
    
    // Add thin grain effect
    float grain = fract(sin(dot(uv + u_time * 0.0001, vec2(12.9898, 78.233))) * 43758.5453);
    grain = (grain - 0.5) * 0.05; // Thin grain intensity (12% of full range)
    finalColor += grain;
    
    // Clamp to prevent oversaturation
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
