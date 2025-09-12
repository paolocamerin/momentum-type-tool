 precision mediump float;

 uniform vec2 u_resolution;
 uniform float u_time;
uniform vec2 u_point1;
uniform vec2 u_point2;
uniform vec2 u_point3;
uniform vec2 u_point4;

// Function to convert hex color to RGB vec3
// Usage: hexToRGB(0x6C2EA9) or hexToRGB(7087785.0) for #6C2EA9
vec3 hexToRGB(float hex) {
    float r = floor(hex / 65536.0);
    float g = floor((hex - r * 65536.0) / 256.0);
    float b = hex - r * 65536.0 - g * 256.0;
    return vec3(r, g, b) / 255.0;
}

// Alternative function using individual RGB components
// Usage: rgb(108, 46, 169) for #6C2EA9
vec3 rgb(float r, float g, float b) {
    return vec3(r, g, b) / 255.0;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Define 4 corner colors using hex values
    // Hex colors: #6C2EA9, #1F123C, #250844, #495C91
    
    vec3 colorTopLeft = hexToRGB(7087785.0);     // #6C2EA9 (Purple)
    vec3 colorTopRight = hexToRGB(2036284.0);    // #1F123C (Dark Blue)
    vec3 colorBottomLeft = hexToRGB(2427972.0);  // #250844 (Dark Purple)
    vec3 colorBottomRight = hexToRGB(4807825.0); // #495C91 (Blue-Gray)
    
    // Alternative syntax using rgb() function:
    // vec3 colorTopLeft = rgb(108.0, 46.0, 169.0);     // #6C2EA9
    // vec3 colorTopRight = rgb(31.0, 18.0, 60.0);      // #1F123C
    // vec3 colorBottomLeft = rgb(37.0, 8.0, 68.0);     // #250844
    // vec3 colorBottomRight = rgb(73.0, 92.0, 145.0);  // #495C91
    
 
    
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
    float grain = fract(sin(dot(uv + u_time * 0.01, vec2(12.9898, 78.233))) * 43758.5453);
    grain = (grain - 0.5) * 0.05; // Thin grain intensity (12% of full range)
    finalColor += grain;
    
    // Clamp to prevent oversaturation
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, 1.0);
}

// #define PI 3.14159265

// // The x and y coordinates of the camera while at postion z. Also used as the center of the tunnel at position z
// vec2 path(float z){
//     return vec2(.5*sin(z), .5*sin(z*.7));
// }

// // Distance to the edge of the tunnel
// float map(vec3 p) {
//     float d = -length(p.xy - path(p.z)) + 1.2 + .3 * sin(p.z*.4);
//     return d;
// }

// // Normal of distance function using forward differences
// vec3 normal(vec3 p){
//     float d = map(p);
//     vec2 e = vec2(0.01, 0.0);

//     vec3 n = d - vec3(
//         map(p - e.xyy),
//         map(p - e.yxy),
//         map(p - e.yyx)
//     );

//     return normalize(n);
// }

// // Smooth maximum function
// float sMax(float a, float b, float k) {
//     return log(exp(k*a) + exp(k*b)) / k;
// }

// // Bump map, gives the height of the tiles
// float bumpFunction(vec3 p) {
//     vec2 c = path(p.z);
//     float id = floor(p.z*4.-.25); 
//     float h = .5 + .5*sin(atan(p.y - c.y, p.x - c.x) * 20. + 1.5 * (2.*mod(id, 2.)-1.) + u_time * 5.);
//     h = sMax(h, .5 + .5*sin(p.z *8.*PI), 16.);
//     h *= h;
//     h *= h*h;
//     return 1.-h;
// }

// // Calculate normal of the bump map using central differences and add this to the normal of the tunnel
// vec3 bumpNormal(vec3 p, vec3 n, float bumpFactor) {
//     vec3 e = vec3(0.01, 0.0, 0.0);

//     float f  = bumpFunction(p);
//     float fx = bumpFunction(p - e.xyy);
//     float fy = bumpFunction(p - e.yxy);
//     float fz = bumpFunction(p - e.yyx);
//     // Forward difference gradient (cheaper alternative)
//     //vec3 grad = vec3(fx - f, fy - f, fz - f) / e.x;
    
//     float fx2 = bumpFunction(p + e.xyy);
//     float fy2 = bumpFunction(p + e.yxy);
//     float fz2 = bumpFunction(p + e.yyx);
//     // Central difference gradient
//     vec3 grad = (vec3(fx - fx2, fy - fy2, fz - fz2)) / (e.x * 2.0);

//     // Remove normal component so we only perturb tangentially
//     grad -= n * dot(n, grad);

//     // Combine with original normal
//     return normalize(n + grad * bumpFactor);
// }

// void main()
// {
//     vec2 uv = (gl_FragCoord.xy*2. - u_resolution.xy)/u_resolution.y;
    
//     // Camera position and camera target follow the path
//     float vel = u_time * 1.5;
//     vec3 ro = vec3(path(vel - 1.), vel - 1.);
//     vec3 ta = vec3(path(vel), vel);
    
//     // Set up ray direction
//     vec3 fwd = normalize(ta - ro);
//     vec3 up = vec3(0, 1., 0);
//     vec3 right = cross(fwd, up);;
//     up = cross(right, fwd);
//     float fl = 1.2;
//     vec3 rd = normalize(fwd + fl * (uv.x*right + uv.y*up));
    
//     // Set up golden glow
//     float glow;
//     vec3 glowCol = vec3(9., 7., 4.);
    
//     // Set up raymarching
//     float t;
//     vec3 col;
    
//     for (int i=0; i<125; i++){
//         vec3 p = ro + t*rd;
//         float d = map(p);
        
//         // Add glow each step based on distance to edge tunnel
//         glow += exp(-d * 8.) * .005;
        
//         if (d<.01){
//             // Get light direction from normal, then distort normal for the tiles
//             vec3 n = normal(p);
//             vec3 lightDir = n;
//             n = bumpNormal(p, n, .02);
            
//             // Get ring and angle of position
//             vec2 c = path(p.z);
//             vec2 id = vec2(floor(p.z*4.-.25), atan(p.y-c.y, p.x-c.x));
            
            
//             // Set the color of the tile based on the id
//             vec3 tileCol = vec3(.7);
//             tileCol += .4*vec3(sin(id.x), cos(id.x), 0);
//             tileCol += .3*sin(id.x*.5 + id.y*6. - u_time*4.);
//             vec3 tileGray  = vec3(.5);
//             float height = bumpFunction(p);
//             vec3 baseCol = mix(tileGray, tileCol, height);
            
//             // Lighting: diffuse, specular and reflected light
//             float diffuseL = max(dot(n, lightDir), 0.);
//             col += diffuseL * baseCol;
            
//             vec3 h = normalize(lightDir - rd);
//             float specL = pow(max(dot(n, h), 0.), 64.);
//             col += specL * .3;
            
//             vec3 r = reflect(rd, n);
//             vec3 reflCol = vec3(0.0);
//             col = mix(col, reflCol, .3);
            
//             break;
//         }
        
//         t+=d;
//     }
    
//     // Add the golden glow
//     col += glowCol*glow;
    
//     // Gamma correction
//     col=pow(col, vec3(2.2));
    
//     // Output to screen
//      gl_FragColor = vec4(col,1.0);
// }