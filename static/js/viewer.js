// Copyright (c) Tumiz.
// Distributed under the terms of the GPL-3.0 License.

var objects = {}
var scene = new THREE.Scene();
scene.background=new THREE.Color(0.1,0.1,0.1)
var fov_y = 60
var aspect = window.innerWidth / window.innerHeight;
var perspCamera = new THREE.PerspectiveCamera(fov_y, aspect, 0.1, 1000);
perspCamera.up.set(0, 0, 1)
perspCamera.position.set(0, 0, 30)
var Z = perspCamera.position.length();
var depht_s = Math.tan(fov_y / 2.0 * Math.PI / 180.0) * 2.0
var size_y = depht_s * Z;
var size_x = depht_s * Z * aspect
var orthoCamera = new THREE.OrthographicCamera(
    -size_x / 2, size_x / 2,
    size_y / 2, -size_y / 2,
    1, 1000);
orthoCamera.up.set(0, 0, 1)
orthoCamera.position.copy(perspCamera.position)
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var light = new THREE.PointLight(0xffffff, 1);
light.position.set(1000, 1000, 1000)

var grid = new THREE.GridHelper(1000, 1000);
grid.rotation.set(Math.PI / 2, 0, 0)
scene.add(grid, light);

var xAxis = Line()
xAxis.set_points([new THREE.Vector3(0, 0, 0), new THREE.Vector3(50, 0, 0)])
xAxis.material.color = new THREE.Color('red')
xAxis.material.linewidth = 3
var yAxis = Line()
yAxis.set_points([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 50, 0)])
yAxis.material.color = new THREE.Color('green')
yAxis.material.linewidth = 3
scene.add(xAxis, yAxis)

var controls = new OrbitControls(perspCamera, orthoCamera, renderer.domElement);
var animate = function () {
    light.position.copy(controls.object.position)
    renderer.render(scene, controls.object)
    requestAnimationFrame(animate)
}
animate()

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var selected = null
var div_info=document.getElementById("info")
var div_play=document.getElementById("btn")
var div_userdefined=document.getElementById("userdefined")
window.onclick=function( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        // update the picking ray with the camera and mouse position
	var intersect = pick(mouse)

	// calculate objects intersecting the picking ray
    if(intersect) {
        if(selected){
            selected.material.wireframe=false
        }
        if(selected != intersect.object){
            selected = intersect.object
            selected.material.wireframe=true
        }else{
            selected = null
        }
        div_info.innerHTML=infof()
    }
}

div_play.onclick=function(){
    ws.send(JSON.stringify({cmd:"pause",data:div_play.innerHTML}))
    div_play.innerHTML=div_play.innerHTML=="⏹️"?"▶️":"⏹️"
    div_play.manual=true
}
function pick(mouse){
    var intersect=null
    var intersect_range=1000
    raycaster.setFromCamera( mouse, controls.object )
    var tmp = scene.children.slice(4,scene.children.length)
    for(var i in tmp){
        var obj = tmp[i]
        if(new THREE.Vector3().subVectors(obj.position,controls.object.position).length()<intersect_range){
            var intersects = raycaster.intersectObject( obj );
            if(intersects.length) {
                var d=new THREE.Vector3().subVectors(intersects[0].point,controls.object.position).length()
                if(d<intersect_range){
                    intersect_range=d
                    intersect=intersects[0]
                }
            }
        }
    }
    return intersect;
}

var time=0
function infof(){
    return time+" s"+(selected?"  id:"+selected.id
        +"  position:"+selected.position.x.toFixed(3)+","+selected.position.y.toFixed(3)+","+selected.position.z.toFixed(3)
    +"  rotation:"+selected.rotation.x.toFixed(3)+","+selected.rotation.y.toFixed(3)+","+selected.rotation.z.toFixed(3):"")
}

function new_object(message) {
    switch (message.class) {
        case "Cube":
            return Cube()
        case "Sphere":
            return Sphere()
        case "XYZ":
            return new THREE.AxesHelper(message.size)
        case "Line":
            return Line()
        case "Cylinder":
            return Cylinder()
        default:
            return null
    }
}
function update(message, obj) {
    var position = message.position
    var rotation = message.rotation
    var scale = message.scale
    obj.position.set(position[0], position[1], position[2])
    obj.rotation.set(rotation[0], rotation[1], rotation[2])
    obj.scale.set(scale[0], scale[1], scale[2])
    obj.material.color.setRGB(message.color[0], message.color[1], message.color[2])
    obj.material.opacity = message.color[3]
    obj.material.linewidth = message.line_width
    if(obj.update)
        obj.update(message)
}

function annotate2d(text, x, y, color){
    var div=document.createElement("div")
    div.innerText=text
    div.style.position="absolute"
    div.style.left=x+"px"
    div.style.top=y+"px"
    div.style.color=color
    document.body.append(div)
    return div
}

function annotate(text, position, color){
    var div=document.createElement("div")
    div.innerText=text
    div.style.position="absolute"
    position.project(controls.object)
    div.style.left=(1+position.x)*window.innerWidth/2+"px"
    div.style.top=(1-position.y)*window.innerHeight/2+"px"
    div.style.color=color
    document.body.append(div)
    return div
}