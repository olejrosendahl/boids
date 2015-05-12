var Fish = function() {
  THREE.PlaneGeometry.call(this, 30, 15, 2, 1);
}
Fish.prototype = new THREE.PlaneGeometry();
Fish.prototype.constructor = Fish;
