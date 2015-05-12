var Boid = function() {
  var vector = new THREE.Vector3();

  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  _acceleration = new THREE.Vector3();

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

  this.cohesion = function ( boids ) {
    var boid, distance,
    posSum = new THREE.Vector3(),
    steer = new THREE.Vector3(),
    count = 0;

    for ( var i = 0, il = boids.length; i < il; i ++ ) {
      if ( Math.random() > 0.6 ) continue;

      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= _neighborhoodRadius ) {
        posSum.add( boid.position );
        count++;
      }
    }

    if ( count > 0 ) {
      posSum.divideScalar( count );
    }

    steer.subVectors( posSum, this.position );
    var l = steer.length();

    if ( l > _maxSteerForce ) {
      steer.divideScalar( l / _maxSteerForce );
    }

    return steer;
  }

  this.alignment = function ( boids ) {
    var boid, velSum = new THREE.Vector3(),
    count = 0;

    for ( var i = 0, il = boids.length; i < il; i++ ) {
      if ( Math.random() > 0.6 ) continue;

      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= _neighborhoodRadius ) {
        velSum.add( boid.velocity );
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

  this.flock = function (boids) {
    _acceleration.add(this.separation(boids));
    _acceleration.add(this.cohesion(boids));
    //_acceleration.add(this.alignment(boids));

    this.velocity.add( _acceleration );

    var l = this.velocity.length();

    if ( l > _maxSpeed ) {
      this.velocity.divideScalar( l / _maxSpeed );
    }

    this.position.add( this.velocity );
    _acceleration.set( 0, 0, 0 );
  }
}
