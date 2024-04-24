const borneVue=20;//amplitude de deplacement de la camera
const PrecisionArrondi=50;
var epsilon = 0.00000001;

function testZero(x){
   var val=parseFloat(Number(x).toPrecision(PrecisionArrondi));
   if (parseFloat(Math.abs(x).toPrecision(PrecisionArrondi))<epsilon) val=0;
   return val;
}

 
function init(){
   var stats = initStats();
   // creation de rendu et de la taille
   let rendu = new THREE.WebGLRenderer({ antialias: true });
   rendu.shadowMap.enabled = true;
   let scene = new THREE.Scene();   
   let camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 100);
   rendu.shadowMap.enabled = true;
   rendu.setClearColor(new THREE.Color(0xFFFFFF));
   rendu.setSize(window.innerWidth*.9, window.innerHeight*.9);
   cameraLumiere(scene,camera);
   lumiere(scene);

   let nbEchange = 6 + Math.floor(5*Math.random());
   let indc = 0;
   let echangeNum = 0;
   let cont = true;
   let coteFondGauche = function(){
      if(math.floor(Math.random())==1){
         res = true;
      }else{
         res = false;
      }
      return res;
   }
   let coteFondDroite = true;
   let groupTraj = new THREE.Group();
   let nbPoints = 100;
   initSol();
   initTable();
   initPieds();
   initRaquettes();
   initBalle();
   let trajectoireBalle = false;
   let points = trajBalleEngage();
   let traj = [];
   traj[0] = points;


   //********************************************************
   //
   //  DÉBUT PARTIE FONCTIONS
   //
   //********************************************************

   //***************CODE POUR LA CRÉATION DU SOL//***************
   function initSol(){
      let geometrySol = new THREE.PlaneGeometry(50, 50);
      let materialSol = new THREE.MeshPhongMaterial({color: 0X36454F});
      let sol = new THREE.Mesh(geometrySol, materialSol);
      sol.position.z = -2/3-0.05;
      sol.receiveShadow = true;
      scene.add(sol);
   }

   //***************CODE POUR LA CRÉATION DES TABLE DE PING-PONG//***************
   function initTable(){

      //*****************************CODE POUR LE PLATEAU DE LA TABLE //*****************************
      let geometryTable = new THREE.BoxGeometry(2.5, 1.5, 0.1); 
      let materialTable = new THREE.MeshPhongMaterial({color: 0X0000FF}); 
      let tableTemp = new THREE.Mesh(geometryTable, materialTable);
      let table = new THREE.Group();
      CastReceive(tableTemp);
      table.add(tableTemp);
      tableTemp.name = 'table';


      //*****************************CODE POUR LES BORDURES DU PLATEAU //*****************************
      let geometryBord = new THREE.BoxGeometry(2.5, 0.05, 0.1);
      let geometryCote = new THREE.BoxGeometry(0.05, 1.6, 0.1);
      let materialBord = new THREE.MeshPhongMaterial({color: 0XFFFFFF}); 
      let bordFond = new THREE.Mesh(geometryBord, materialBord);
      let bordAvant = new THREE.Mesh(geometryBord, materialBord);
      let bordDroite = new THREE.Mesh(geometryCote, materialBord);
      let bordGauche = new THREE.Mesh(geometryCote, materialBord);

      CastReceive(bordFond);
      CastReceive(bordAvant);
      CastReceive(bordDroite);
      CastReceive(bordGauche);

      bordFond.translateY(-0.775);
      bordAvant.translateY(0.775);
      bordDroite.translateX(-1.275);
      bordGauche.translateX(1.275);
      table.add(bordFond);
      table.add(bordAvant);
      table.add(bordDroite);
      table.add(bordGauche);

      let geometryMilieu = new THREE.PlaneGeometry(2.5, 0.05);
      let milieu = new THREE.Mesh(geometryMilieu, materialBord);
      CastReceive(milieu);
      milieu.translateZ(0.051);
      table.add(milieu);


      //*****************************CODE POUR LE FILET//*****************************
      let materialFilet = new THREE.MeshPhongMaterial({color: 0XFFFFFF})
      let geometryFiletCouch = new THREE.BoxGeometry(0.005, 1.58, 0.005);
      let geometryFiletDeb = new THREE.BoxGeometry(0.005, 0.005, 0.25);

      let filet = new THREE.Mesh(geometryFiletDeb, materialFilet);
      CastReceive(filet);
      filet.translateZ(0.16);
      filet.translateY(-0.75);

      for(let i=1;  i<34; i++){
         let fil = new THREE.Mesh(geometryFiletDeb, materialFilet);
         CastReceive(fil);      
         fil.translateY(i/22);
         filet.add(fil);
      }

      for(let i=0;  i<5; i++){
         let fil = new THREE.Mesh(geometryFiletCouch, materialFilet);
         CastReceive(fil);
         fil.translateZ(i/25-0.08);
         fil.translateY(0.75);
         filet.add(fil);
      }


      //*****************************CODE POUR LE CONTOUR DU FILET//*****************************
      let geometryFilDeb = new THREE.CylinderGeometry(0.02, 0.02, 0.25);
      let geometryFilCouch = new THREE.BoxGeometry(0.005, 1.59, 0.02)
      let materialFiletTour = new THREE.MeshPhongMaterial({color: 0X000000});
      let filDeb = new THREE.Mesh(geometryFilDeb, materialFiletTour);
      let filFin = new THREE.Mesh(geometryFilDeb, materialFiletTour);
      let filCouch = new THREE.Mesh(geometryFilCouch, materialFiletTour);

      CastReceive(filDeb);
      CastReceive(filFin);
      CastReceive(filCouch);

      filFin.translateY(1.53);
      filDeb.translateY(-0.03);
      filDeb.rotation.x += Math.PI/2;
      filFin.rotation.x += Math.PI/2;
      filCouch.translateZ(0.125);
      filCouch.translateY(0.75);

      filet.add(filDeb);
      filet.add(filFin);
      filet.add(filCouch);
      table.add(filet);

      table.castShadow = true;
      table.receiveShadow = true;
      scene.add(table);      
   }

   //*****************************CODE POUR LES PIEDS DU PLATEAU //*****************************
   function initPieds(x0 = 0.125*2/3, y0 = 0.125*2/3, x1 = 0.125*2/3, y1 = 0.25*2/3){
      let courbePiedsPartie1 = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0.17*2/3, 0, 0), new THREE.Vector3(x0, y0, 0), new THREE.Vector3(0, 0.25*2/3, 0));
      let geometryPiedsPartie1 = new THREE.LatheGeometry(courbePiedsPartie1.getPoints());
      let materialPieds = new THREE.MeshPhongMaterial({color: 0XFF0000});
      let piedsPartie1 = new THREE.Mesh(geometryPiedsPartie1, materialPieds);
      CastReceive(piedsPartie1);
      piedsPartie1.rotation.x = Math.PI/2;
   
      let courbePiedsPartie2 = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.25*2/3, 0), new THREE.Vector3(x1, y1, 0), new THREE.Vector3(0, 0.5*2/3, 0));
      let geometryPiedsPartie2 = new THREE.LatheGeometry(courbePiedsPartie2.getPoints());
      let piedsPartie2 = new THREE.Mesh(geometryPiedsPartie2, materialPieds);
      CastReceive(piedsPartie2);
      piedsPartie2.rotation.x = Math.PI/2;
         
      let piedsPartie3 = piedsPartie2.clone();
      piedsPartie3.rotation.z = Math.PI;
      piedsPartie3.position.z +=2/3;
   
      let piedsPartie4 = piedsPartie1.clone();
      piedsPartie4.rotation.z = Math.PI;
      piedsPartie4.position.z +=2/3;
   
      let pieds1 = new THREE.Group();
      pieds1.add(piedsPartie1);
      pieds1.add(piedsPartie2);
      pieds1.add(piedsPartie3);
      pieds1.add(piedsPartie4);
   
   
      pieds1.position.z = -2/3-0.05;
      pieds1.position.x = -1.125;
      pieds1.position.y = 0.625;
   
      let pieds2 = pieds1.clone();
      let pieds3 = pieds1.clone();
      let pieds4 = pieds1.clone();
   
      pieds2.position.x = -pieds1.position.x;
   
      pieds3.position.y = -pieds1.position.y;
   
      pieds4.position.x = -pieds1.position.x;
      pieds4.position.y = -pieds1.position.y;

      let pieds = new THREE.Group();
      CastReceive(pieds);
      pieds.name = 'pieds';
      pieds.add(pieds1);
      pieds.add(pieds2);
      pieds.add(pieds3);
      pieds.add(pieds4);
   
      scene.add(pieds);
   }

   //***************CODE POUR LA CRÉATION DES RAQUETTES DE PING-PONG//***************
   function initRaquettes(){
      //*****************************CODE POUR LES RAQUETTES//********************************************************
      let geometryRaquette = new THREE.CylinderGeometry(0.1, 0.1, 0.001667, 32);
      let materialRaquette = new THREE.MeshPhongMaterial({color: 0XFFFFFF});
      let geometryPoignee = new THREE.CylinderGeometry(0.01, 0.01, 0.1, 32);
      let materialPoignee = new THREE.MeshPhongMaterial({color: 0X936025});

      //CODE POUR LA PREMIERE RAQUETTE//********************************************************
      let raquette1 = new THREE.Mesh(geometryRaquette, materialRaquette);
      raquette1.name = "raquette1";
      let raquette1Face = new THREE.Mesh(geometryRaquette, new THREE.MeshBasicMaterial({color: 0XFF0000}));
      let raquette1Derr = new THREE.Mesh(geometryRaquette, new THREE.MeshPhongMaterial({color: 0X000000}));
      CastReceive(raquette1Face);
      CastReceive(raquette1Derr);
      raquette1.position.z = 0.5;
      raquette1.rotation.z += Math.PI/2;
      raquette1.add(raquette1Face);
      raquette1.add(raquette1Derr);
      raquette1Face.position.y -=0.001667;
      raquette1Derr.position.y +=0.001667;

      let Poignee1 = new THREE.Mesh(geometryPoignee, materialPoignee);
      CastReceive(Poignee1);
      Poignee1.rotation.x += Math.PI/2;
      Poignee1.position.z -= 0.11;
      raquette1.add(Poignee1);

      raquette1.position.x = 1.4;
      raquette1.position.y = -0.8;
      CastReceive(raquette1);
      scene.add(raquette1);

      //CODE POUR LA DEUXIEME RAQUETTE//********************************************************
      let raquette2 = new THREE.Mesh(geometryRaquette, materialRaquette);
      CastReceive(raquette2);
      raquette2.name = "raquette2";
      let raquette2Face = new THREE.Mesh(geometryRaquette, new THREE.MeshBasicMaterial({color: 0XFFFF00}));
      let raquette2Derr = new THREE.Mesh(geometryRaquette, new THREE.MeshPhongMaterial({color: 0X000000}));
      CastReceive(raquette2Face);
      CastReceive(raquette2Derr);

      raquette2.position.z = 0.5;
      raquette2.rotation.z += Math.PI/2;
      raquette2.add(raquette2Face);
      raquette2.add(raquette2Derr);
      raquette2Face.position.y -=0.001667;
      raquette2Derr.position.y +=0.001667;

      let Poignee2 = new THREE.Mesh(geometryPoignee, materialPoignee);
      CastReceive(Poignee2);
      Poignee2.rotation.x += Math.PI/2;
      Poignee2.position.z -= 0.11;
      raquette2.add(Poignee2);

      raquette2.position.x = -1.4;
      raquette2.position.y = 0.8;
      scene.add(raquette2);
   }

   //***************CODE POUR LA CRÉATION DE LA BALLE DE PING-PONG//***************
   function initBalle(){
      let geometryBalle = new THREE.SphereGeometry(0.02, 32, 16);
      let materialBalle = new THREE.MeshPhongMaterial({color: 0XFF6600});
      let balle = new THREE.Mesh(geometryBalle, materialBalle);
      balle.name = "balle";
      balle.position.x = 0;
      balle.position.y = 0;
      balle.position.z = 1;
      CastReceive(balle);
      scene.add(balle);
   }

   //***************CODE POUR LA TRAJECTOIRE DE LA BALLE AU MOMENT DE L'ENGAGEMENT//***************
   function trajBalleEngage(){
      let raquette1 = scene.getObjectByName("raquette1");
      let raquette2 = scene.getObjectByName("raquette2");
      let P0 = raquette1.getWorldPosition();
      let R2 = raquette2.getWorldPosition();
      let Q3 = new THREE.Vector3(-0.7, Math.random() * (1.6) - 0.8, 0.08)
      if(Q3.y >0){
         coteFondDroite = false;
      }
      let AM = (new THREE.Vector2(P0.x, P0.y)).distanceTo(new THREE.Vector2(Q3.x, P0.y));
      let AB = (new THREE.Vector2(P0.x, P0.y)).distanceTo(new THREE.Vector2(-P0.x, P0.y));
      let MN = (new THREE.Vector2(Q3.x, Q3.y)).distanceTo(new THREE.Vector2(Q3.x, P0.y));
      let BC = MN/(AM/AB);
      if(P0.y<R2.y){
         R2.y = P0.y + BC;
      }else{
         R2.y = P0.y - BC;
      }
      
      let curveDirect = new THREE.LineCurve3(P0, R2);
      let curveQ3R2 = new THREE.LineCurve3(Q3, R2);

      let P1 = curveDirect.getPointAt(0.125);
      let P2 = curveDirect.getPointAt(0.375);
      P2.z = 0.08;

      let Q0 = P2;
      let Q1 = curveDirect.getPointAt(0.5);
      Q1.z = P0.z;
      let Q2 = curveDirect.getPointAt(0.625);
      Q2.z = P0.z;
   
      let R0 = Q3;
      let R1 = curveQ3R2.getPointAt(0.5);
      R1.z = R2.z;

      P0.x -= 0.02;
      let curve1 = new THREE.QuadraticBezierCurve3(P0, P1, P2);
      let curve2 = new THREE.CubicBezierCurve3(Q0, Q1, Q2, Q3);
      let curve3 = new THREE.QuadraticBezierCurve3(R0, R1, R2);
      let groupCurve = new THREE.CurvePath();
      groupCurve.add(curve1);
      groupCurve.add(curve2);
      groupCurve.add(curve3);
      let points = groupCurve.getSpacedPoints(nbPoints);
      
      if(trajectoireBalle){
         let geometryCourbe = new THREE.BufferGeometry().setFromPoints(points);
         let materialCourbe = new THREE.LineBasicMaterial({color: 0XFF0000});
         let curveObject = new THREE.Line(geometryCourbe, materialCourbe);
         curveObject.name = "curveObject";
         groupTraj.add(curveObject);
         scene.add(groupTraj);
      }

      return points
   }

   //***************CODE POUR LA TRAJECTOIRE DE LA RAQUETTE ROUGE VERS LA RAQUETTE JAUNE//***************
   function trajR1versR2(){
      let raquette1 = scene.getObjectByName("raquette1");
      let raquette2 = scene.getObjectByName("raquette2");
      let P0 = raquette1.getWorldPosition();
      let Q3 = raquette2.getWorldPosition();
      let P2 = new THREE.Vector3();
      if(coteFondDroite){
         P2 = new THREE.Vector3(-0.7, Math.random() * (0.8), 0.08);
         coteFondDroite = false;
      }else{
         P2 = new THREE.Vector3(-0.7, Math.random() * (0.8) - 0.8, 0.08); 
         coteFondDroite = true;
      }
      let AM = (new THREE.Vector2(P0.x, P0.y)).distanceTo(new THREE.Vector2(P2.x, P0.y));
      let AB = (new THREE.Vector2(P0.x, P0.y)).distanceTo(new THREE.Vector2(-P0.x, P0.y));
      let MN = (new THREE.Vector2(P2.x, P2.y)).distanceTo(new THREE.Vector2(P2.x, P0.y));
      let BC = MN/(AM/AB);
      if(P2.y<P0.y){
         Q3.y = P0.y - BC;
      }else{
         Q3.y = P0.y + BC;
      }

      let curveDirect = new THREE.LineCurve(P0, Q3);
      let curveP2Q3 = new THREE.LineCurve(P2, Q3);

      let P1 = curveDirect.getPointAt(0.5);
      P1.z = P0.z+0.25;
      
      let Q0 = P2;
      let Q1 = curveP2Q3.getPointAt(1/3);
      Q1.z = P0.z;
      let Q2 = curveP2Q3.getPointAt(2/3);
      Q2.z = P0.z;

      P0.x -= 0.02;
      let curve1 = new THREE.QuadraticBezierCurve3(P0, P1, P2);
      let curve2 = new THREE.CubicBezierCurve3(Q0, Q1, Q2, Q3);
      let groupCurve = new THREE.CurvePath();
      groupCurve.add(curve1);
      groupCurve.add(curve2);
      let points = groupCurve.getSpacedPoints(nbPoints);

      if(trajectoireBalle){
         let geometryCourbe = new THREE.BufferGeometry().setFromPoints(points);
         let materialCourbe = new THREE.LineBasicMaterial({color: 0XFF0000});
         let curveObject = new THREE.Line(geometryCourbe, materialCourbe);
         curveObject.name = "curveObject";
         groupTraj.add(curveObject);
         scene.add(groupTraj);
      }

      return points
   }

   //***************CODE POUR LA TRAJECTOIRE DE LA RAQUETTE JAUNE VERS LA RAQUETTE ROUGE//***************
   function trajR2versR1(){
      let raquette1 = scene.getObjectByName("raquette1");
      let raquette2 = scene.getObjectByName("raquette2");
      let P0 = raquette2.getWorldPosition();
      let Q3 = raquette1.getWorldPosition();
      let P2 = new THREE.Vector3();
      if(coteFondGauche){
         P2 = new THREE.Vector3(0.7, Math.random() * (0.8), 0.08);
         coteFondGauche = false;
      }else{
         P2 = new THREE.Vector3(0.7, Math.random() * (0.8) - 0.8, 0.08); 
         coteFondGauche = true;
      }
      let AM = (new THREE.Vector2(P0.x, P0.y)).distanceTo(new THREE.Vector2(P2.x, P0.y));
      let AB = (new THREE.Vector2(P0.x, P0.y)).distanceTo(new THREE.Vector2(-P0.x, P0.y));
      let MN = (new THREE.Vector2(P2.x, P2.y)).distanceTo(new THREE.Vector2(P2.x, P0.y));
      let BC = MN/(AM/AB);
      if(P2.y<P0.y){
         Q3.y = P0.y - BC;
      }else{
         Q3.y = P0.y + BC;
      }

      let curveDirect = new THREE.LineCurve(P0, Q3);
      let curveP2Q3 = new THREE.LineCurve(P2, Q3);

      let P1 = curveDirect.getPointAt(0.5);
      P1.z = P0.z+0.25;
      
      let Q0 = P2;
      let Q1 = curveP2Q3.getPointAt(1/3);
      Q1.z = P0.z;
      let Q2 = curveP2Q3.getPointAt(2/3);
      Q2.z = P0.z;

      P0.x -= 0.02;
      let curve1 = new THREE.QuadraticBezierCurve3(P0, P1, P2);
      let curve2 = new THREE.CubicBezierCurve3(Q0, Q1, Q2, Q3);
      let groupCurve = new THREE.CurvePath();
      groupCurve.add(curve1);
      groupCurve.add(curve2);
      let points = groupCurve.getSpacedPoints(nbPoints);
      
      if(trajectoireBalle){
         let geometryCourbe = new THREE.BufferGeometry().setFromPoints(points);
         let materialCourbe = new THREE.LineBasicMaterial({color: 0XFF0000});
         let curveObject = new THREE.Line(geometryCourbe, materialCourbe);
         curveObject.name = "curveObject";
         groupTraj.add(curveObject);
         scene.add(groupTraj);
      }
      
      return points
   }

   //***************CODE POUR LES PROPRIÉTÉS LUMINEUSES DES OBJETS//***************
   function CastReceive(object){
      object.castShadow = true;
      object.receiveShadow = true;
   }

   //********************************************************
   //
   //  DÉBUT MENU GUI
   //
   //********************************************************
   var gui = new dat.GUI();//interface graphique utilisateur
   // ajout du menu dans le GUI
   let menuGUI = new function () {
      this.cameraxPos = camera.position.x;
      this.camerayPos = camera.position.y;
      this.camerazPos = camera.position.z;
      this.cameraZoom = 1;
      this.cameraxDir = 0;
      this.camerayDir = 0;
      this.camerazDir = 0;
    
      //pour actualiser dans la scene   
      this.actualisation = function () {
         posCamera();
         reAffichage();
      }; // fin this.actualisation
   }; // fin de la fonction menuGUI
   // ajout de la camera dans le menu
   ajoutCameraGui(gui,menuGUI,camera);
   
   //***************CODE POUR LE GUI DES COULEURS DE LA TABLE//***************
   let couleurGUI = new function(){
      this.couleurTable = 0X0000FF;
   }
   let guiCouleur = gui.addFolder("Table");
   guiCouleur.add(couleurGUI, "couleurTable", ["Bleu", "Vert"]).onChange(function(e) {
      if(e=="Bleu"){
         scene.getObjectByName("table").material.color.setHex(0X0000FF);
      }else{
         scene.getObjectByName("table").material.color.setHex(0X00FF00);
      }
   });
   guiCouleur.addColor(couleurGUI, "couleurTable").onChange(function(e) {
      scene.getObjectByName("table").material.color.setHex(e);
   });

   //***************CODE POUR LE GUI DES POINT DES CONTROLES DES PIEDS DE LA TABLE//***************
   let pointControle1GUI = new function(){
      this.pointControleX0 = 0.125*2/3;
      this.pointControleY0 = 0.125*2/3;
   }

   let pointControle2GUI = new function(){
      this.pointControleX1 = 0.125*2/3;
      this.pointControleY1 = 0.25*2/3;
   }
   
   let piedsShadow = new function(){
      this.castShadow = true;
      this.receiveShadow = true;
   }

   let guiControlePied = guiCouleur.addFolder("Pieds");
   guiControlePied.add(pointControle1GUI, "pointControleX0", 0, 2).onChange(function(e){
      scene.remove(scene.getObjectByName('pieds'));
      initPieds(e, pointControle1GUI.pointControleY0);
   });
   guiControlePied.add(pointControle1GUI, "pointControleY0", 0, 2).onChange(function(e){
      scene.remove(scene.getObjectByName('pieds'));
      initPieds(pointControle1GUI.pointControleX0, e);
   });
   guiControlePied.add(pointControle2GUI, "pointControleX1", 0, 2).onChange(function(e){
      scene.remove(scene.getObjectByName('pieds'));
      initPieds(pointControle1GUI.pointControleX0, pointControle1GUI.pointControleY0, e);
   });
   guiControlePied.add(pointControle2GUI, "pointControleY1", 0, 2).onChange(function(e){
      scene.remove(scene.getObjectByName('pieds'));
      initPieds(pointControle1GUI.pointControleX0, pointControle1GUI.pointControleY0, pointControle1GUI.pointControleX1, e);
   });

   //***************CODE POUR LE GUI DES PROPRIÉTÉS LUMINEUSE DES PIEDS DE LA TABLE//***************
   guiControlePied.add(piedsShadow, "castShadow").onChange(function(e){
      if(e){
         scene.getObjectByName('pieds').castShadow = true;
      }else{
         scene.getObjectByName('pieds').castShadow = false;
      }
   });
   guiControlePied.add(piedsShadow, "receiveShadow").onChange(function(e){
      if(e){
         scene.getObjectByName('pieds').receiveShadow = true;
      }else{
         scene.getObjectByName('pieds').receiveShadow = false;
      }
   });

   //***************CODE POUR LE GUI DE LA TRAJECTOIRE DE LA BALLE//***************
   let trajGUI = new function(){
      this.trajectoireBalle = false;
   }
   let guiTraj = gui.addFolder("Trajectoire");
   guiTraj.add(trajGUI, "trajectoireBalle").onChange(function(e) {
      if(e){
         trajectoireBalle = true;
      }else{
         trajectoireBalle = false;
      }
   });

   //***************CODE POUR LE GUI DE LE RESET DE LA SCENE//***************
   let reset = {reset:function(){
      location.reload();
   }};
   gui.add(reset, "reset");

   //***************CODE POUR LE GUI POUR CONTINUER LE MATCH//***************
   let continuer = {continue:function(){
      indc = 0; 
      echangeNum = 0; 
      cont = true;
      scene.remove(scene.getObjectByName("raquette1"));
      scene.remove(scene.getObjectByName("raquette2"));
      scene.remove(scene.getObjectByName("balle"));
      scene.remove(groupTraj);
      groupTraj = new THREE.Group();
      initRaquettes(scene);
      initBalle(scene);
      let points = trajBalleEngage(scene);
      traj = [];
      traj[0] = points;
      nbEchange = 6 + Math.floor(5*Math.random());
   }};
   gui.add(continuer, "continue");


   //ajout du menu pour actualiser l'affichage 
   gui.add(menuGUI, "actualisation");
   menuGUI.actualisation();
   //********************************************************
   //
   //  F I N     M E N U     G U I
   //
   //********************************************************

   renduAnim();
 

   // definition des fonctions idoines
   function posCamera(){
      camera.position.set(menuGUI.cameraxPos*testZero(menuGUI.cameraZoom),menuGUI.camerayPos*testZero(menuGUI.cameraZoom),menuGUI.camerazPos*testZero(menuGUI.cameraZoom));
      camera.lookAt(menuGUI.cameraxDir,menuGUI.camerayDir,menuGUI.camerazDir);
   }

   // ajoute le rendu dans l'element HTML
   document.getElementById("webgl").appendChild(rendu.domElement);
   
   // affichage de la scene
   rendu.render(scene, camera);
  
   function reAffichage() {
      setTimeout(function () {
         let balle = scene.getObjectByName("balle");
         let raquette1 = scene.getObjectByName("raquette1");
         let raquette2 = scene.getObjectByName("raquette2");
         if(cont){
            if(balle){
               scene.remove(balle);
            }
            balle.position.set(traj[echangeNum][indc].x, traj[echangeNum][indc].y, traj[echangeNum][indc].z);
            if(echangeNum%2==0 && echangeNum<nbEchange-1){
               raquette2.position.y += indc*(traj[echangeNum][nbPoints].y - raquette2.position.y)/nbPoints/2;
            }else if(echangeNum%2==1 && echangeNum<nbEchange-1){
               raquette1.position.y += indc*(traj[echangeNum][nbPoints].y - raquette1.position.y)/nbPoints/2;
            }
            indc+=1;
            if(indc==nbPoints+1){
               if(echangeNum%2==0 && echangeNum<nbEchange-1){
                  traj[echangeNum+1] = trajR2versR1(scene);
               }else if(echangeNum%2==1 && echangeNum<nbEchange-1){
                  traj[echangeNum+1] = trajR1versR2(scene);
               }
               echangeNum += 1;
               indc = 0;
            }
            if(echangeNum==nbEchange){
               cont = false;
               if(echangeNum%2==1){
                  document.getElementById("JoueurRougeResult").innerHTML = parseInt(document.getElementById("JoueurRougeResult").innerHTML) + 1;
               }else{
                  document.getElementById("JoueurJauneResult").innerHTML = parseInt(document.getElementById("JoueurJauneResult").innerHTML) + 1;
               }
            }
         }
         scene.add(balle);
         posCamera();
         reAffichage();
      }, 20);// fin setTimeout(function ()
         // rendu avec requestAnimationFrame
      rendu.render(scene, camera);
   }// fin fonction reAffichage()
   
   function renduAnim() {
      stats.update();
      // rendu avec requestAnimationFrame
      requestAnimationFrame(renduAnim);
      // ajoute le rendu dans l'element HTML
      rendu.render(scene, camera);
   }
 
} // fin fonction init()