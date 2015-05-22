var FishMesh = function() {
  THREE.Mesh.call(this, new Fish(), new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  }));

  this.phase = Math.floor( Math.random() * 62.83 );
}
FishMesh.prototype = new THREE.Mesh();
FishMesh.prototype.constructor = FishMesh;
