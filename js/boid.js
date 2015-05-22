var Boid = function() {
  var vector = new THREE.Vector3();

  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  _acceleration = new THREE.Vector3();

  var _width = 500,
    _height = 500,
    _depth = 200,
    _neighborhoodRadius = 100;

  this.separation = function ( boids ) {
    var boid, distance,
    posSum = new THREE.Vector3(),
    repulse = new THREE.Vector3();

    for ( var i = 0, il = boids.length; i < il; i ++ ) {
      if ( Math.random() > 0.6 ) continue;

      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= _neighborhoodRadius ) {
        repulse.subVectors( this.position, boid.position );
        repulse.normalize();
        repulse.divideScalar( distance );
        posSum.add( repulse );
      }
    }

    return posSum;
  }

  this.cohesion = function (boids) {
    var boid, distance,
    posSum = new THREE.Vector3(),
    steer = new THREE.Vector3(),
    count = 0;

    for (var i = 0, il = boids.length; i < il; i++) {
      if (Math.random() > 0.6) continue;

      boid = boids[ i ];
      distance = boid.position.distanceTo(this.position);

      if (distance > 0 && distance <= _neighborhoodRadius) {
        posSum.add(boid.position);
        count++;
      }
    }

    if (count > 0) {
      posSum.divideScalar(count);
    }

    steer.subVectors(posSum, this.position);
    var l = steer.length();

    if (l > _maxSteerForce) {
      steer.divideScalar(l / _maxSteerForce);
    }

    return steer;
  }

  this.alignment = function (boids) {
    var boid, velSum = new THREE.Vector3(),
    count = 0;

    for ( var i = 0, il = boids.length; i < il; i++ ) {
      if ( Math.random() > 0.6 ) continue;

      boid = boids[ i ];
      distance = boid.position.distanceTo(this.position);

      if (distance > 0 && distance <= _neighborhoodRadius) {
        velSum.add(boid.velocity);
        count++;
      }
    }

    if ( count > 0 ) {
      velSum.divideScalar( count );
      var l = velSum.length();

      if ( l > _maxSteerForce ) {
        velSum.divideScalar( l / _maxSteerForce );
      }
    }

    return velSum;
  }

  this.avoidWalls = function(boids) {
    vector.set( - _width, this.position.y, this.position.z );
    vector = this.avoid( vector );
    vector.multiplyScalar( 5 );
    _acceleration.add( vector );

    vector.set( _width, this.position.y, this.position.z );
    vector = this.avoid( vector );
    vector.multiplyScalar( 5 );
    _acceleration.add( vector );

    vector.set( this.position.x, - _height, this.position.z );
    vector = this.avoid( vector );
    vector.multiplyScalar( 5 );
    _acceleration.add( vector );

    vector.set( this.position.x, _height, this.position.z );
    vector = this.avoid( vector );
    vector.multiplyScalar( 5 );
    _acceleration.add( vector );

    vector.set( this.position.x, this.position.y, - _depth );
    vector = this.avoid( vector );
    vector.multiplyScalar( 5 );
    _acceleration.add( vector );

    vector.set( this.position.x, this.position.y, _depth );
    vector = this.avoid( vector );
    vector.multiplyScalar( 5 );
    _acceleration.add( vector );
  }

  this.avoid = function(target) {
    var steer = new THREE.Vector3();

    steer.copy(this.position);
    steer.sub(target);

    steer.multiplyScalar(1/this.position.distanceToSquared(target));

    return steer;
  }

  this.flock = function (boids) {
    _acceleration.add(this.separation(boids));
    _acceleration.add(this.cohesion(boids));
    _acceleration.add(this.alignment(boids));

    this.avoidWalls(boids);
    this.velocity.add( _acceleration );

    var l = this.velocity.length();

    if ( l > _maxSpeed ) {
      this.velocity.divideScalar( l / _maxSpeed );
    }

    this.position.add( this.velocity );
    _acceleration.set( 0, 0, 0 );
  }
}
