var camera, scene, renderer, fish, fishes, boid, boids;
var _neighborhoodRadius = 100, _maxSteerForce = 0.1, _maxSpeed = 4;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 200;

  scene = new THREE.Scene();

  fishes = [];
  boids = [];

  var geometry = new THREE.PlaneGeometry(50, 15, 2, 1);

  for (var i = 0; i < 200; i++) {
    boid = boids[i] = new Boid();

    boid.position.x = Math.random() * 400 - 200;
    boid.position.y = Math.random() * 400 - 200;
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

  window.addEventListener('mousemove', function(e) {
    var boid, target = new THREE.Vector3(
      event.clientX - window.innerWidth / 2,
      -event.clientY + window.innerHeight / 2,
      0
    );

    target.unproject(camera);

    for (var i = 0; i < boids.length; i++) {
      boid = boids[i];
      target.z = boid.position.z;
      boid.follow(target);
    }
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
    color.r = color.g = color.b = ( 500 - fish.position.z ) / 1000;

    fish.rotation.y = Math.atan2(- boid.velocity.z, boid.velocity.x);
    fish.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length()) * 0.2;

    fish.phase = ( fish.phase + ( Math.max( 0, fish.rotation.z ) + 0.1 )  ) % 62.83;

    fish.geometry.vertices[3].z = Math.sin(fish.phase) * 2;
    fish.geometry.vertices[0].z = Math.sin(fish.phase) * 2;
  }

  renderer.render(scene, camera);
}
