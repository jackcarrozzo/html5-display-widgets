function Gauge(conf) {
    this.conf = {
        divid: conf.id || "gauge0",
        height: conf.height || 400,
        width: conf.width || 400,
        style:  conf.style  || "border:1px solid #fff",
        bgcolor: conf.bgcolor || '#222222',
        startangle: conf.startangle || 225, // angle ccw from 3 oclock
        maxangle: conf.maxangle || 270, // relative to start angle! 
        valuemin: conf.valuemin || 0,
        valuemax: conf.valuemax || 100,
        marks: conf.marks || {},
        indicators: conf.indicators || {mainind: {key: 'valuea', color: '#33ff66'}} //TODO:
    };

    this.data = {};

    this.setup = function() {
        this.divobj = document.getElementById(this.conf.divid);
        if (!this.divobj) { console.log("missing div:",this.conf.divid); return; }
        this.divobj.innerHTML = "<canvas id='"+this.conf.divid+"_canvas'></canvas>";

        this.canvasobj = document.getElementById(this.conf.divid+"_canvas");
        this.canvasctx = this.canvasobj.getContext("2d");

        this.canvasobj.setAttribute("width", this.conf.width);
        this.canvasobj.setAttribute("height", this.conf.height);
        this.canvasobj.setAttribute("style", this.conf.style);

        // TODO: multiple values
        // TODO: make range work properly
        // configurable color bands and ranges would be cool

        //this.datakeys=['value','greenstart','greenend','redstart','redend'];
        //this.datakeys=['valuea','valueb'];
        /*this.data = {
            valuea: 0,
            valueb: 0
        };*/
        this.data.valuea = this.data.valuea || 0;
    };

    this.update = function(newdata) {
        // take newdata[datakey] and store it to data[datakey]

        function find_ind_by_key(conf,key) {
            for (indname in conf.indicators) {
                if (conf.indicators[indname].key==key)
                    return conf.indicators[indname];
            }
            return null;
        }

        for (datakey in newdata) { // do it this way so that we leave nonpresent items in data
            var ind=find_ind_by_key(this.conf, datakey); // is this even neccesary? TODO:

            if (!ind) {
                console.log("failed to find indicator with data key ",datakey,"!");
                continue;
            }

            this.data[datakey]=newdata[datakey];
        }

        /*  this one interates indicators instead of newdata!

        for (indname in this.conf.indicators) {
            var ind=this.conf.indicators[indname];

            console.log("doing indicator ",indname,": ",ind);
        
            this.data[ind.key]=newdata[ind.key];
        }*/

        //console.log("after update(), data is ",this.data);

        this.render();
    };

    this.x2chart = function(x) {
        return this.canvasobj.width*(x+1)/2;
    };

    this.y2chart = function(y) {
        return this.canvasobj.height*(1-y)/2;
    };

    this.value2rads = function(value) {
        // scale valuemin < value < valuemax from startangle to maxangle
        //   seems to be broken (TODO?)

        var diff=this.conf.valuemax-this.conf.valuemin;
        var v=(value/diff)-this.conf.valuemin; // now scaled 0-1
   
        //console.log("v is ",v);

        //var degdif=this.conf.maxangle-this.conf.startangle;
        var degdif=this.conf.maxangle; // relative to start
        
        //console.log("degdif is ",degdif,", maxangle ",this.conf.maxangle,", startangle ",this.conf.startangle);
        var theta=this.conf.startangle-(degdif*v);

        //console.log("value2rads got ",value,", theta ",theta);

        return this.gaugedeg2rads(theta);
    };

    this.valgauge2r = function(val) {
        // scale val / valuemax across maxangle deg, then pass to gaugedeg2rads
        var v=this.conf.maxangle*val/this.conf.valuemax;

        //console.log("vg2r: val ",val," to ",v);

        return this.gaugedeg2rads(v);
    }

    this.gaugedeg2rads = function(theta) {
        // start at startangle deg and go cw to maxangle
        var v=Math.PI*(this.conf.startangle-theta)/180;
        //console.log("gaugedeg2rads got theta ",theta," returns ",v);

        return v;
    };

    this.deg2rads = function(theta) {
        return Math.PI*theta/180;
    }

    this.drawpieslice = function(ctx, color, v1, v2) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.x2chart(0),this.y2chart(0));
        ctx.arc(this.x2chart(0),this.y2chart(0),
            Math.min(this.conf.height,this.conf.width)/2,
            this.gaugedeg2rads(75+v1),this.gaugedeg2rads(75+v2));
        ctx.fill();
    }

    this.drawarc = function(ctx, color, radius, width, v1, v2) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.x2chart(0),this.y2chart(0));
        ctx.arc(this.x2chart(0),this.y2chart(0),
            Math.min(this.conf.height,this.conf.width)/2-radius,
            this.valgauge2r(32-v1),this.valgauge2r(35-v2)); 
        
        ctx.arc(this.x2chart(0),this.y2chart(0),
            Math.min(this.conf.height,this.conf.width)/2-(radius+width),
            this.valgauge2r(35-v2),this.valgauge2r(32-v1), true);


        ctx.fill();
    }

    this.drawline = function(ctx, color, val, width) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(this.x2chart(0),this.y2chart(0));
        var rad = this.valgauge2r(val);
        ctx.lineTo(this.x2chart(Math.cos(rad)),
            this.y2chart(Math.sin(rad)));
        ctx.stroke();
    }

    this.rendermarks = function(ctx, marks) {
        for (markname in marks) {
            //console.log("mark ",markname,": ",this.conf.marks[markname]);
        
            if (marks[markname].type=='arc') {
                this.drawarc(ctx,
                    marks[markname].color || '#ffff00',
                    marks[markname].radoffset || 20,
                    marks[markname].width || 30,
                    marks[markname].startval || 10,
                    marks[markname].endval || 90);
            }
        }
    }

    this.renderindicators = function(ctx, indicators) {
        for (indname in indicators) {
            var ind=indicators[indname];

            if (!this.data[ind.key]) {
                console.log("skipping rendering key ",ind.key," since its not here");
                continue;
            }

            this.drawline(ctx, 
                ind.color || '#00ff00',
                this.data[ind.key],
                ind.width || 1);
        }
    }

    this.render = function() {
        this.canvasctx.clearRect(0,0,
            this.canvasobj.width, this.canvasobj.height);

        var ctx = this.canvasctx;
        ctx.fillStyle = this.conf.bgcolor; // TODO: no idea why this doesnt work
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        // background
        ctx.beginPath();
        ctx.arc(this.x2chart(0),this.y2chart(0),
            Math.min(this.conf.height,this.conf.width)/2,0,2*Math.PI);
        ctx.fill();
      
        // dark grey arc
        this.drawpieslice(ctx, '#333333', 0, 30);

        this.rendermarks(ctx, this.conf.marks);

        this.renderindicators(ctx, this.conf.indicators);

        // red arc
        //this.drawarc(ctx, '#aa3333', 30, 30, 0, 100);

        // green arc
        //this.drawarc(ctx, '#33aa33', 50, 30, 20, 30);

        // green line
        //this.drawline(ctx, '#33ff66', this.data.valuea);

        // light blue line
        //this.drawline(ctx, '#33ffee', this.data.valuea-5);

        // orange line
        //this.drawline(ctx, '#ffbb33', this.data.valuea+5);

        // red line
        //this.drawline(ctx, '#ff3333', this.data.valuea+10);

        /*ctx.beginPath();
        ctx.strokeStyle = '#aaaa00';
        ctx.arc(this.x2chart(0),this.y2chart(0),
            Math.min(this.conf.height,this.conf.width)/2,
            this.gaugedeg2rads(this.data.valuea+15),
            this.gaugedeg2rads(this.data.valuea+25));
        ctx.fill();
        ctx.stroke();*/

        /*
        ctx.fillStyle = '#33ff66';
        ctx.moveTo(this.x2chart(0),this.y2chart(0));
        ctx.lineTo(this.x2chart(Math.cos(this.navdeg2rads(this.data.noseheading))),
            this.y2chart(Math.sin(this.navdeg2rads(this.data.noseheading))));
        ctx.stroke();*/

        /*ctx.fillStyle = '#33ff66';
        ctx.moveTo(this.x2chart(0),this.y2chart(0));
        ctx.lineTo(this.x2chart(Math.cos(this.navdeg2rads(this.data.groundtrack))),
            this.y2chart(Math.sin(this.navdeg2rads(this.data.groundtrack))));
        ctx.stroke();
        */
    };
}
