/**
  *
  *@author Franz Weidmann https://github.com/Aequalitas
  *
  */


"use strict"

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000 );
let txtLoader = new THREE.TextureLoader();
let texture = null;
let mesh = null;
let renderer = null;
let ambientLight, directionalLight1, directionalLight2, directionalLight3 = null;
let material = new THREE.MeshNormalMaterial({
  overdraw: 1,
  wireframe: false,
  vertexColors: THREE.FaceColors
});
let constrols = null;
let modelTexturePath = null;
let modelFilePath = "/3dmodels/chair/chair.obj";
let canWriteTextTimer = null;
let globalProgress = 0.00;

scene.add(camera);
init();

function init(){
  if(mesh == null){
    createLight();
    createRenderer();
    constrols = new THREE.OrbitControls(camera, renderer.domElement);
    render();
  }
  createMainModel();
}

function render(){
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function createRenderer(){
  renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  document.getElementById("model").appendChild(renderer.domElement);
  renderer.setSize((window.innerWidth*0.75), (window.innerHeight*0.95));
}

function createLight(){
  ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.2);
  directionalLight1.position.set(0, 1, 0);
  scene.add(directionalLight1);

  directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
  directionalLight2.position.set(0, -1, 0);
  scene.add(directionalLight2);

  directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight3.position.set(-2, 0, 0);
  scene.add(directionalLight3);

}

function loadTexture(){
  if(modelTexturePath){
      txtLoader.load(modelTexturePath, _texture => {
       
        material = new THREE.MeshBasicMaterial(
        {
          map: _texture
        });
        
        mesh.traverse( child => {
            if (child.isMesh) {
                child.material = material;
            }
        });

        setPBar(100.00);
        texture = _texture;
        
      }, (xhr) => {
        let pctLoaded = xhr.loaded / xhr.total * 100
        setPBar(pctLoaded)
        console.log( ( pctLoaded ) + '% texture loaded' );
      }, (error) => {
        console.log(error);
      });
  } else {
    console.log("Error loading texture");
    alert("Error loading texutre!");
  }    
}
function createMainModel(){
  if (window.File && window.FileReader && window.Blob) {
  } else {
    alert('The File APIs are not fully supported in this browser.');
    return;
  }

  scene.remove(mesh);
  
  let loader = new THREE.OBJLoader();
  loader.load(
    // resource URL
    modelFilePath,
    // called when resource is loaded
    function ( object ) {
      mesh = object;

      if(!modelTexturePath){
        object.scale.set(0.2,0.2,0.2);
        scene.add(object);
        setPBar(100.00);
        setCamera();
      } 
    },
    // called when loading is in progresses
    function ( xhr ) {
      
      let pctLoaded = xhr.loaded / xhr.total * 100
      setPBar(pctLoaded)
      console.log((pctLoaded) + '% model loaded' );
  
    },
    // called when loading has errors
    function ( error ) {
  
      console.log( 'An error happened' );
      alert("Error loading Model!")
    }
  );

}


function handleFileSelect(evt){

  setPBar(0.00);
  document.getElementById("progressModelLoad").style.display = "block";
  document.getElementById("model").style.display = "none";

  let reader = new FileReader();

  reader.onload = file => {
    modelTexturePath = file.target.result;
    loadTexture();
  };

  reader.onprogress =  xhr => {
    if (xhr.lengthComputable){
      let percentComplete = Math.round(xhr.loaded / xhr.total * 100, 2);
      setPBar(percentComplete);
      console.log(percentComplete + '% downloaded');
    }
  }

  reader.onerror = xhr => {
        alert('An error occurred reading this file.');
        console.log(xhr.target.error);
      }

  reader.readAsDataURL(evt.target.files[0]);
}

function setPBar(percent){

  if(percent == 0.00)
    globalProgress = percent;
  else
    globalProgress += percent;
  
  let progressBar = document.getElementById("progressModelLoad");
  if(progressBar !== undefined){
    progressBar.childNodes[1].style.width = percent + "%";
    progressBar.childNodes[1].setAttribute("aria-valuenow",percent+"");
  }

  if(percent == 100.00){
    document.getElementById("progressModelLoad").style.display = "block";
    document.getElementById("model").style.display = "inline";
  }else{
    document.getElementById("progressModelLoad").style.display = "block";
    document.getElementById("model").style.display = "none";
  }
}

function setCamera(){
  // Give the renderer time to build the model + text
  // and then set the camera.
  let x = mesh.position.x;
  let y = new THREE.Box3().setFromObject(mesh).getSize().y;
  let z = new THREE.Box3().setFromObject(mesh).getSize().z;
  camera.position.set(x+30, y-150, z+100);

}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth*0.75, window.innerHeight*0.75);
}

function exportModel() {
  let exporter = new THREE.STLExporter();
  let stlString = exporter.parse(scene);
  let blob = new Blob([stlString], {type: 'text/plain'});

  let downloadLink = document.createElement("a");
  downloadLink.download = 'Model.stl';
  downloadLink.innerHTML = "Download File";
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.onclick = event => {document.body.removeChild(event.target)};
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);

  downloadLink.click();

}

window.addEventListener( 'resize', onWindowResize, false );
document.getElementById('modelFile').addEventListener('change', handleFileSelect, false);
