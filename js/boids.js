var camera, scene, renderer, fish, fishes, boid, boids, bg
  clock = new THREE.Clock(), stats = new Stats();

var _neighborhoodRadius = 100, _maxSteerForce = 0.1, _maxSpeed = 5,
  _alignment = 100, _cohesion = 500, _separation = 100, _width = 2000,
  _height = 500, _depth = 1000;

var zoomBlurPass, dirtPass, multiPassBloomPass, dofPass, composer;

var NUMBER_OF_BOIDS = 50;

stats.setMode(0); // 0: fps, 1: ms

stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

function setupGUI() {
  var gui = new dat.GUI();

  gui.add(camera.position, 'x', -500, 500).step(10);
  gui.add(camera.position, 'y', -500, 500).step(10);
  gui.add(camera.position, 'z', -500, 3000).step(10);
  gui.add(this, '_maxSpeed', 1, 25).step(1);
  gui.add(this, '_alignment', 10, 500).step(10);
  gui.add(this, '_cohesion', 10, 500).step(10);
  gui.add(this, '_separation', 10, 500).step(10);
  gui.add(this, '_width', 100, 2500).step(100);
  gui.add(this, '_height', 100, 2500).step(100);
  gui.add(this, '_depth', 100, 2500).step(100);
}

function init() {
  renderer = new THREE.WebGLRenderer({antialias:true} );
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x331188,700,3000 );

  renderer.setClearColor(0x331188, 1);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFShadowMap;

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 1000000 );

  camera.position.z = 1500;
  camera.position.y = 200;

  var ambientLight = new THREE.AmbientLight( 0x113344 );
  scene.add( ambientLight );

  var shadowLight = new THREE.SpotLight( 0xffffff, 1, 0,Math.PI/2,1 );
  shadowLight.position.set( 0, 1500, 50 );
  shadowLight.castShadow = true;
  shadowLight.shadowDarkness = 0.5;
  //shadowLight.shadowCameraVisible = true;
  shadowLight.shadowBias = 0.0001;
  shadowLight.shadowDarkness = 0.5;
  shadowLight.shadowMapWidth = 1024;
  shadowLight.shadowMapHeight = 512;
  scene.add( shadowLight );

  fishes = [];
  boids = [];

  for (var i = 0; i < NUMBER_OF_BOIDS; i++) {
    boid = boids[i] = new Boid();

    boid.position.x = Math.random() * 400 - 200;
    boid.position.y = Math.random() * 400 - 200;
    boid.position.z = Math.random() * 400 - 200;
    boid.velocity.x = Math.random() * 2 - 1;
    boid.velocity.y = Math.random() * 2 - 1;
    boid.velocity.z = Math.random() * 2 - 1;
  }

  var loader = new THREE.ObjectLoader();
  loader.load("assets/fish_c.json", function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.scale.set(10, 10, 10);

        for (var i = 0; i < NUMBER_OF_BOIDS; i++) {
          fish = fishes[i] = child.clone();
          fish.receiveShadow = true;
          fish.castShadow = true;
          scene.add(fish);
        }
      }
    });
  });

  var loader2 = new THREE.ColladaLoader();
  loader2.load('assets/bg2.dae', function(collada) {
    collada.scene.traverse(function(child) {
      child.receiveShadow = true;
      //child.castShadow = true;
    });
    bg = collada.scene;
    bg.scale.x -= 15;
    bg.scale.y = 15;
    bg.scale.z -= 15;
    bg.rotation.x = Math.PI/2;
    bg.rotation.z -= .4;
    bg.position.x -= 1500;
    bg.position.y -=50;
    scene.add( bg );
  });

  setupGUI();

  composer = new WAGNER.Composer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClearColor = true;

  zoomBlurPass = new WAGNER.ZoomBlurPass();
  multiPassBloomPass = new WAGNER.MultiPassBloomPass();
  dirtPass = new WAGNER.DirtPass();
  dofPass = new WAGNER.GuidedFullBoxBlurPass();

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

    for (var i = 0; i < boids.length; i++) {
      boid = boids[i];
      target.z = boid.position.z;
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
  var time = Date.now() * 0.00005;
  for ( i = 0; i < scene.children.length; i ++ ) {
    var object = scene.children[ i ];

    if ( object instanceof THREE.PointCloud ) {
      object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
    }
  }

  for (var i = 0, il = fishes.length; i < il; i++) {
    boid = boids[ i ];
    boid.flock( boids );

    if (boid.maxSpeed != _maxSpeed) boid.maxSpeed = _maxSpeed;
    if (boid.maxAlignment != _alignment) boid.maxAlignment = _alignment;
    if (boid.maxCohesion != _cohesion) boid.maxCohesion = _cohesion;
    if (boid.maxSeparation != _separation) boid.maxSeparation = _separation;
    if (boid.height != _height) boid.height = _height;
    if (boid.width != _width) boid.width = _width;
    if (boid.depth != _depth) boid.depth = _depth;

    fish = fishes[ i ];
    fish.position.copy( boids[ i ].position );

    fish.rotation.z = Math.atan2(- boid.velocity.z, boid.velocity.x);
    fish.rotation.y = Math.asin(boid.velocity.y / boid.velocity.length()) * 0.2;

   // fish.phase = ( fish.phase + ( Math.max( 0, fish.rotation.z ) + 0.1 )  ) % 62.83;
  }


  composer.reset();
  composer.render( scene, camera );
  composer.pass( dofPass );
  //composer.pass( multiPassBloomPass );
  //composer.pass( zoomBlurPass );
  composer.toScreen();

  //THREE.AnimationHandler.update( clock.getDelta() );
}

init();
animate();
