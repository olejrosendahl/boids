var Boid = function() {
  var _acceleration, _width = 2000, _height = 500, _depth = 4000, _maxSpeed = 5,
  _alignment = 100, _cohesion = 500, _separation = 100;

  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  _acceleration = new THREE.Vector3();

  this.flock = function (boids) {
    this.checkBorder();

    if (Math.random() > 0.5) {
      _acceleration.add(this.alignment(boids));
      _acceleration.add(this.cohesion(boids));
      _acceleration.add(this.separation(boids));
    }

    this.velocity.add(_acceleration);
    var l = this.velocity.length();

    if (l > _maxSpeed)
      this.velocity.divideScalar(l / _maxSpeed);

    this.position.add(this.velocity);
    _acceleration.set(0, 0, 0);
  }

  this.checkBorder = function () {
    vector = new THREE.Vector3();

    vector.set(-_width, this.position.y, this.position.z);
    vector = this.avoid(vector);
    vector.multiplyScalar(5);
    _acceleration.add(vector);

    vector.set(_width, this.position.y, this.position.z);
    vector = this.avoid(vector);
    vector.multiplyScalar(5);
    _acceleration.add(vector);

    vector.set(this.position.x, -_height, this.position.z);
    vector = this.avoid(vector);
    vector.multiplyScalar(5);
    _acceleration.add(vector);

    vector.set(this.position.x, _height, this.position.z);
    vector = this.avoid(vector);
    vector.multiplyScalar(5);
    _acceleration.add(vector);

    vector.set(this.position.x, this.position.y, -_depth);
    vector = this.avoid(vector);
    vector.multiplyScalar(5);
    _acceleration.add(vector);

    vector.set(this.position.x, this.position.y, _depth);
    vector = this.avoid(vector);
    vector.multiplyScalar(5);

    _acceleration.add(vector);
  }

  this.avoid = function (target) {
    var steer = new THREE.Vector3();

    steer.copy(this.position);
    steer.sub(target);
    steer.multiplyScalar(1 / this.position.distanceToSquared(target));

    return steer;
  }

  this.follow = function (target) {
    var distance = this.position.distanceTo(target);

    if (distance > 10) {
      var steer = new THREE.Vector3();
      steer.subVectors(this.position, target);
      steer.multiplyScalar(-0.5 / distance);
      _acceleration.add(steer);
    }
  }

  this.alignment = function (boids) {
    var boid, steer = new THREE.Vector3(), sumVelocity = new THREE.Vector3();

    for (var i = 0; i < boids.length; i ++) {
      boid = boids[i];
      if (boid != this)
        sumVelocity.add(boid.velocity);
    }

    sumVelocity.divideScalar(boids.length - 1);
    steer.subVectors(sumVelocity, this.velocity);
    steer.divideScalar(_alignment);

    return steer;
  }

  this.cohesion = function (boids) {
    var boid, distance, sumPositions = new THREE.Vector3(), steer = new THREE.Vector3();

    for (var i = 0; i < boids.length; i ++) {
      boid = boids[i];
      if (boid != this)
        sumPositions.add(boid.position);
    }

    sumPositions.divideScalar(boids.length - 1);
    steer.subVectors(sumPositions, this.position);
    steer.divideScalar(_cohesion);

    return steer;
  }

  this.separation = function (boids) {
    var boid, distance, sumPositions = new THREE.Vector3(), steer = new THREE.Vector3();

    for (var i = 0; i < boids.length; i++) {
      boid = boids[i];
      distance = boid.position.distanceTo(this.position);

      if(boid != this && distance < _separation){
        steer.subVectors(this.position, boid.position);
        steer.normalize();
        steer.divideScalar(distance / 10);
        sumPositions.add(steer);
      }
    }

    return sumPositions;
  }
}
