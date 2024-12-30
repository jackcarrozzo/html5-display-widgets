function BarGraph(conf) {
		this.conf = {
        divid: conf.id || "bargraph0",
        height: conf.height || 400,
        width: conf.width || 50,
        style:  conf.style  || "border:1px solid #fff; paddingLeft: 0px",
				dir: conf.dir || "vertical",
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

				// [-1,1]
        this.data = {
					value: 0.5
				};
    };

		this.update = function(newval) {
			this.data.value=newval;
      this.render();
    };

    this.x2chart = function(x) {
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

				if (this.conf.dir=="vertical") {
						if (this.data.value>=0) {
							ctx.fillStyle = '#33ff66';
							ctx.beginPath();
							ctx.moveTo(this.x2chart(-1), this.y2chart(0));
							ctx.lineTo(this.x2chart(-1), this.y2chart(this.data.value));
							ctx.lineTo(this.x2chart(1), this.y2chart(this.data.value));
							ctx.lineTo(this.x2chart(1), this.y2chart(0));
							ctx.closePath();
							ctx.fill();
						} else {
							ctx.fillStyle = '#ff3333';
              ctx.beginPath();
              ctx.moveTo(this.x2chart(-1), this.y2chart(0));
              ctx.lineTo(this.x2chart(-1), this.y2chart(this.data.value));
              ctx.lineTo(this.x2chart(1), this.y2chart(this.data.value));
              ctx.lineTo(this.x2chart(1), this.y2chart(0));
              ctx.closePath();
              ctx.fill();
						}
				} else {
						if (this.data.value>=0)
              	ctx.fillStyle = '#33ff66';
						else
								ctx.fillStyle = '#ff3333';

						ctx.beginPath();
						ctx.moveTo(this.x2chart(0), this.y2chart(1));
						ctx.lineTo(this.x2chart(this.data.value), this.y2chart(1));
						ctx.lineTo(this.x2chart(this.data.value), this.y2chart(-1));
						ctx.lineTo(this.x2chart(0), this.y2chart(-1));
						ctx.closePath();
						ctx.fill();
				}
		};
}
