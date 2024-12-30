function AltitudeIndicator(conf) {
    this.conf = {
        divid: conf.id || "altitude0",
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

				this.datakeys=['altitude'];
        this.data = {
            altitude: 1113.0
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

				var range=150;
				var topy=this.data.altitude+(range/2); // -->  1
				var boty=this.data.altitude-(range/2); // --> -1
				var centerspeed=20*Math.round(this.data.altitude/20);
				var offset=this.data.altitude-centerspeed;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(this.x2chart(-1), this.y2chart(0.02));
        ctx.lineTo(this.x2chart(-0.5), this.y2chart(0.02));
        ctx.lineTo(this.x2chart(-0.5), this.y2chart(-0.02));
        ctx.lineTo(this.x2chart(-1), this.y2chart(-0.02));
        ctx.closePath();
        ctx.fill();

				ctx.beginPath();
        ctx.moveTo(this.x2chart(0.8), this.y2chart(0.02));
        ctx.lineTo(this.x2chart(1), this.y2chart(0.02));
        ctx.lineTo(this.x2chart(1), this.y2chart(-0.02));
        ctx.lineTo(this.x2chart(0.8), this.y2chart(-0.02));
        ctx.closePath();
        ctx.fill();

				ctx.beginPath();
        ctx.moveTo(this.x2chart(-1),this.y2chart((centerspeed-this.data.altitude)/(range/2)));
        ctx.lineTo(this.x2chart(-0.5),this.y2chart((centerspeed-this.data.altitude)/(range/2)));
        ctx.stroke();

				ctx.font = "20px Arial";
				ctx.fillText(centerspeed,this.x2chart(-0.3),this.y2chart((centerspeed-
					this.data.altitude)/(range/2))+this.textoffset);

				var ds=20;
				var iter=centerspeed+ds;
				while (iter<topy) {
						var thisnum=iter;
						var posn=(thisnum-this.data.altitude)/(range/2);

						ctx.beginPath();
						ctx.moveTo(this.x2chart(-1),this.y2chart(posn));
						ctx.lineTo(this.x2chart(-0.5),this.y2chart(posn));
						ctx.stroke();

						ctx.fillText(thisnum,this.x2chart(-0.3),this.y2chart(posn)+this.textoffset);

						iter+=ds;
				}

				iter=centerspeed-ds;
				while (iter>boty) {
						var thisnum=iter;
						var posn=(thisnum-this.data.altitude)/(range/2);
        
            ctx.beginPath();
            ctx.moveTo(this.x2chart(-1),this.y2chart(posn));
            ctx.lineTo(this.x2chart(-0.5),this.y2chart(posn));
            ctx.stroke();

            ctx.fillText(thisnum,this.x2chart(-0.3),this.y2chart(posn)+this.textoffset);

						iter-=ds;
        }

				ds=10;
        iter=centerspeed+ds;
        while (iter<topy) {
            var thisnum=iter;
            var posn=(thisnum-this.data.altitude)/(range/2);

            ctx.beginPath();
            ctx.moveTo(this.x2chart(-1),this.y2chart(posn));
            ctx.lineTo(this.x2chart(-0.5),this.y2chart(posn));
            ctx.stroke();

            iter+=ds;
        }

        iter=centerspeed-ds;
        while (iter>boty) {
            var thisnum=iter;
            var posn=(thisnum-this.data.altitude)/(range/2);
    
            ctx.beginPath();
            ctx.moveTo(this.x2chart(-1),this.y2chart(posn));
            ctx.lineTo(this.x2chart(-0.5),this.y2chart(posn));
            ctx.stroke();

            iter-=ds;
        }

		};
}
