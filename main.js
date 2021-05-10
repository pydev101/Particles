var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
c.margin = 0;
c.padding = 0;
c.width = 1918;
c.height = 964;
  
function generateRandomColorHex() {
  return "#" + ("00000" + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)).slice(-6);
}

const PI = Math.PI;
function sin(angle){
	return Math.sin(angle);
}
function cos(angle){
	return Math.cos(angle);
}
function abs(x){
	if(x<0){x=-x;}
	return x;
}
class Vector{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
	
	getMag(){
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}
	getRefAngle(){
		if(this.x == 0){
			return PI/2;
		}
		return abs(Math.atan(this.y/this.x));
	}
	getHead(){
		var t = this.getRefAngle();
		if(this.y < 0){
			if(this.x == 0){
				return 3*PI*0.5;
			}else if(this.x < 0){
				return PI + t;
			}else{
				return 2*PI - t;
			}
			
		}else{
			if(this.x == 0){
				return PI*0.5;
			}else if(this.x < 0){
				return PI - t;
			}else{
				return t;
			}
		}
	}
	getUnitVector(){
		var mag = this.getMag();
		return new Vector(this.x/mag, this.y/mag);
	}
	
	getNormalVector(){
		var s = this.y/this.x;
		s = (-1)/s;
		s = new Vector(1, s);
		return s.getUnitVector();
	}
}
function dot(x1, y1, x2, y2){
	return x1*x2 + y1*y2;
}
function dot(A, B){
	return A.x*B.x + A.y*B.y;
}
function dot(A, x2, y2){
	return A.x*x2 + A.y*y2;
}


class Ball{
	constructor(x, y, r, mass, vx, vy) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.mass = mass;
		this.vel = new Vector(vx, vy);
		this.thick = 3;
		this.color = '#FF0000';
	}
	
	update(){
		if(this.x+this.r > c.width){this.vel.x = -this.vel.x;}
		if(this.x-this.r < 0){this.vel.x = -this.vel.x;}
		if(this.y+this.r > c.height){this.vel.y = -this.vel.y;}
		if(this.y-this.r < 0){this.vel.y = -this.vel.y;}
		this.applyForce(new Vector(0, 0.3));
		
		for(var i=0; i<Lines.length; i++){
			if(this.checkLinearCollision(Lines[i])){
				//Console.log("yes");
				var d = dot(1, -1/Lines[i].slope, this.x - Lines[i].x1, this.y - Lines[i].y1);
				this.vel.x = -this.vel.x;
				this.vel.y = -this.vel.y;
			}
		}
		
		this.x += this.vel.x;
		this.y += this.vel.y;
	}
	
	draw(){
		ctx.strokeStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
		ctx.lineWidth = this.thick;
		ctx.stroke();
	}
	
	applyForce(vector){
		this.vel.x += vector.x/this.mass;
		this.vel.y += vector.y/this.mass;
	}
	
	checkLinearCollision(line){
		var midX = 0.5*(line.x1 + line.x2);
		var midY = 0.5*(line.y1 + line.y2);
		var length = Math.sqrt((this.x - midX)*(this.x - midX) + (this.y - midY)*(this.y - midY));
		var radi = Math.sqrt((line.x1 - midX)*(line.x1 - midX) + (line.y1 - midY)*(line.y1 - midY));
		if(length < this.r+radi){
			//Do collision check
		}else{
			return false;
		}
	}
	
}

var Lines = [];

class Line{
	constructor(x, y, width, height, thickness){
		this.x1 = x;
		this.y1 = y;
		this.x2 = x+abs(width);
		this.y2 = y+height;
		this.slope = (this.y2-this.y1)/(this.x2-this.x1);
		this.thick = thickness;
		this.color = '#000000';
		Lines.push(this);
	}
	
	draw(){
		ctx.beginPath();
		ctx.strokeStyle = this.color;
		ctx.moveTo(this.x1, this.y1);
		ctx.lineTo(this.x2, this.y2);
		ctx.lineWidth = this.thick;
		ctx.stroke();
	}
}

var car = new Ball(220,100,15, 10, 3,3, '#FF0000');
new Line(200, 900, 1200, -100, 3);

var id = setInterval(frame, 10);
function frame(){
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, c.width, c.height);
	for(var i=0; i<Lines.length; i++){
		Lines[i].draw();
	}
	car.update();
	car.draw();
}

/*
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
  c.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(c, evt);
    car.x = mousePos.x;
	car.y = mousePos.y;
	frame();
  }, false);
  
  */