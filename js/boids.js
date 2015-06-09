var camera, scene, renderer, fish, fishes, boid, boids,FishMesh,bg;

var _neighborhoodRadius = 100, _maxSteerForce = 0.1, _maxSpeed = 4;
var clock = new THREE.Clock();
var stats = new Stats();

stats.setMode(1); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

function setupGUI() {
  var gui = new dat.GUI();

  gui.add(camera.position, 'x', -1000, 1000).step(10);
  gui.add(camera.position, 'y', -1000, 1000).step(10);
  gui.add(camera.position, 'z', -1000, 1000).step(10);
}

document.body.appendChild(stats.domElement);

function init() {
  renderer = new THREE.WebGLRenderer({antialias:true} );
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x331188,700,3000 );

  renderer.setClearColor(0x331188, 1);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFShadowMap;

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000000 );

  camera.position.z = 450;
  camera.position.y = 200;

  var ambientLight = new THREE.AmbientLight( 0x113344 );
  ambientLight.shadowCameraVisible = true;
  ambientLight.castShadow = true;
  ambientLight.shadowDarkness = 0.5;
  scene.add( ambientLight );

  var light = new THREE.PointLight( 0xcc44ff, 1, 1000 );
  light.position.set( 50, 200, -50 );
  light.castShadow = true;
  light.shadowDarkness = 0.5;
  scene.add( light );

  var light2 = new THREE.SpotLight( 0xcc4499, 1, 1000 );
  light2.position.set( -150, 400, 50 );
  light2.castShadow = true;
  light2.shadowDarkness = 0.5;
  light2.shadowCameraVisible = true;
  scene.add( light2 );

  fishes = [];
  boids = [];

  for (var i = 0; i < 100; i++) {
    boid = boids[i] = new Boid();

    boid.position.x = Math.random() * 400 - 200;
    boid.position.y = Math.random() * 800 - 100;
    boid.position.z = Math.random() * 200 - 400;
    boid.velocity.x = Math.random() * 2 - 1;
    boid.velocity.y = Math.random() * 2 - 1;
    boid.velocity.z = Math.random() * 2 - 1;
  }


  var loader = new THREE.ObjectLoader();
  loader.load("assets/fish_c.json", function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.scale.set(10, 10, 10);

        for (var i = 0; i < 50; i++) {
          fish = fishes[i] = child.clone();
          fish.receiveShadow = true;
          fish.castShadow = true;
          scene.add(fish);
        }
      }
    });
  });

  var geometry = new THREE.BoxGeometry( 50, 50, 50 );
var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );
cube.castShadow= true;
cube.receiveShadow = true;

var planeGeo = new THREE.PlaneGeometry(300,300,300);
var planeMat = new THREE.MeshLambertMaterial({color: 0xffffff});
var plane = new THREE.Mesh(planeGeo,planeMat);
scene.add(plane);
plane.rotation.x= -Math.PI/2;
plane.receiveShadow = true;
plane.castShadow = false;

  var axisHelper = new THREE.AxisHelper(100);
  axisHelper.position.y = 100;
  axisHelper.position.x = -100;
  scene.add(axisHelper);

 var loader2 = new THREE.ColladaLoader();
 loader2.load(
  // resource URL
  'assets/bg.dae',
  // Function when resource is loaded
  function ( collada ) {
    bg = collada.scene;
    bg.receiveShadow = true;
    bg.castShadow = true;
    scene.add( bg );
    bg.scale.x -= 15;
    bg.scale.y = 15;
    bg.scale.z -= 15;
    bg.rotation.x = Math.PI/2;
    bg.rotation.z -= .4;
    bg.position.x -= 1500;
    bg.position.y -=50;
  },
  // Function called when download progresses
  function ( xhr ) {
    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
  }
);

  setupGUI();

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

    fish.rotation.z = Math.atan2(- boid.velocity.z, boid.velocity.x);
    fish.rotation.y = Math.asin(boid.velocity.y / boid.velocity.length()) * 0.2;

   // fish.phase = ( fish.phase + ( Math.max( 0, fish.rotation.z ) + 0.1 )  ) % 62.83;
  }

  THREE.AnimationHandler.update( clock.getDelta() );

  renderer.render(scene, camera);
}

init();
animate();
