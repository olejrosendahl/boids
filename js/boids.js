var camera, scene, renderer, fish, fishes, boid, boids,ground,FishMesh;
var _neighborhoodRadius = 100, _maxSteerForce = 0.1, _maxSpeed = 4;
var clock = new THREE.Clock();
var stats = new Stats();

stats.setMode(1); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild(stats.domElement);

function init() {
  renderer = new THREE.WebGLRenderer({antialias:true} );
  scene = new THREE.Scene();

  renderer.setClearColor(0x331188, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.OrthographicCamera(
    window.innerWidth  / 2,
    window.innerWidth  / - 2,
    window.innerHeight / 2,
    window.innerHeight / - 2,
    1,
    1000
  );
  camera.position.y = 400;
  camera.position.z = -300;
  camera.rotation.x =-9;

  var ambientLight = new THREE.AmbientLight( 0x113344 ); // soft white light
  scene.add( ambientLight );

  var light = new THREE.PointLight( 0xcc44ff, 1, 1000 );
  light.position.set( 50, 50, 50 );
  scene.add( light );

  var light2 = new THREE.PointLight( 0xcc4499, 1, 1000 );
  light2.position.set( -500, 500, 50 );
  scene.add( light2 );

  fishes = [];
  boids = [];

  var ambientLight = new THREE.AmbientLight( 0x113344 );
  scene.add( ambientLight );

  var light = new THREE.PointLight( 0xcc44ff, 1, 1000 );
  light.position.set( 50, 50, 50 );
  scene.add( light );

  var light2 = new THREE.PointLight( 0xcc4499, 1, 1000 );
  light2.position.set( -500, 500, 50 );
  scene.add( light2 );

  var geometry = new THREE.PlaneGeometry(50, 15, 2, 1);

  for (var i = 0; i < 100; i++) {
    boid = boids[i] = new Boid();

    boid.position.x = Math.random() * 400 - 200;
    boid.position.y = Math.random() * 100 - 100;
    boid.position.z = Math.random() * 400 - 200;
    boid.velocity.x = Math.random() * 2 - 1;
    boid.velocity.y = Math.random() * 2 - 1;
    boid.velocity.z = Math.random() * 2 - 1;
  }

  var floorTexture = new THREE.ImageUtils.loadTexture( 'assets/ground.jpg' );
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;

  var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
  var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);

  floor.rotation.x = Math.PI / 8;
  //scene.add(floor);

  var loader = new THREE.ObjectLoader();
  loader.load("assets/fish.json", function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.scale.set(20, 20, 20);

        for (var i = 0; i < 100; i++) {
          fish = fishes[i] = child.clone();
          scene.add(fish);
        }
      }
    });
  });

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
      target.z = 0;
      boid.follow(target);
    }
  });
}

function animate() {
  stats.begin();
  render();
  stats.end();
  requestAnimationFrame(animate);
}

function render() {
  for (var i = 0, il = fishes.length; i < il; i++) {
    boid = boids[ i ];
    boid.flock( boids );

    fish = fishes[ i ];
    fish.position.copy( boids[ i ].position );

    fish.rotation.y = Math.atan2(- boid.velocity.z, boid.velocity.x);
    fish.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length()) * 0.2;

    fish.phase = ( fish.phase + ( Math.max( 0, fish.rotation.z ) + 0.1 )  ) % 62.83;
  }

  THREE.AnimationHandler.update( clock.getDelta() );

  renderer.render(scene, camera);
}

init();
animate();
