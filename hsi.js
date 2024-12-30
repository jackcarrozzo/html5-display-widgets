function HorizSituIndicator(conf) {
    this.conf = {
        divid: conf.id || "hsi0",
        height: conf.height || 400,
        width: conf.width || 400,
        style:  conf.style  || "border:1px solid #fff"
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

        this.datakeys=['plannedheading','noseheading','groundtrack'];
        this.data = {
            plannedheading: 90,
            noseheading: 180,
            groundtrack: 270
        };
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

        ctx.beginPath();
        ctx.arc(this.x2chart(0),this.y2chart(0),
            Math.min(this.conf.height,this.conf.width)/2,0,2*Math.PI);
        ctx.fill();

        ctx.fillStyle = '#33ff66';
        ctx.moveTo(this.x2chart(0),this.y2chart(0));
        ctx.lineTo(this.x2chart(Math.cos(this.navdeg2rads(this.data.plannedheading))),
            this.y2chart(Math.sin(this.navdeg2rads(this.data.plannedheading))));
        ctx.stroke();

        ctx.fillStyle = '#33ff66';
        ctx.moveTo(this.x2chart(0),this.y2chart(0));
        ctx.lineTo(this.x2chart(Math.cos(this.navdeg2rads(this.data.noseheading))),
            this.y2chart(Math.sin(this.navdeg2rads(this.data.noseheading))));
        ctx.stroke();

        ctx.fillStyle = '#33ff66';
        ctx.moveTo(this.x2chart(0),this.y2chart(0));
        ctx.lineTo(this.x2chart(Math.cos(this.navdeg2rads(this.data.groundtrack))),
            this.y2chart(Math.sin(this.navdeg2rads(this.data.groundtrack))));
        ctx.stroke();

    };
}

// intended direction+speed, ground track, airspeed and nose dir
