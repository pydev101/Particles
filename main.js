var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
c.margin = 0;
c.padding = 0;
c.width = 700;
c.height = 700;
  
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

	scale(s){
		this.x = this.x*s;
		this.y = this.y*s;
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
function sign(x){
	if(x<0){return -1;}
	return 1;
}

function linePoint(line, x, y){
	var len = Math.sqrt((line.x1 - line.x2)*(line.x1 - line.x2) + (line.y1 - line.y2)*(line.y1 - line.y2));

	var d1 = Math.sqrt((line.x1 - x)*(line.x1 - x) + (line.y1 - y)*(line.y1 - y));
	var d2 = Math.sqrt((line.x2 - x)*(line.x2 - x) + (line.y2 - y)*(line.y2 - y));
	var buffer = line.thick;
	
	if ( ( (d1+d2) >= (len-buffer) ) && ((d1+d2) <= (len+buffer)) ) {
		return true;
	}
	return false;
}

class Ball{
	constructor(x, y, r, mass, vx, vy) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.mass = mass;
		this.vel = new Vector(vx, vy);
		this.accel = new Vector(0, 0);
		this.thick = 3;
		this.color = '#FF0000';
	}
	
	update(){
		this.accel.scale(0);
		this.applyForce(new Vector(0, 0.3));

		if(this.x+this.r > c.width){this.vel.x = -this.vel.x;}
		if(this.x-this.r < 0){this.vel.x = -this.vel.x;}
		if(this.y+this.r > c.height){this.vel.y = -this.vel.y;}
		if(this.y-this.r < 0){this.vel.y = -this.vel.y;}
		
		for(var i=0; i<Lines.length; i++){
			var coll = this.checkLinearCollision(Lines[i]);
			if(coll != false){
				this.y = coll[1]+this.r*sign(this.y - coll[1]);//Prevents clipping

				//Normalized unit vector of line (Direction of Normal force)
				var v = new Vector(Lines[i].x2 - Lines[i].x1, Lines[i].y2 - Lines[i].y1);
				v = v.getNormalVector();
				if(dot(v, this.x-coll[0], this.y-coll[1]) < 1){
					v.scale(-1);
				}

				//TODO ADD MOMENTUM IN TO PREVENT ODD STICKING EFFECT
				//ISSUE WITH DIRECTION; Ignores director of force vectors only looks at net mag
				var magOfA = 0;
				if(dot(this.accel, v) < 0){
					magOfA = this.accel.getMag();
				}

				//Apply Force
				v.scale(magOfA);
				v.scale(this.mass);
				this.applyForce(v);
			}
		}
		
		this.vel.x += this.accel.x;
		this.vel.y += this.accel.y;
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
		this.accel.x += vector.x/this.mass;
		this.accel.y += vector.y/this.mass;
	}
	
	checkPointCollision(x, y){
		var d = Math.sqrt((this.x - x)*(this.x - x) + (this.y - y)*(this.y - y));
		if(d <= this.r){
			return true;
		}
		return false;
	}

	checkLinearCollision(line){
		if(this.checkPointCollision(line.x1, line.y1)){
			return [line.x1, line.y1];
		}else if(this.checkPointCollision(line.x2, line.y2)){
			return [line.x2, line.y2];
		}
		
		var dX = line.x2 - line.x1;
		var dY = line.y2 - line.y1;
		var length = Math.sqrt(dX*dX + dY*dY);
		//dot = ( ((cx-x1)*(x2-x1)) + ((cy-y1)*(y2-y1)) ) / pow(len,2);
		var dotA = (((this.x - line.x1)*dX) + ((this.y - line.y1) * dY)) / (length*length); 
		var closestX = line.x1 + (dotA * (line.x2-line.x1));
		var closestY = line.y1 + (dotA * (line.y2-line.y1));

		if (!linePoint(line, closestX, closestY)){
			return false;
		}

		
		var distX = closestX - this.x;
		var distY = closestY - this.y;
		var d = Math.sqrt( (distX*distX) + (distY*distY) );
		if(d < this.r){
			return [closestX, closestY];
		}
		return false;
	}
	
}

var Lines = [];

class Line{
	constructor(x, y, width, height, thickness){
		this.x1 = x;
		this.y1 = y;
		this.x2 = x+abs(width);
		this.y2 = y+height;
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

	length(){
		return Math.sqrt( (this.x2-this.x1)*(this.x2-this.x1) + (this.y2-this.y1)*(this.y2-this.y1) );
	}

	height(){
		return abs(this.y2 - this.y1);
	}

	width(){
		return abs(this.x2 - this.x1);
	}
}

var car = new Ball(320,100,15, 10, 0,0, '#FF0000');
new Line(200, 200, 300, -100, 3);

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