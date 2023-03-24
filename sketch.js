// Risk plot on p5
// Davide Placido

let slider 

class Patient{
  constructor(is_positive){
    this.x = random(width)
    this.is_positive = is_positive
    if (this.is_positive){
      this.c = color(255, 0, 150, 100)
    }else {
      this.c = color(125, 125, 150, 100)
    }
    this.y = randomGaussian(0.5*height, 0.4*height)
  }
  
  show(d){
    
    if (this.is_positive){
      var y = this.y + d*height
    }else {
      var y = this.y - d*height
    }
    
    fill(this.c);
    noStroke();
    ellipse(this.x, y, 30, 30)
  }
}

function setup() {
  console.log("Starting")
  createCanvas(600, 600);
  pt = new Array()
  for (var i = 0; i < 50; i++){
    pt.push(new Patient(false))
  }
  for (var i = 0; i < 50; i++){
    pt.push(new Patient(true))
  }
  slider = createSlider(0, 0.5, 0, 0.005);
  slider.position(620, 620);
  slider.style('width', '80px');

  threshold = createSlider(0, 1, 0.5, 0.05);
  threshold.position(620, 650);
  threshold.style('width', '80px');  
}

function draw() {
  background(250)
  
  let val = slider.value();
  let t = threshold.value();
  
  push()
  strokeWeight(4)
  stroke(0)
  line(0, t*height, width, t*height)
  pop()
  
  for (var i = 0; i < pt.length; i++){
    pt[i].show(val)
  }
  


}
