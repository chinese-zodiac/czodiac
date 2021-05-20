import React, { useEffect, useState, useRef } from "react";
import _ from "lodash";
import "./index.scss";

function debounce(fn, ms) {
    let timer
    return _ => {
        clearTimeout(timer)
        timer = setTimeout(_ => {
        timer = null
        fn.apply(this, arguments)
        }, ms)
    };
}

function DigitalDance() {

    const canvasRef = useRef(null);

    const [wd, setWd] = useState({ 
        h: window.innerHeight,
        w: window.innerWidth
    })

    useEffect(()=>{
        const debouncedHandleResize = debounce(function handleResize() {
            setWd({
              h: window.innerHeight,
              w: window.innerWidth
            })
          }, 100)
      
          window.addEventListener('resize', debouncedHandleResize)
      
          return ()=>window.removeEventListener('resize', debouncedHandleResize);
    },[])
    
    useEffect(()=>{
        /**
         * @author Alex Andrix <alex@alexandrix.com>
         * @since 2018-12-02
         */
        var AppD = {};
        AppD.setup = function() {
        var canvas = canvasRef.current;
        this.filename = "spipa";
        canvas.width = wd.w;
        canvas.height = wd.h;
        canvas.className = "digital-pattern";
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.dataToImageRatio = 1;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.xC = this.width / 2;
        this.yC = this.height / 2;
        
        this.stepCount = 0;
        this.particles = [];
        this.lifespan = 1000;
        this.popPerBirth = 1;
        this.maxPop = 300;
        this.birthFreq = 2;

        // Build grid
        this.gridSize = 8;// Motion coords
        this.gridSteps = Math.floor(1000 / this.gridSize);
        this.grid = [];
        var i = 0;
        for (var xx = -500; xx < 500; xx += this.gridSize) {
            for (var yy = -500; yy < 500; yy += this.gridSize) {
            // Radial field, triangular function of r with max around r0
            var r = Math.sqrt(xx*xx+yy*yy),
                r0 = 150,
                field;
            
            if (r < r0) field = 255 / r0 * r;
            else if (r > r0) field = 255 - Math.min(255, (r - r0)/2);
            
            this.grid.push({
                x: xx,
                y: yy,
                busyAge: 0,
                spotIndex: i,
                isEdge: (xx == -500 ? 'left' : 
                        (xx == (-500 + this.gridSize * (this.gridSteps-1)) ? 'right' : 
                        (yy == -500 ? 'top' : 
                        (yy == (-500 + this.gridSize *(this.gridSteps-1)) ? 'bottom' : 
                            false
                        )
                        )
                        )
                        ),
                field: field
            });
            i++;
            }
        }
        this.gridMaxIndex = i;
        
        // Counters for UI
        this.drawnInLastFrame = 0;
        this.deathCount = 0;
        
        this.initDraw();
        };
        AppD.evolve = function() {
        var time1 = performance.now();
        
        this.stepCount++;
        
        // Increment all grid ages
        this.grid.forEach(function(e) {
            if (e.busyAge > 0) e.busyAge++;
        });
        
        if (this.stepCount % this.birthFreq == 0 && (this.particles.length + this.popPerBirth) < this.maxPop) {
            this.birth();
        }
        AppD.move();
        AppD.draw();
        
        var time2 = performance.now();
        
        };
        AppD.birth = function() {
        var x, y;
        var gridSpotIndex = Math.floor(Math.random() * this.gridMaxIndex),
            gridSpot = this.grid[gridSpotIndex],
            x = gridSpot.x, y = gridSpot.y;
        
        var particle = {
            hue: Math.abs(-10 + Math.floor(30*Math.random())),
            sat: 95,//30 + Math.floor(70*Math.random()),
            lum: 20 + Math.floor(40*Math.random()),
            x: x, y: y,
            xLast: x, yLast: y,
            xSpeed: 0, ySpeed: 0,
            age: 0,
            ageSinceStuck: 0,
            attractor: {
            oldIndex: gridSpotIndex,
            gridSpotIndex: gridSpotIndex,// Pop at random position on grid
            },
            name: 'seed-' + Math.ceil(10000000 * Math.random())
        };
        this.particles.push(particle);
        };
        AppD.kill = function(particleName) {
        var newArray = _.reject(this.particles, function(seed) {
            return (seed.name == particleName);
        });
        this.particles = _.cloneDeep(newArray);
        };
        AppD.move = function() {
        for (var i = 0; i < this.particles.length; i++) {
            // Get particle
            var p = this.particles[i];
            
            // Save last position
            p.xLast = p.x; p.yLast = p.y;
            
            // Attractor and corresponding grid spot
            var index = p.attractor.gridSpotIndex,
                gridSpot = this.grid[index];
            
            // Maybe move attractor and with certain constraints
            if (Math.random() < 0.5) {
            // Move attractor
            if (!gridSpot.isEdge) {
                // Change particle's attractor grid spot and local move function's grid spot
                var topIndex = index - 1,
                    bottomIndex = index + 1,
                    leftIndex = index - this.gridSteps,
                    rightIndex = index + this.gridSteps,
                    topSpot = this.grid[topIndex],
                    bottomSpot = this.grid[bottomIndex],
                    leftSpot = this.grid[leftIndex],
                    rightSpot = this.grid[rightIndex];
                
                // Choose neighbour with highest field value (with some desobedience...)
                var chaos = 30;
                var maxFieldSpot = _.maxBy([topSpot, bottomSpot, leftSpot, rightSpot], function(e) {
                return e.field + chaos * Math.random()
                });
                
                var potentialNewGridSpot = maxFieldSpot;
                if (potentialNewGridSpot.busyAge == 0 || potentialNewGridSpot.busyAge > 15) {// Allow wall fading
                //if (potentialNewGridSpot.busyAge == 0) {// Spots busy forever
                // Ok it's free let's go there
                p.ageSinceStuck = 0;// Not stuck anymore yay
                p.attractor.oldIndex = index;
                p.attractor.gridSpotIndex = potentialNewGridSpot.spotIndex;
                gridSpot = potentialNewGridSpot;
                gridSpot.busyAge = 1;
                } else p.ageSinceStuck++;
                
            } else p.ageSinceStuck++;
            
            if (p.ageSinceStuck == 10) this.kill(p.name);
            }
            
            // Spring attractor to center with viscosity
            var k = 8, visc = 0.4;
            var dx = p.x - gridSpot.x,
                dy = p.y - gridSpot.y,
                dist = Math.sqrt(dx*dx + dy*dy);
            
            // Spring
            var xAcc = -k * dx,
                yAcc = -k * dy;
            
            p.xSpeed += xAcc; p.ySpeed += yAcc;
            
            // Calm the f*ck down
            p.xSpeed *= visc; p.ySpeed *= visc;
            
            // Store stuff in particle brain
            p.speed = Math.sqrt(p.xSpeed * p.xSpeed + p.ySpeed * p.ySpeed);
            p.dist = dist;
            
            // Update position
            p.x += 0.1 * p.xSpeed; p.y += 0.1 * p.ySpeed;
            
            // Get older
            p.age++;
            
            // Kill if too old
            if (p.age > this.lifespan) {
            this.kill(p.name);
            this.deathCount++;
            }
        }
        };
        AppD.initDraw = function() {
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#1B1B18';
        this.ctx.fill();
        this.ctx.closePath();
        };
        AppD.draw = function() {
        this.drawnInLastFrame = 0;
        if (!this.particles.length) return false;
        
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'rgba(27, 27, 24, 0.1)';
        //this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fill();
        this.ctx.closePath();
        
        for (var i = 0; i < this.particles.length; i++) {
            // Draw particle
            var p = this.particles[i];
            
            var h, s, l, a;

            h = p.hue
            s = p.sat;
            l = p.lum;
            a = 1;
            
            var last = this.dataXYtoCanvasXY(p.xLast, p.yLast),
                now = this.dataXYtoCanvasXY(p.x, p.y);
            var attracSpot = this.grid[p.attractor.gridSpotIndex],
                attracXY = this.dataXYtoCanvasXY(attracSpot.x, attracSpot.y);
            var oldAttracSpot = this.grid[p.attractor.oldIndex],
                oldAttracXY = this.dataXYtoCanvasXY(oldAttracSpot.x, oldAttracSpot.y);
            
            this.ctx.beginPath();
            
            this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
            this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
            
            // Particle trail
            this.ctx.moveTo(last.x, last.y);
            this.ctx.lineTo(now.x, now.y);
            
            this.ctx.lineWidth = 1.5 * this.dataToImageRatio;
            this.ctx.stroke();
            this.ctx.closePath();
            
            // Attractor positions
            this.ctx.beginPath();
            this.ctx.lineWidth = 1.5 * this.dataToImageRatio;
            this.ctx.moveTo(oldAttracXY.x, oldAttracXY.y);
            this.ctx.lineTo(attracXY.x, attracXY.y);
            this.ctx.arc(attracXY.x, attracXY.y, 1.5 * this.dataToImageRatio, 0, 2 * Math.PI, false);
            
            //a /= 20;
            this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
            this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.closePath();
            
            // UI counter
            this.drawnInLastFrame++;
        }
        
        };
        AppD.dataXYtoCanvasXY = function(x, y) {
        var zoom = 1.6;
        var xx = this.xC + x * zoom * this.dataToImageRatio,
            yy = this.yC + y * zoom * this.dataToImageRatio;
        
        return {x: xx, y: yy};
        };


        AppD.setup();
        AppD.draw();
        var animReq;
        var frame = function() {
            AppD.evolve();
            animReq = requestAnimationFrame(frame);
        };
        frame();
        return ()=>{
            window.cancelAnimationFrame(animReq);
        };
    },[wd.h,wd.w]);

    return(<>
        <div id="digitaldance-container" className="digital-dance" >
            <canvas ref={canvasRef} />
        </div>
    </>)
}

export default DigitalDance;