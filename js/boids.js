var camera, scene, renderer, fish, fishes, boid, boids;
var _neighborhoodRadius = 100, _maxSteerForce = 0.1, _maxSpeed = 4;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
  
  // ortho cam might be a better idea
  //var camera = new THREE.OrthographicCamera( window.innerWidth  / - 2, window.innerWidth  / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
  camera.position.y = 400;
  camera.rotation.x =-90;
  //camera.rotation.z =-90;

  scene = new THREE.Scene();

  fishes = [];
  boids = [];

  var geometry = new THREE.PlaneGeometry(50, 15, 2, 1);

  for (var i = 0; i < 100; i++) { //100 fishes will be good for now
    boid = boids[i] = new Boid();

    boid.position.x = Math.random() * 400 - 200;
    boid.position.y = Math.random() * 100 - 100; // fishes are now all in the aquarium
    boid.position.z = Math.random() * 400 - 200;
    boid.velocity.x = Math.random() * 2 - 1;
    boid.velocity.y = Math.random() * 2 - 1;
    boid.velocity.z = Math.random() * 2 - 1;

    fish = fishes[i] = new FishMesh();
    scene.add(fish);
  }

  window.addEventListener('resize', function(e) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}


function animate() {
  requestAnimationFrame(animate);
  render();
}
function render() {
  for (var i = 0, il = fishes.length; i < il; i++) {
    boid = boids[ i ];
    boid.flock( boids );

    fish = fishes[ i ];
    fish.position.copy( boids[ i ].position );

    color = fish.material.color;
    color.r = color.g = color.b = ( 500 + fish.position.y ) / 1000; //fog it is probably, made it work with depth

    fish.rotation.y = Math.atan2(- boid.velocity.z, boid.velocity.x);
    fish.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length()) * 0.2;

    fish.phase = ( fish.phase + ( Math.max( 0, fish.rotation.z ) + 0.1 )  ) % 62.83;

    fish.geometry.vertices[3].z = Math.sin(fish.phase) * 2;
    fish.geometry.vertices[0].z = Math.sin(fish.phase) * 2;
  }

  renderer.render(scene, camera);
}
