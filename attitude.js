function AttitudeIndicator(conf) {
    this.conf = {
        divid:  conf.id || "attitude0",
        height: conf.height || 400,
        width:  conf.width || 400,
        style:  conf.style  || "border:0px solid #fff"
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

        this.datakeys=['yaw','pitch','roll','altitude','airspeed'];
        this.data = {
            yaw: 85.4,
            pitch: -7.2,
            roll: -45.5,
            altitude: 200,
            airspeed: 34
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
        // -1 to 1
        return this.canvasobj.width*(x+1)/2;
    };

    this.y2chart = function(y) {
        return this.canvasobj.height*(1-y)/2;
    };

    this.render = function() {
        this.canvasctx.clearRect(0,0,
            this.canvasobj.width, this.canvasobj.height);

        var angle_rad=this.data.roll/(180*Math.PI);
        var edgedist=Math.sin(angle_rad);
        var pitchval=Math.min(90,this.data.pitch);
        pitchval=Math.max(-90,pitchval);
        var centerposn=pitchval/90;

        var ctx = this.canvasctx;

        ctx.fillStyle = '#2c82c4';
        ctx.beginPath();
        ctx.moveTo(this.x2chart(-1), this.y2chart(1));
        ctx.lineTo(this.x2chart(1), this.y2chart(1));
        ctx.lineTo(this.x2chart(1), this.y2chart(-1));
        ctx.lineTo(this.x2chart(-1), this.y2chart(-1));
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#924b32';
        ctx.beginPath();
        ctx.moveTo(this.x2chart(-1), this.y2chart(centerposn+(8* edgedist)));
        ctx.lineTo(this.x2chart(1), this.y2chart(centerposn-(8* edgedist)));
        ctx.lineTo(this.x2chart(1), this.y2chart(-1));
        ctx.lineTo(this.x2chart(-1), this.y2chart(-1));
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(this.x2chart(-0.6),this.y2chart(0));
        ctx.lineTo(this.x2chart(-0.4),this.y2chart(0));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x2chart(0.6),this.y2chart(0));
        ctx.lineTo(this.x2chart(0.4),this.y2chart(0));
        ctx.stroke();

        var i;
        for (i=-0.5;i<=0.5;i+=0.25) {
            ctx.beginPath();
            ctx.moveTo(this.x2chart(-0.2),this.y2chart(i));
            ctx.lineTo(this.x2chart(0.2),this.y2chart(i));
            ctx.stroke();
        }

        ctx.font = "16px Arial";
        ctx.fillText("AS: "+this.data.airspeed,this.x2chart(-0.95),
            this.y2chart(-0.88));
        ctx.fillText("GS: "+this.data.groundspeed,this.x2chart(-0.96),
            this.y2chart(-0.96));
        ctx.fillText("Alt: "+this.data.altitude,this.x2chart(0.6),
            this.y2chart(-0.96));

        ctx.font = "12px Arial";
        ctx.fillText("Pitch",this.x2chart(-0.95),
            this.y2chart(0.92));
        ctx.fillText("Hdg",this.x2chart(-0.05),
            this.y2chart(0.92));
        ctx.fillText("Roll",this.x2chart(0.75),
            this.y2chart(0.92));

        ctx.font = "24px Arial";
        ctx.fillText(this.data.yaw,this.x2chart(-0.1),
        this.y2chart(0.81));

        ctx.font = "16px Arial";
        ctx.fillText(this.data.pitch,this.x2chart(-0.95),
            this.y2chart(0.85));
        ctx.fillText(this.data.roll,this.x2chart(0.72),
            this.y2chart(0.85));

    };
}
