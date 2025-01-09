function RadialSectors(conf) {
    this.conf = {
        divid: conf.id || "radial0",
        height: conf.height || 400,
        width: conf.width || 400,
        style:  conf.style  || "border:1px solid #fff",
        bgcolor: conf.bgcolor || '#222222',
        valuemin: conf.valuemin || 0,
        valuemax: conf.valuemax || 100
    };

    this.data = [ // TODO: make shape and gen thru conf
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];

    this.setup = function() {
        this.divobj = document.getElementById(this.conf.divid);
        if (!this.divobj) { console.log("missing div:",this.conf.divid); return; }
        this.divobj.innerHTML = "<canvas id='"+this.conf.divid+"_canvas'></canvas>";

        this.canvasobj = document.getElementById(this.conf.divid+"_canvas");
        this.canvasctx = this.canvasobj.getContext("2d");

        this.canvasobj.setAttribute("width", this.conf.width);
        this.canvasobj.setAttribute("height", this.conf.height);
        this.canvasobj.setAttribute("style", this.conf.style);
    };

    this.x2chart = function(x) {
        return this.canvasobj.width*(x+1)/2;
    };

    this.y2chart = function(y) {
        return this.canvasobj.height*(1-y)/2;
    };

    this.deg2rads = function(theta) {
        return Math.PI*theta/180;
    };

    // including offsets from origin
    this.polar2cart = function(thetarad, r) {
        return {
            x: (r*Math.cos(thetarad))+this.radial_origin_x,
            y: this.radial_origin_y-(r*Math.sin(thetarad))
        };
    };

    this.degpolar2cart = function(thetadeg, r) {
        return this.polar2cart(this.deg2rads(thetadeg), r);
    };

    this.drawpieslice = function(ctx, color, v1, v2) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.x2chart(0),this.y2chart(0));
        ctx.arc(this.x2chart(0),this.y2chart(0),
            Math.min(this.conf.height,this.conf.width)/2,
            this.deg2rads(75+v1),this.deg2rads(75+v2));
        ctx.fill();
    };

    this.drawarc = function(ctx, color, minradius, maxradius, theta1, theta2) {
        var smallerangle=(theta1<=theta2)?theta1:theta2;
        var largerangle=(theta1<=theta2)?theta2:theta1;
        // top right (lower-theta) corner, ccw (+theta) sweep across at maxr,
        //   down to minr, cw sweep back to lower theta

        // for some reason the arc starts at pi at left and goes around cw to 2pi?
        smallerangle=Math.PI+(Math.PI*smallerangle/180);
        largerangle=Math.PI+(Math.PI*largerangle/180);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.radial_origin_x, this.radial_origin_y,
            maxradius,
            largerangle,smallerangle,true); 
        
        ctx.arc(this.radial_origin_x, this.radial_origin_y,
            minradius,
            smallerangle,largerangle, false);

        ctx.fill();
        //ctx.stroke();
    };

    this.drawline = function(ctx, color, width, theta1, r1, theta2, r2) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        var p1=this.degpolar2cart(theta1, r1);
        ctx.moveTo(p1.x,p1.y);
        var p2 = this.degpolar2cart(theta2, r2);
        ctx.lineTo(p2.x,p2.y);
        ctx.stroke();
    };

    this.docalcs = function() {
        this.radial_origin_x=this.canvasobj.width/2;
        this.radial_origin_y=this.canvasobj.height-(this.conf.bottompadding||5);
        this.radial_max_r=this.conf.max_r||((this.canvasobj.width/2)-(2*(this.conf.sidepadding||5)));
    };

    this.update = function(newdata) {
        this.data=newdata;
        this.render();
    }

    this.rendersectors = function() {
        /*this.data=[
            [9, 2, 10, 9, 8, 6, 2, 3],
            [2, 0, 3, 1, 5, 2, 0, 0],
            [4, 2, 5, 7, 2, 1, 2, 7],
            [9, 5, 7, 9, 8, 6, 2, 5],
            [9, 4, 9, 4, 7, 8, 0, 3],
            [9, 1, 5, 9, 8, 6, 1, 2]];*/

        var n_rows=this.data[0].length; // fft bins, radius out from ctr
        var n_cols=this.data.length; // angle sectors left to right (cw)

        console.log("will plot ",n_rows," rows and ",n_cols," radial columns");

        var swp=this.sectorwpad||3;
        var shp=this.sectorhpad||2;
        var sectorwidth_deg=180/n_cols;
        var sectorheight=this.radial_max_r/n_rows;

        for (var i=0;i<n_rows;i++) {
            for (var j=0;j<n_cols;j++) {
                var starttheta=(j*sectorwidth_deg)+swp;
                var endtheta=((j+1)*sectorwidth_deg)-swp;
                var highradius=((i+1)*sectorheight)-shp;
                var lowradius=(i*sectorheight)+shp;
                var byteval=Math.floor(25.5*this.data[j][i]);
                var color=`rgb(
                    ${Math.floor(0)}
                    ${Math.floor(byteval)}
                    ${Math.floor(0)}
                )`;

                this.drawarc(this.canvasctx, color, lowradius, highradius, starttheta, endtheta);
            }
        }

    };

    this.render = function() {
        this.canvasctx.clearRect(0,0,
            this.canvasobj.width, this.canvasobj.height);

        this.docalcs();

        var ctx = this.canvasctx;
        ctx.fillStyle = this.conf.bgcolor; // TODO: no idea why this doesnt work
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        // background
        ctx.beginPath();
        ctx.arc(this.radial_origin_x,this.radial_origin_y,
            (this.conf.width/2)-(this.conf.diampadding||5),Math.PI,0); // TODO diampadding vs sidepadding
        ctx.fill();
     
        //this.drawline(ctx, '#ff6633', 4, 40, 10, 40, 400);

        //this.drawarc(ctx, '#ff3300', 100, 200, 45, 60);

        this.rendersectors();
    };
}
