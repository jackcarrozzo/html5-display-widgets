function AngleOfAttackIndicator(conf) {
		this.conf = {
        divid: conf.id || "aoa0",
        height: conf.height || 200,
        width: conf.width || 200,
        style:  conf.style  || "border:1px solid #fff",
				rangemax: conf.rangemax || 15,
				rangemin: conf.rangemin || -5,
				redline: conf.redline || 18
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

				this.datakeys = ['aoa'];

        this.data = {
						aoa: 4,
				};

				console.log("hey, im the aoa indicator.",this);
    };

		this.update = function(newdata) {
			var i;
			for (i=0;i<this.datakeys.length;i++) {
					this.data[this.datakeys[i]]=newdata[this.datakeys[i]] || 
							this.data[this.datakeys[i]];
			}

			this.render();
		};

    this.x2chart = function(x) {
        return this.canvasobj.width*(x+1)/2;
    };

    this.y2chart = function(y) {
        return this.canvasobj.height*(1-y)/2;
    };

		this.navdeg2rads = function(theta) {
				var v=(90-theta)*180/Math.PI;
				if (v<0) v+=360;
				return v;
		};

    this.render = function() {
        this.canvasctx.clearRect(0,0,
						this.canvasobj.width, this.canvasobj.height);

				var ctx = this.canvasctx;
				ctx.fillStyle = '#333333';

				var radius=200;

				// background
				ctx.beginPath();
				ctx.moveTo(this.x2chart(1),this.y2chart(-0.3));
				ctx.lineTo(this.x2chart(1),this.y2chart(-1));
				ctx.arc(this.x2chart(1),this.y2chart(-0.3),
						radius,Math.PI/2,1.5*Math.PI);
				ctx.fill();

				var greenstartangle=((180+this.conf.rangemax)*Math.PI)/180;
				var greenendangle=((180+this.conf.rangemin)*Math.PI)/180;
				var redlineangle=((180+this.conf.redline)*Math.PI)/180;
				var aoaangle=((180+this.data.aoa)*Math.PI)/180;

				ctx.fillStyle = '#114422';
				ctx.beginPath();
        ctx.moveTo(this.x2chart(1),this.y2chart(-0.3));
        ctx.arc(this.x2chart(1),this.y2chart(-0.3),
            radius,greenendangle,greenstartangle);
        ctx.fill();

				var s=0.05;
				ctx.fillStyle = '#ff3300';
        ctx.beginPath();
        ctx.moveTo(this.x2chart(1),this.y2chart(-0.3));
        ctx.arc(this.x2chart(1),this.y2chart(-0.3),
            radius,redlineangle-s,redlineangle+s);
        ctx.fill();

				s=0.02
				ctx.fillStyle = '#aaff11';
        ctx.beginPath();
        ctx.moveTo(this.x2chart(1),this.y2chart(-0.3));
        ctx.arc(this.x2chart(1),this.y2chart(-0.3),
            radius,aoaangle-s,aoaangle+s);
        ctx.fill();
			
				/*
				// TODO:	
				ctx.beginPath();
				var ix=(Math.cos(90*Math.PI)/180);
				var iy=(Math.sin(90*Math.PI)/180);
				console.log("aoa ind: dot wants to center at ",ix,iy);
				ctx.arc(ix,iy,
            20,0,2*Math.PI);
        ctx.fill();
				*/

				ctx.font = "16px Arial";
				ctx.fillStyle = '#ffffff';
        ctx.fillText("AoA: ",this.x2chart(0.1),
            this.y2chart(-0.9));
				ctx.font = "24px Arial";
				ctx.fillText(((this.data.aoa>=0)?"+":"-")+this.data.aoa,this.x2chart(0.6),
            this.y2chart(-0.9));


		};
}

// intended direction+speed, ground track, airspeed and nose dir

