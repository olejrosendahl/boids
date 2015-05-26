var camera, scene, renderer, fish, fishes, boid, boids,ground,FishMesh;
var _neighborhoodRadius = 100, _maxSteerForce = 0.1, _maxSpeed = 4;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer({antialias:true} );
  scene = new THREE.Scene();


  renderer.setClearColor(0x331188, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
  
  // ortho cam might be a better idea
  //var camera = new THREE.OrthographicCamera( window.innerWidth  / - 2, window.innerWidth  / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
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

 // var geometry = new THREE.PlaneGeometry(50, 15, 2, 1); 

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

  //mesh

// var loader = new THREE.ColladaLoader();

// loader.load(
//   'assets/test.dae',
//   // Function when resource is loaded
//   function ( collada ) { ground = collada.scene;
//     ground.position.y -= 200;
//     ground.scale.x = ground.scale.z = ground.scale.y = 57;
//     ground.rotation.x =180;
//     scene.add( ground);
//   },
//   // Function called when download progresses
//   function ( xhr ) {
//     console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
//   }
// );

  ///////////
  // FLOOR //
  ///////////
  
  // note: 4x4 checkboard pattern scaled so that each square is 25 by 25 pixels.
  var floorTexture = new THREE.ImageUtils.loadTexture( 'assets/ground.jpg' );
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 

  var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
  var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
 
  floor.rotation.x = Math.PI / 8;
  scene.add(floor);

var loaderFish = new THREE.ColladaLoader();

// loaderFish.load(
//   'assets/Fish.dae',
//   // Function when resource is loaded
//   function ( collada ) { FishMesh = collada.scene;
//     //FishMesh.position.y -= 200;
//     FishMesh.scale.x = FishMesh.scale.z = FishMesh.scale.y = 570;
//     //FishMesh.rotation.x =180;
//     scene.add( FishMesh);
//   },
//   // Function called when download progresses
//   function ( xhr ) {
//     console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
//   }
// );

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
