// Risk plot on p5
// Davide Placido

let slider 
var left_margin = 60
var width_scatter = 600
var total_width = 1600
var total_height = 800
var total_patients = 600
var time = 0;
var speed = 1/30

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

class Plot{
  constructor(x, y, ylabel, xlabel){
    this.x = x
    this.y = y
    this.ylabel = ylabel
    this.xlabel = xlabel
    this.length_axis = 350
    this.curve = {};
    this.completed_curves = {}; 
    this.b = 365; //brightness (365 values)
    this.s = 100; //saturation (365 values)
  }
  
  draw_plot(t, xvalue, yvalue, time){
    push()
    translate(this.x, this.y,)

    if (this.curve[t] == undefined) {
      this.curve[t] = [];
      this.completed_curves[t] = [];
    }
    
    push()
    // x,y axis
    strokeWeight(4)
    stroke(0)
    line(0, -this.length_axis, 0, 0) //yaxis - length heigth - 25
    triangle(0, -this.length_axis, -10, -this.length_axis +10, +10, -this.length_axis +10) //yaxis arrow
    push()
    fill(0)
    strokeWeight(1)
    text(this.ylabel, +15, -this.length_axis +10)
    pop()
    
    line(0, 0, this.length_axis, 0) //xaxis - length heigth
    triangle(this.length_axis, 0, this.length_axis-10, -10, this.length_axis-10, +10) //xaxis arrow
    push()
    fill(0)
    strokeWeight(1)
    text(this.xlabel, this.length_axis - 10, -15)
    pop()

    if (cos(time)*sin(time)>0){
      this.curve[t].push([xvalue, - yvalue])
      if (
        (this.completed_curves[t].length < this.curve[t].length) | 
        (this.completed_curves[t].length == 0)
      ){
        this.completed_curves[t].push([xvalue, - yvalue])
      }
    }else{
      this.curve[t].pop()
    }
    
    colorMode(HSB, 360);
    strokeWeight(2)
    beginShape();
    stroke(color(t*360, this.s, this.b))
    noFill();
    for (let i = 0; i < this.curve[t].length; i++) {
      vertex(
        this.curve[t][i][0]*(this.length_axis),
        this.curve[t][i][1]*(this.length_axis)
        );
    } endShape();
    
    for (let k in this.completed_curves){
      if (k!=t){
        beginShape();
        noFill();
        stroke(color(k*360,  this.s, this.b))
        for (let i = 0; i < this.completed_curves[k].length; i++) {
          vertex(
            this.completed_curves[k][i][0]*(this.length_axis), 
            this.completed_curves[k][i][1]*(this.length_axis)
            );
        } endShape();
      }
    }
    pop()
    pop()
  }
}

function clear_plot(){
  auroc.curve = {};
  auroc.completed_curves = {};
  auprc.curve = {};
  auprc.completed_curves = {};
}

function setup() {
  console.log("Starting")
  createCanvas(total_width, total_height);
  positives = createSlider(1, total_patients/2, total_patients/2, 1);
  positives.position(580, height+50);
  positives.style('width', '80px');
  
  pt = new Array()
  for (var i = 0; i < total_patients; i++){
    pt.push(new Patient(false))
  }
  for (var i = 0; i < total_patients/2; i++){
    pt.push(new Patient(true))
  }
  
  auroc = new Plot(width_scatter+100, height-15,'TPR', 'FPR'); 
  auprc = new Plot(width_scatter+100, height/2,'Precision', 'Recall'); 
  clearButton = createButton('Clear');
  clearButton.position(580, height+80);
  clearButton.mousePressed(clear_plot);
}

function draw() {
  background(255)
  let threshold = 0.4
  let counter = 0
  for (var i = 0; i < pt.length; i++){ //plot patients
    if (pt[i].is_positive){
      counter += 1
    }
  }

  if (counter > positives.value()){
    //pop n patients
    for (var i = 0; i < (counter - positives.value()); i++){
      pt.pop()
    }
  } else {
    //push n patients
    for (var i = 0; i < (positives.value() - counter); i++){
      pt.push(new Patient(true))
    }
  }

  for (var i = 0; i < pt.length; i++){ //plot patients
    pt[i].show(threshold)
  }
  
  t = abs(cos(time))
  coords = get_roc_coordinates(t)

  push()
  fill(255, 0, 0, 20)
  rect(left_margin, 0, (width_scatter-left_margin), t*height); //rect above threshold
  fill(0, 0, 255, 20)
  rect(left_margin, t*height +1, (width_scatter-left_margin), height); //rect below threshold
  
  stroke(0)
  strokeWeight(4)
  line(left_margin, t*height, width_scatter, t*height) //threshold line
  pop()

  //line from threshold to roc point
  push()
  strokeWeight(1)
  stroke(color(0, 0, 0, 100))
  line(width_scatter, t*height, (auroc.x+ coords[1]*(auroc.length_axis)), (auroc.y - coords[0]*(auroc.length_axis)))
  pop()

  auroc.draw_plot(positives.value(), coords[1], coords[0], time)
  auprc.draw_plot(positives.value(), coords[0], coords[2], time)
  
  time += (PI/4)*speed; //time step update threshold at next time step
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
  var precision = tp/(tp+fp)
  return [tpr, fpr, precision]
}