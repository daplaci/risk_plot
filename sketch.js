// Risk plot on p5
// Davide Placido

let slider 
var left_margin = 60
var width_scatter = 600
var time = 0;

class Patient{
  constructor(is_positive){
    this.x = random(left_margin,width_scatter)
    this.is_positive = is_positive
    if (this.is_positive){
      this.c = color(255, 0, 150, 100)
    }else {
      this.c = color(125, 125, 150, 100)
    }
    this.ydist = randomGaussian(0.5*height, 0.4*height)
  }
  
  show(d){
    
    if (this.is_positive){
      this.y = this.ydist - d*height
    }else {
      this.y = this.ydist + d*height
    }
    
    fill(this.c);
    noStroke();
    ellipse(this.x, this.y, 10, 10)
  }
}
  
function setup() {
  console.log("Starting")
  createCanvas(1600, 600);
  pt = new Array()
  curve = new Array();
  for (var i = 0; i < 200; i++){
    pt.push(new Patient(false))
  }
  for (var i = 0; i < 200; i++){
    pt.push(new Patient(true))
  }
  slider = createSlider(0, 0.5, 0, 0.005);
  slider.position(580, 650);
  slider.style('width', '80px');
}

function draw() {
  background(255)
  let val = slider.value();
  
  push()
  // x,y axis
  strokeWeight(4)
  stroke(0)
  line(width_scatter+100, 10, width_scatter+100, height-15) //yaxis - length heigth - 25
  triangle(width_scatter+100, 10, width_scatter+90, 20, width_scatter+110, 20) //yaxis arrow
  
  line(width_scatter+100, height-15, width_scatter+100+height, height-15) //xaxis - length heigth
  triangle(width_scatter+100+height, height-15, width_scatter+100+height-10, height-25, width_scatter+100+height-10, height-5) //xaxis arrow
  pop()
  
  for (var i = 0; i < pt.length; i++){ //plot patients
    pt[i].show(val)
  }
  
  t = abs(cos(time))
  push()
  fill(255, 0, 0, 20)
  rect(left_margin, 0, (width_scatter-left_margin), t*height); //rect above threshold
  fill(0, 0, 255, 20)
  rect(left_margin, t*height +1, (width_scatter-left_margin), height); //rect below threshold
  
  strokeWeight(4)
  stroke(0)
  line(left_margin, t*height, width_scatter, t*height) //threshold line
  
  strokeWeight(1)
  
  coords = get_roc_coordinates(t)
  line(width_scatter, t*height, (width_scatter+100 + coords[1]*(height)), (height-15 - coords[0]*(height-25))) //line from threshold to roc point
  
  translate(width_scatter+100, height-15,)
  
  if (cos(time)*sin(time)>0){
    curve.push([coords[1]*(height), - coords[0]*(height-25)])
  }else{
    curve.pop()
  }
  
  beginShape();
  noFill();

  for (let i = 0; i < curve.length; i++) {
    vertex(curve[i][0], curve[i][1]);
  } endShape();
  
  pop()
  
  time += (PI/4)/50;
}

function get_roc_coordinates(t){
  var tp = 0
  var fp = 0
  var tn = 0
  var fn = 0
  for (var i = 0; i < pt.length; i++){
    if (pt[i].y < t*height){
      if (pt[i].is_positive){
        tp += 1
      }else{
        fp += 1
      }
    }else{
      if (pt[i].is_positive){
        fn += 1
      }else{
        tn += 1
      }
    }
  }
  var tpr = tp/(tp+fn)
  var fpr = fp/(fp+tn)
  return [tpr, fpr]
}

