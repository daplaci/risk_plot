// Risk plot on p5
// Davide Placido

let slider 
var left_margin = 220
var width_scatter = 400
var height_scatter = 400
var length_axis = 150
var margin_axis_scatter = 50
var total_width = 900
var total_height = 600
var height_distributions = 250
var total_patients = 1000
var time = 0;
var speed = 1/60
var increment = 1;

class Patient{
  constructor(is_positive){
    this.x = random(left_margin,width_scatter+left_margin)
    this.is_positive = is_positive
    if (this.is_positive){
      this.c = color(255, 0, 150, 100)
    }else {
      this.c = color(125, 125, 150, 100)
    }
    this.ydist = randomGaussian(0.5*height_scatter, 0.2*height_scatter)
  }
  
  show(d){
    
    if (this.is_positive){
      this.y = this.ydist - d*height_scatter
    }else {
      this.y = this.ydist + d*height_scatter
    }
    
    this.y = constrain(this.y, 0, height_scatter)
    
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
    this.length_axis = length_axis
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
    
    var keys = Object.keys(this.completed_curves)
    for (let k = 0; k < keys.length; k++){
      if (keys[k]!=t){
        beginShape();
        noFill();
        stroke(color((k/keys.length)*360,  this.s, this.b))
        for (let i = 0; i < this.completed_curves[keys[k]].length; i++) {
          vertex(
            this.completed_curves[keys[k]][i][0]*(this.length_axis), 
            this.completed_curves[keys[k]][i][1]*(this.length_axis)
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
  calibration.curve = {};
  calibration.completed_curve = {};
}

function setup() {
  console.log("Starting")
  createCanvas(total_width, total_height);
  pt = new Array()
  for (var i = 0; i < total_patients/2; i++){
    pt.push(new Patient(false))
  }
  for (var i = 0; i < total_patients/2; i++){
    pt.push(new Patient(true))
  }
  slider = createSlider(0, 0.3, 0, 0.005);
  slider.position(left_margin, height_scatter+50);
  slider.style('width', '80px');
  
  positives = createSlider(0, 1, 1, 0.01);
  positives.position(left_margin, height_scatter+80);
  positives.style('width', '80px');

  auroc = new Plot(left_margin - length_axis - margin_axis_scatter, height_scatter-15,'TPR', 'FPR'); 
  auprc = new Plot(left_margin - length_axis - margin_axis_scatter, height_scatter/2,'Precision', 'Recall');
  calibration = new Plot(left_margin + width_scatter + margin_axis_scatter, height_scatter/2, 'Predicted Probability', 'Observed Probability');
  clearButton = createButton('Clear');
  clearButton.position(left_margin, height_scatter+110);
  clearButton.mousePressed(clear_plot);
}

function draw() {
  background(255)
  push()
  fill(0)
  stroke(1)
  text('Discrimination', slider.x + slider.width+10, slider.y +15);
  text('Prevalence', positives.x + positives.width+10, positives.y +15);
  pop()
  
  let threshold = slider.value();
  
  let counter = 0
  for (var i = 0; i < pt.length; i++){ //plot patients
    if (pt[i].is_positive){
      counter += 1
    }
  }

  if (counter >= positives.value()*(total_patients/2)){
    //pop n patients
    for (var i = 0; i < (counter - positives.value()*(total_patients/2)); i++){
      pt.pop()
    }
  } else {
    //push n patients
    for (var i = 0; i < (positives.value()*(total_patients/2) - counter); i++){
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
  rect(left_margin, 0, width_scatter, t*height_scatter); //rect above threshold
  fill(0, 0, 255, 20)
  rect(left_margin, t*height_scatter +1, width_scatter, height_scatter - t*height_scatter); //rect below threshold
  
  stroke(0)
  strokeWeight(4)
  line(left_margin, t*height_scatter, left_margin+width_scatter, t*height_scatter) //threshold line
  pop()

  //line from threshold to roc point
  push()
  strokeWeight(1)
  stroke(color(0, 0, 0, 100))
  line(left_margin, t*height_scatter, (auroc.x+ coords[1]*(auroc.length_axis)), (auroc.y - coords[0]*(auroc.length_axis)))
  line(left_margin, t*height_scatter, (auprc.x+ coords[0]*(auprc.length_axis)), (auprc.y - coords[2]*(auprc.length_axis)))
  line(left_margin+width_scatter, t*height_scatter, (calibration.x + (1-t)*(calibration.length_axis)), (calibration.y - coords[2]*(calibration.length_axis)))
  pop()

  auroc.draw_plot([threshold, positives.value()], coords[1], coords[0], time)
  auprc.draw_plot([threshold, positives.value()], coords[0], coords[2], time)
  calibration.draw_plot([threshold, positives.value()], 1-t, coords[2], time)
  
  plot_distribution()

  if (increment>0){
    time += (PI/4)*speed; //time step update threshold at next time step
  }
}

function plot_distribution(){

  var positive_dist = new Array()
  var negative_dist = new Array()
  var dist_granularity = 15

  for (var h=0; h<dist_granularity; h++){
    var count_pos = 0
    var count_neg = 0
    for (var i = 0; i < pt.length; i++){
      if (pt[i].is_positive && pt[i].y > (h/dist_granularity * height_scatter) && pt[i].y < ((h+1)/dist_granularity * height_scatter)){
        count_pos += 1
      }else if (!pt[i].is_positive && pt[i].y > (h/dist_granularity * height_scatter) && pt[i].y < ((h+1)/dist_granularity * height_scatter)){
        count_neg += 1
      }
    }
    positive_dist.push(height_distributions*count_pos/(total_patients/2))
    negative_dist.push(height_distributions*count_neg/(total_patients/2))
  }

  
  push()
  translate(left_margin + width_scatter, height_scatter)
  rotate(PI*3/2)

  push()
  beginShape()
  fill(color(255, 0, 150, 100), 0.5)
  stroke(color(255, 0, 150, 100))
  vertex(height_scatter,0)
  for (var i = 0; i < positive_dist.length; i++){
    vertex((height_scatter-i/dist_granularity*height_scatter), positive_dist[i])
  }
  vertex(0,0)
  endShape()
  pop()
  push()
  beginShape()
  fill(color(125, 125, 150, 100), 0.5)
  stroke(color(125, 125, 150, 100))
  vertex(height_scatter,0)
  for (var i = 0; i < negative_dist.length; i++){
    vertex(height_scatter-i/dist_granularity*height_scatter, negative_dist[i])
  }
  vertex(0,0)
  endShape()
  pop()

  pop()
}
function doubleClicked(){
  increment = increment * -1
}

function get_roc_coordinates(t){
  var tp = 0
  var fp = 0
  var tn = 0
  var fn = 0
  for (var i = 0; i < pt.length; i++){
    if (pt[i].y < t*height_scatter){ 
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
