// Copyright (c) Tumiz.
// Distributed under the terms of the GPL-3.0 License.

function Sphere() {
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshLambertMaterial({ transparent: true, color: 0x00ff00 });
    var obj = new THREE.Mesh(geometry, material);
    return obj
}
function Cube() {
    var geometry = new THREE.BoxGeometry();
    var material = new THREE.MeshLambertMaterial({ transparent: true });
    var cube = new THREE.Mesh(geometry, material);
    return cube
}
function Line() {
    var material = new THREE.LineBasicMaterial();
    var geometry = new THREE.BufferGeometry
    var line = new THREE.Line(geometry, material)
    line.points = new Array
    line.add_point = function (point) {
        if (point instanceof THREE.Vector3){
            this.points.push(point)
            this.geometry.setFromPoints(this.points)
        } else {
            console.error("point's type must be THREE.Vector3")
        }
    }
    line.set_points = function (points) {
        this.points=points
        this.geometry.setFromPoints(this.points)
    }
    line.length = function(){
        var length=0
        for(var i=0,l=this.points.length;i+1<l;i++){
            length+=this.points[i+1].distanceTo(this.points[i])
        }
        return length
    }
    return line
}

function Cylinder() {
    var geometry = new THREE.CylinderGeometry(1, 1, 2, 32)
    var material = new THREE.MeshLambertMaterial({ transparent: true });
    var cylinder = new THREE.Mesh(geometry, material)
    cylinder.axis = new THREE.Vector3(0,1,0)
    cylinder.set_axis = function (direction) {
        direction.normalize()
        cylinder.axis.copy(direction)
        var axis = new THREE.Vector3().crossVectors(this.up, direction)
        var angle = this.up.angleTo(direction)
        axis.normalize()
        this.setRotationFromAxisAngle(axis, angle)
    }
    // cylinder.apply_parameters(parameters){
    //     cylinder.geometry = new THREE.CylinderGeometry(parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments)

    // }
    cylinder.set_top_radius = function (radius) {
        cylinder.geometry = new THREE.CylinderGeometry(radius, cylinder.geometry.parameters.radiusBottom, cylinder.geometry.parameters.height, cylinder.geometry.parameters.radialSegments)
    }
    cylinder.set_bottom_radius = function (radius) {
        cylinder.geometry = new THREE.CylinderGeometry(cylinder.geometry.parameters.radiusTop, radius, cylinder.geometry.parameters.height, cylinder.geometry.parameters.radialSegments)
    }
    cylinder.set_height = function (height) {
        console.log(cylinder.geometry.parameters.height)
        cylinder.geometry = new THREE.CylinderGeometry(cylinder.geometry.parameters.radiusTop, cylinder.geometry.parameters.radiusBottom, height, cylinder.geometry.parameters.radialSegments)
        console.log(cylinder.geometry.parameters.height)
    }
    cylinder.set_top_center = function(point){
        cylinder.position.copy(new THREE.Vector3().subVectors(point,cylinder.axis.multiplyScalar(cylinder.geometry.parameters.height/2)))
    }
    cylinder.set_bottom_center = function(point){
        cylinder.position.copy(new THREE.Vector3().addVectors(point,cylinder.axis.multiplyScalar(cylinder.geometry.parameters.height/2)))
    }
    return cylinder
}

function Vector(){
    if (!arguments[0]){
        console.error("one point at least")
        return
    }
    var line = new Line
    var arrow = new Cylinder
    arrow.material = line.material
    var start_point = arguments[1] ? arguments[0] : new THREE.Vector3
    var end_point = arguments[1] ? arguments[1] : arguments[0]
    var direction = new THREE.Vector3().subVectors(end_point, start_point) 
    if(direction.length()>0){
        line.set_points([start_point, end_point])
        arrow.set_top_radius(0)
        arrow.set_bottom_radius(0.15)
        arrow.set_height(1)
        arrow.set_axis(direction)
        arrow.set_top_center(end_point)
        line.add(arrow)
    }else{
        console.error("start point and end point is the same")
        return
    }
    line.set_arrow_radius=function(radius){
        arrow.set_bottom_radius(radius)
    }
    line.set_arrow_length=function(length){
        arrow.set_height(length)
        arrow.set_top_center(end_point)
    }
    return line
}

