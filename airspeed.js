function AirspeedIndicator(conf) {
    this.conf = {
        divid: conf.id || "airspeed0",
        height: conf.height || 400,
        width: conf.width || 100,
        style:  conf.style  || "border:0px solid #fff",
				bgcolor: conf.bgcolor || "#444"
    };

    this.setup = function() {
        this.divobj = document.getElementById(this.conf.divid);
        if (!this.divobj) { console.log("missing div:",this.conf.divid); return; }
        this.divobj.innerHTML = "<canvas id='"+this.conf.divid+"_canvas'></canvas>";

        this.canvasobj = document.getElementById(this.conf.divid+"_canvas");
        this.canvasctx = this.canvasobj.getContext("2d");

        this.canvasobj.setAttribute("width", this.conf.width);
        this.canvasobj.setAttribute("height", this.conf.height);
        this.canvasobj.setAttribute("style", this.conf.style);

				this.datakeys=['airspeed'];
        this.data = {
            airspeed: 35.2
        };
    };

		this.textoffset=5;

		this.update = function(newdata) {
      var i;
      for (i=0;i<this.datakeys.length;i++) {
          this.data[this.datakeys[i]]=newdata[this.datakeys[i]] || 
              this.data[this.datakeys[i]];
      }

      this.render();
    };

    this.x2chart = function(x) {
        // -1 to 1
        return this.canvasobj.width*(x+1)/2;
    };

    this.y2chart = function(y) {
        return this.canvasobj.height*(1-y)/2;
    };

		this.render = function() {
				this.canvasctx.clearRect(0,0,
                                 this.canvasobj.width, this.canvasobj.height);
				var ctx = this.canvasctx;

        ctx.fillStyle = this.conf.bgcolor;
        ctx.beginPath();
        ctx.moveTo(this.x2chart(-1), this.y2chart(1));
        ctx.lineTo(this.x2chart(1), this.y2chart(1));
        ctx.lineTo(this.x2chart(1), this.y2chart(-1));
        ctx.lineTo(this.x2chart(-1), this.y2chart(-1));
        ctx.closePath();
        ctx.fill();	

				// top of bar is airspeed+(range/2)
				// bottom is airspeed-(range/2)
				// offset is airspeed-round(airspeed)
				
				var range=20;
				var topy=this.data.airspeed+(range/2); // -->  1
				var boty=this.data.airspeed-(range/2); // --> -1
				var centerspeed=Math.round(this.data.airspeed);
				var offset=this.data.airspeed-centerspeed;

				/*
				console.log("AS is",this.data.airspeed,", displaying from ",
					boty,"to",topy,"with closest center at",centerspeed,
					"at our",offset/(range/2));*/

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(this.x2chart(-1), this.y2chart(0.02));
        ctx.lineTo(this.x2chart(-0.5), this.y2chart(0.02));
        ctx.lineTo(this.x2chart(-0.5), this.y2chart(-0.02));
        ctx.lineTo(this.x2chart(-1), this.y2chart(-0.02));
        ctx.closePath();
        ctx.fill();

				ctx.beginPath();
        ctx.moveTo(this.x2chart(0.5), this.y2chart(0.02));
        ctx.lineTo(this.x2chart(1), this.y2chart(0.02));
        ctx.lineTo(this.x2chart(1), this.y2chart(-0.02));
        ctx.lineTo(this.x2chart(0.5), this.y2chart(-0.02));
        ctx.closePath();
        ctx.fill();

				ctx.beginPath();
        ctx.moveTo(this.x2chart(0.5),this.y2chart((centerspeed-this.data.airspeed)/(range/2)));
        ctx.lineTo(this.x2chart(1),this.y2chart((centerspeed-this.data.airspeed)/(range/2)));
        ctx.stroke();

				ctx.font = "20px Arial";
				/*ctx.fillText(centerspeed,this.x2chart(0),this.y2chart((centerspeed-
					this.data.airspeed)/(range/2))+this.textoffset);*/

				var ds=1;
				var iter=centerspeed+ds;
				while (iter<topy) {
					var thisnum=iter;
					var posn=(thisnum-this.data.airspeed)/(range/2);

					//console.log(thisnum,"is at our",posn);

					if (0==iter%2) {
						ctx.beginPath();
						ctx.moveTo(this.x2chart(0.5),this.y2chart(posn));
						ctx.lineTo(this.x2chart(1),this.y2chart(posn));
						ctx.stroke();

						ctx.fillText(thisnum,this.x2chart(-0.2),this.y2chart(posn)+this.textoffset);
					} else {
						ctx.beginPath();
            ctx.moveTo(this.x2chart(0.75),this.y2chart(posn));
            ctx.lineTo(this.x2chart(1),this.y2chart(posn));
            ctx.stroke();
					}

					iter+=ds;
				}

				iter=centerspeed-ds;
				while (iter>boty) {
          var thisnum=iter;
          var posn=(thisnum-this.data.airspeed)/(range/2);
        
          //console.log(thisnum,"is at our",posn);

					if (0==iter%2) {
            ctx.beginPath();
            ctx.moveTo(this.x2chart(0.5),this.y2chart(posn));
            ctx.lineTo(this.x2chart(1),this.y2chart(posn));
            ctx.stroke();

            ctx.fillText(thisnum,this.x2chart(-0.2),this.y2chart(posn)+this.textoffset);
          } else {
            ctx.beginPath();
            ctx.moveTo(this.x2chart(0.75),this.y2chart(posn));
            ctx.lineTo(this.x2chart(1),this.y2chart(posn));
            ctx.stroke();
          }

          iter-=ds;
        }

		};
}
