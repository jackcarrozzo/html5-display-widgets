function Waterfall(conf) {
    this.conf = {
        divid: conf.id || "waterfall0",
        height: conf.height || 600,
        width: conf.width || 1200,
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

		this.vmin=0;
		this.vmax=0;
    };

	// TODO: set max number of slices to show regardless of size of list in;
	//   slide new slices into their right spot as they arrive

    this.setminmaxes = function(slicesobj) {
        console.log("setminmaxes: got ",slicesobj);

		var xmin,xmax,ymin,ymax,vmin,vmax;
        this.xmin=0;
		this.ymin=0;
		this.xmax=slicesobj.fft_bin_slices[0].length; // num bins per fft
		this.ymax=slicesobj.fft_bin_slices.length;    // num fftslices (TODO: shift over as new stuff comes in)
		
		this.vmin=0;
		this.vmax=this.find_slices_max(slicesobj.fft_bin_slices);

		this.winxmin=5; // TODO: configize
		this.winymin=5;
		this.winxmax=this.canvasobj.width-5;
		this.winymax=this.canvasobj.height-5;

		console.log("scaling vals from ",this.vmin," to ",this.vmax);
		console.log("from x ",this.xmin," to ",this.xmax," over ",this.winxmin," to ",this.winxmax);
		console.log("and  y ",this.ymin," to ",this.ymax," over ",this.winymax," to ",this.winymin);
    };

    this.x2chart = function(x) {
		// scale [xmin, xmax] over [winxmin, winxmax]
        return ((this.winxmax-this.winxmin)*((x-this.xmin)/(this.xmax-this.xmin)))+this.winxmin;
    };

    this.y2chart = function(y) {
		// scale [ymin, ymax] over [winymax, winymin]

		return this.winymax-((this.winymax-this.winymin)*((y-this.ymin)/(this.ymax-this.ymin)));
    };

	this.valscale = function(v) {
		// scale val from 0 to vmax to 0 to 255

		return 255*(v/this.vmax);
	}

    /*
	update() takes the full object from cl:

	{n: 9, num_fft_slices: 517, sample_rate_hz: 48000, 
	  x_axis_m: Array(256), x_axis_hz: Array(256), …},
	  fft_bin_slices: 
(517) [Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), Array(256), …],
	  n: 9, num_fft_slices: 517, sample_rate_hz: 48000, 
	  x_axis_hz: 
(256) [0, 93.75, 187.5, 281.25, 375, 468.75, 562.5, 656.25, 750, 843.75, 937.5, 1031.25, 1125, 1218.75, 1312.5, 1406.25, 1500, 1593.75, 1687.5, 1781.25, 1875, 1968.75, 2062.5, 2156.25, 2250, 2343.75, 2437.5, 2531.25, 2625, 2718.75, 2812.5, 2906.25, 3000, 3093.75, 3187.5, 3281.25, 3375, 3468.75, 3562.5, 3656.25, 3750, 3843.75, 3937.5, 4031.25, 4125, 4218.75, 4312.5, 4406.25, 4500, 4593.75, 4687.5, 4781.25, 4875, 4968.75, 5062.5, 5156.25, 5250, 5343.75, 5437.5, 5531.25, 5625, 5718.75, 5812.5, 5906.25, 6000, 6093.75, 6187.5, 6281.25, 6375, 6468.75, 6562.5, 6656.25, 6750, 6843.75, 6937.5, 7031.25, 7125, 7218.75, 7312.5, 7406.25, 7500, 7593.75, 7687.5, 7781.25, 7875, 7968.75, 8062.5, 8156.25, 8250, …],
	  x_axis_m: 
(256) [0, 0.026132813, 0.052265625, 0.07839844, 0.10453125, 0.13066407, 0.15679687, 0.18292968, 0.2090625, 0.23519531, 0.26132813, 0.28746092, 0.31359375, 0.33972657, 0.36585936, 0.39199218, 0.418125, 0.4442578, 0.47039062, 0.49652344, 0.52265626, 0.5487891, 0.57492185, 0.60105467, 0.6271875, 0.6533203, 0.67945313, 0.70558596, 0.7317187, 0.75785154, 0.78398436, 0.8101172, 0.83625, 0.8623828, 0.8885156, 0.9146484, 0.94078124, 0.96691406, 0.9930469, 1.0191797, 1.0453125, 1.0714453, 1.0975782, 1.1237109, 1.1498437, 1.1759765, 1.2021093, 1.2282422, 1.254375, 1.2805078, 1.3066406, 1.3327734, 1.3589063, 1.3850391, 1.4111719, 1.4373047, 1.4634374, 1.4895703, 1.5157031, 1.5418359, 1.5679687, 1.5941015, 1.6202344, 1.6463672, 1.6725, 1.6986328, 1.7247657, 1.7508985, 1.7770312, 1.803164, 1.8292968, 1.8554296, 1.8815625, 1.9076953, 1.9338281, 1.9599609, 1.9860938, 2.0122266, 2.0383594, 2.0644922, 2.090625, 2.1167579, 2.1428907, 2.1690235, 2.1951563, 2.2212892, 2.2474217, 2.2735546, 2.2996874, 2.3258202, 2.351953, 2.3780859, 2.4042187, 2.4303515, 2.4564843, 2.4826171, 2.50875, 2.5348828, 2.5610156, 2.5871484, …]
    */

	this.find_ar_max = function(ar) {
		var max=ar[0];
		for (var i=1;i<ar.length;i++) {
			if (ar[i]>max) max=ar[i];
		}
		return max;
	}

	this.find_slices_max = function(slices) {
		var max=slices[0][0];
		for (var i=0;i<slices.length;i++) {
			var slicemax=this.find_ar_max(slices[i]);
			if (slicemax>max) max=slicemax;
		}
		return max;
	}

	this.update = function(slicesobj) {
		this.setminmaxes(slicesobj);

		this.render(slicesobj);
	}

    this.render = function(slicesobj) {
        this.canvasctx.clearRect(0,0,
			this.canvasobj.width, this.canvasobj.height);

        var ctx = this.canvasctx;

		ctx.fillRect(10, 20, 150, 100);

		//TODO: make cleaner
		var valwidth= this.x2chart(2)-this.x2chart(1);
		var valheight=1+this.y2chart(1)-this.y2chart(2);

		console.log("valwidth is ",valwidth,", valheight is ",valheight);

		for (var s=0;s<slicesobj.fft_bin_slices.length;s++) {
			for (var bin=0;bin<slicesobj.fft_bin_slices[0].length;bin++) {
				var thisx=this.x2chart(bin);
				var thisy=this.y2chart(s);
				var thisv=slicesobj.fft_bin_slices[s][bin];

				ctx.fillStyle=`rgb(
					${Math.floor(this.valscale(thisv))}
					${Math.floor(this.valscale(thisv))}
					${Math.floor(this.valscale(thisv))}
				)`;
				ctx.fillRect(thisx, thisy, valwidth, valheight); // xwidth yheight
			}
		}

		ctx.fillStyle="rgb(50,255,0,50%)";
		ctx.fillRect(10, 20, 150, 100);


    };
}
