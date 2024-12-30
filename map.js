function MyMap(conf) {
		this.conf = {
        divid: conf.id || "map0",
        height: conf.height || 400,
        width: conf.width || 400,
        style:  conf.style  || "border:1px solid #fff;",
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

        this.data = [
					{x: -72.4, y: 42.43, v:0.5},
					{x: -72.42, y: 42.233, v:0.2},
					{x: -72.4235, y: 42.63, v:0.25},
					{x: -72.41, y: 42.343, v:0.7},
					{x: -72.458, y: 42.3846, v:0.95},
				];
    };

		this.setminmaxes = function() {
				var xmin,xmax,ymin,ymax,vmin,vmax;
				xmin=xmax=this.data[0].x;
				ymin=ymax=this.data[0].y;
				vmin=vmax=this.data[0].v;

				var i;
				for (i=0;i<this.data.length;i++) {
						if (this.data[i].x>xmax) xmax=this.data[i].x;
						if (this.data[i].x<xmin) xmin=this.data[i].x;
						if (this.data[i].y>ymax) ymax=this.data[i].y;
						if (this.data[i].y<ymin) ymin=this.data[i].y;
						if (this.data[i].v>vmax) vmax=this.data[i].v;
						if (this.data[i].v<vmin) vmin=this.data[i].v;
				}

				this.xmin=xmin;
				this.xmax=xmax;
				this.ymin=ymin;
				this.ymax=ymax;
				this.vmin=vmin;
				this.vmax=vmax;
		};

    this.x2chart = function(x) {
        return this.canvasobj.width*(x-this.xmin)/(this.xmax-this.xmin);
    };

    this.y2chart = function(y) {
        return this.canvasobj.height-this.canvasobj.height*
						(y-this.miny)/(this.ymax-this.ymin);
    };

    this.render = function() {
        this.canvasctx.clearRect(0,0,
						this.canvasobj.width, this.canvasobj.height);

				var ctx = this.canvasctx;

				this.setminmaxes();

				var i;
				for (i=0;i<this.data.length;i++) {
						var thisx=this.x2chart(this.data[i].x);
						var thisy=this.y2chart(this.data[i].y);

						console.log("point",i,"at",this.data[i].x,",",
								this.data[i].y," plots to ",thisx,",",thisy);
				}

		
		};
}
