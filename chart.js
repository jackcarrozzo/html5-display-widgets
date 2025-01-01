/*
  todo:
    - min_x etc currently are only set as values of the data's min+max - p_minx
        etc should be checked in render if we arent rendering the entire time window
    - p_minx, p_maxx can (should) be autoupdated for a "show n pts" or periuod of time func
*/

function Chart(conf, plots) {
    this.conf = {
        divid:   conf.id    || "chart0",
        height:  conf.height  || 200,
        width:  conf.width  || 800,
        style:  conf.style  || "border:1px solid #fff",
        debug:  conf.debug  || true, // TODO:
        xmargin: conf.xmargin || 4,
        ymargin: conf.ymargin || 5,
        y_axes:  conf.y_axes  || null,
        single_x_axis: conf.single_x_axis || false,
        x_label: conf.x_label || null,
		legend_x: conf.legend_x || 20,
        legend_y: conf.legend_y || 20,
        legend_x_margin: conf.legend_x_margin || 5,
        legend_y_margin: conf.legend_y_margin || 5,
        legend_ptsize: conf.legend_ptsize || 8,
        legend_alpha: conf.legend_alpha || 0.7
    };

    this.plots=[];

    var i;
    for (i in plots) {
        var thisplot=plots[i];

        this.plots[i]=({
            name: thisplot.name||("plot"+i),
            type: thisplot.type||'xy',
            color: thisplot.color||'#00ff66',
            ptsize: thisplot.ptsize||20,
			linesize: thisplot.linesize||null,
			linecolor: thisplot.linecolor||null,
            p_minx: thisplot.p_minx||null,
            p_miny: thisplot.p_miny||null,
            p_maxx: thisplot.p_maxx||null,
            p_maxy: thisplot.p_maxy||null,
            min_x: "unset",
            max_x: "unset",
            min_y: "unset",
            max_y: "unset",
            y_axis: thisplot.y_axis||null,
            x_propname: thisplot.x_propname||'x',
            y_propname: thisplot.y_propname||'y',
            values: [], // raw things we get, incoming list
            datapairs: {} // indexed array of [x]->y, chart managed
        });
    }

    console.log("created new chart",this.conf.divid,this,"with",this.plots.length,"plots.");

    this.setup = function() {
        console.log(this.conf.divid,": setup()");

        this.divobj = document.getElementById(this.conf.divid);
        if (!this.divobj) { console.log("missing div:",this.conf.divid); return; }
        this.divobj.innerHTML = "<canvas id='"+this.conf.divid+"_canvas'></canvas>";

        this.canvasobj = document.getElementById(this.conf.divid+"_canvas");
        this.canvasctx = this.canvasobj.getContext("2d");

        this.canvasobj.setAttribute("width", this.conf.width);
        this.canvasobj.setAttribute("height", this.conf.height);
        this.canvasobj.setAttribute("style", this.conf.style);

        var thischart=this;

        this.canvasobj.addEventListener('mousemove', function(evt) {
            var rect = this.getBoundingClientRect();
            thischart.handle_mouseover(evt.clientX-rect.left, evt.clientY-rect.top);
        }, false);

        this.canvasobj.addEventListener('mousedown', function(evt) {
            var rect = this.getBoundingClientRect();
            thischart.handle_mouseclick(evt.clientX-rect.left, evt.clientY-rect.top);
        }, false);

        //this.calc_minmax();
        //this.draw_axes_grid(0,16,16);
        //this.render();
        //this.draw_legend();
    };

    this.find_plot_by_name = function(plotname) {
        var i;
        for (i in this.plots) {
            if (this.plots[i].name==plotname) return i;
        }
        console.log("failed to find plot",plotname,"!!");
        return null;
    };

    this.merge_new_data = function(plotname, newvals) {
        /*
          new data comes in as values of [{a:ts, b:val},...] - we iterate through
            it and set each x key and value into the plot's data arr, overwriting
            vals if extant
         */

        var i;
        var plot_ind=this.find_plot_by_name(plotname);
        if (!plot_ind) {
            console.log("plot index not found, cant merge data.");
            return;
        }

        var xprop=this.plots[plot_ind].x_propname;
        var yprop=this.plots[plot_ind].y_propname;
        var x,y,xmin,xmax,ymin,ymax;

        if ((!newvals)||(newvals.length==0)) {
            console.log("update attempted to",plotname,"with no data");
            return;
        }

        if (this.plots[plot_ind].min_x=="unset") {
            // if this is the first data update, the first pt sets starting
            //   pts for min max
            xmin=xmax=newvals[0][xprop];
            ymin=ymax=newvals[0][yprop];
            console.log("plot looks new, settings first dp MM");
        } else {
            // if mins and maxs have previously been written, persist
            xmin=this.plots[plot_ind].min_x;
            xmax=this.plots[plot_ind].max_x;
            ymin=this.plots[plot_ind].min_y;
            ymax=this.plots[plot_ind].max_y;
        }

        for (i in newvals) {
            x=parseFloat(newvals[i][xprop]);
            y=parseFloat(newvals[i][yprop]);
            //console.log("copying pt",x,y);

            // might as well do min max while were here
            if (x<xmin) xmin=x;
            if (y<ymin) ymin=y;
            if (x>xmax) xmax=x;
            if (y>ymax) ymax=y;

            this.plots[plot_ind].datapairs[x]=y;
        }

        // set min maxs - save calculated mms here even if there are presets,
        //   let render() take care of it
        this.plots[plot_ind].min_x=xmin;
        this.plots[plot_ind].max_x=xmax;
        this.plots[plot_ind].min_y=ymin;
        this.plots[plot_ind].max_y=ymax;

        if (this.conf.single_x_axis) {
            this.unify_x_mms();
        }

        if (this.plots[plot_ind].y_axis) {
            var this_axis=this.conf.y_axes[this.plots[plot_ind].y_axis];

            console.log("update on plot with custom y-axis!",this_axis);

            //if ((this_axis.p_minyi!=null)&&(this_axis.p_miny!="undefined")) {
            if (this_axis.p_miny!="undefined") {
                console.log("plot has a preset min_y of",this_axis.p_miny);

                this_axis.min_y=this_axis.p_miny;
            } else {
                // if the y min and max of this plot are outside whats
                // currently set for the axis, update it
                if (this.plots[plot_ind].min_y<this_axis.min_y)
                    this_axis.min_y=this.plots[plot_ind].min_y;

                console.log("axis miny is now",this_axis.min_y);
            }

            if ((this_axis.p_maxy)&&(this_axis.p_maxy!="undefined")) {
                console.log("yaxis maxy preset in use.");

                this_axis.max_y=this_axis.p_maxy;
            } else {
                console.log("checking tho, curr max",this_axis.max_y,
                            "plot max",this.plots[plot_ind].max_y);

                if (!this_axis.max_y) {
                    this_axis.max_y=this.plots[plot_ind].max_y;
                    console.log("axis didnt have a max_y, but now:",this_axis);
                } else if (this.plots[plot_ind].max_y>this_axis.max_y) {
                    this_axis.max_y=this.plots[plot_ind].max_y;
                    console.log("axis previously had a max_y but setting higher.");
                }
            }

            console.log("updated y axes:",this_axis);
        }
    };

    this.unify_x_mms = function() {
        // find the lowest and highest x values among all plots and set them
        var xmin,xmax,i;

        if (0==this.plots.length) return;

        xmin=this.plots[0].min_x;
        xmax=this.plots[0].max_x;

        for (i=1; i<this.plots.length; i++) {
            if (this.plots[i].min_x<xmin) xmin=this.plots[i].min_x;
            if (this.plots[i].max_x>xmax) xmax=this.plots[i].max_x;
        }

        this.single_x_min=xmin;
        this.single_x_max=xmax;
    };

    this.update = function (plotname, newvalues) {
        console.log(this.conf.divid, plotname, "being refreshed with new pts:", newvalues.length);

        this.merge_new_data(plotname, newvalues);

        //console.log("data merged, plotting:",this.plots[this.find_plot_by_name(plotname)]);

        this.canvasctx.clearRect(0,0,
                                  this.canvasobj.width, this.canvasobj.height);
        //this.calc_minmax();
        this.draw_axes_grid(0,8,8);
        this.render();
        this.draw_legend();
    };

    this.handle_mouseover = function(msx, msy) {
        //console.log("mousover on",this,"at",msx,msy);
    };

    this.handle_mouseclick = function(msx, msy) {
        ///console.log("mouse click on",this,"at",msx,msy);
    };

    this.x2chart = function(x, plotref) {
        //console.log("plotref:",plotref);
        //console.log("mms",plotref.min_x,plotref.max_x,plotref.min_y,plotref.max_y);

        var xmax_inuse, xmin_inuse;
        if (this.conf.single_x_axis) {
            xmin_inuse=this.single_x_min;
            xmax_inuse=this.single_x_max;
        } else {
            xmin_inuse=plotref.min_x;
            xmax_inuse=plotref.max_x;
        }
        return this.conf.xmargin+((x-xmin_inuse)/(xmax_inuse-xmin_inuse))*
            (this.conf.width-(2*this.conf.xmargin));
    };

    this.y2chart = function(y, plotref) {
        var ymax_inuse, ymin_inuse;

        if (plotref.y_axis) {
            // this plot has a custom y axis configured, find it
            // TODO: allow auto agg axes
            ymax_inuse=this.conf.y_axes[plotref.y_axis].max_y;
            ymin_inuse=this.conf.y_axes[plotref.y_axis].min_y;
        } else {
            ymax_inuse=plotref.max_y;
            ymin_inuse=plotref.min_y;
        }

        //console.log("y2chart y min max",ymin_inuse,ymax_inuse);

        return this.conf.ymargin+((1.0-(y-ymin_inuse)/(ymax_inuse-ymin_inuse)))*
            (this.conf.height-(2*this.conf.ymargin));
    };

    this.calc_minmaxelk = function() {
        var i,j;
        for (i in this.plots) {
            //console.log("looking at data",i,"of chart",this.conf.divid);

            var firstrun=true;
            var minx,maxx,miny,maxy,x,y;
            for (j in this.plots[i].values) {
                if (this.plots[i].type=='series') {
                    x=parseInt(j);
                    y=this.plots[i].values[j];
                } else if (this.plots[i].type=='xy') { // main focus of work
                    var xprop=this.conf.x_propname||'x';
                    var yprop=this.conf.y_propname||'y';

                    // TODO: move parsing to ds load
                    x=parseFloat(this.plots[i].values[j][xprop]);
                    y=parseFloat(this.plots[i].values[j][yprop]);
                } else {
                    console.log("unrecognized type in minmax:", this.plots[i].type);
                    return;
                }

                if (firstrun) {
                    firstrun = false;
                    minx=maxx=x;
                    miny=maxy=y;
                } else {
                    if (x<minx) minx=x;
                    if (x>maxx) maxx=x;
                    if (y<miny) miny=y;
                    if (y>maxy) maxy=y;
                }

            }

            // todo:
            if (this.plots[i].y_axis) { // use defined axis
                console.log("cust y axis enabled:",this.plots[i].y_axis);
                this.plots[i].p_miny=(this.conf.y_axes[this.plots[i].y_axis].p_miny);
                this.plots[i].p_maxy=(this.conf.y_axes[this.plots[i].y_axis].p_maxy);
            }

            console.log("calculated mmms",minx,maxx,miny,maxy);

            // p_ values set override calc
            this.plots[i].min_x=this.plots[i].p_minx||minx;
            this.plots[i].max_x=this.plots[i].p_maxx||maxx;
            this.plots[i].min_y=this.plots[i].p_miny||miny;
            this.plots[i].max_y=this.plots[i].p_maxy||maxy;

            console.log(this.conf.divid,this.plots[i].name,":: x -> (",this.plots[i].min_x,", ",this.plots[i].max_x,
                        ") y-> (",this.plots[i].min_y,", ",this.plots[i].max_y,")");
        }
    };

    this.render = function() {
        var i,j;

        for (i in this.plots) {
            var thisplot=this.plots[i];

            console.log("rendering plot",thisplot.name,"of",this.conf.divid,"ctx",this.canvasctx,
                        "color",thisplot.color);

            this.canvasctx.fillStyle=thisplot.color;

            var m=thisplot.color.match(/^#([0-9a-f]{6})$/i)[1];
            var rgb_color=[];
            if (m) {
                rgb_color=[
                    parseInt(m.substr(0,2),16),
                    parseInt(m.substr(2,2),16),
                    parseInt(m.substr(4,2),16)
                ];
            }

            var x,y,xval,yval;
            var ptsize=thisplot.ptsize||4; // TODO

            if (thisplot.y_line_at) {
                // TODO: move refactor kill me
                if (thisplot.linesize) {
                    this.canvasctx.beginPath();
                    this.canvasctx.lineWidth=thisplot.linesize;

                    if (rgb_color.length) {
                        var alpha=thisplot.lineopacity||0.5;
                        var colorstr='rgba('+rgb_color[0]+','+
                            rgb_color[1]+','+rgb_color[2]+','+alpha+')';
                        //console.log("colorstr:",colorstr);

                        this.canvasctx.strokeStyle=colorstr;
                        this.canvasctx.fillStyle=colorstr;
                    } else {
                        this.canvasctx.strokeStyle=thisplot.linecolor||thisplot.color;
                    }

                    this.canvasctx.moveTo(0,this.y2chart(thisplot.y_line_at,thisplot));
                    this.canvasctx.lineTo(this.conf.width,this.y2chart(thisplot.y_line_at,thisplot));
                    this.canvasctx.stroke();
                }

                // line across at nrmalized y
                // this.y2chart(yval, data);
            }

            var lastx=null,lasty=null;

            // TODO: change to just pairs from other ds
            //for (j in thisplot.values) {
            for (j in thisplot.datapairs) {
                if (thisplot.type=='series') {
                    xval=j;
                    yval=thisplot.values[j];
                } else if (thisplot.type=='xy') {
                    xval=j;
                    yval=thisplot.datapairs[xval];
                }

                x=this.x2chart(xval, thisplot);
                y=this.y2chart(yval, thisplot);

                // clear
                this.canvasctx.fillRect((x-(ptsize/2)), (y-(ptsize/2)),
                                        ptsize, ptsize);

				//console.log("thisplot.linesize is ",thisplot.linesize);

                if (thisplot.linesize) {
                    if (lastx!=null) {
                        this.canvasctx.beginPath();
                        this.canvasctx.lineWidth=thisplot.linesize;

						// TODO: color parsing etc should be outside of loop
						//     : line color needs plumbed through


                        if (rgb_color.length) {
                            //alpha=data.lineopacity||0.5;
                            var alpha=0.9;
							var colorstr='rgba('+rgb_color[0]+','+
                                rgb_color[1]+','+rgb_color[2]+','+alpha+')';
                            //console.log("line colorstr:",colorstr);

                            this.canvasctx.strokeStyle=colorstr;
                            this.canvasctx.fillStyle=colorstr;
                        } else {
							//console.log("default linestyle");
                            this.canvasctx.strokeStyle=thisplot.linecolor||thisplot.color;
                        }

                        this.canvasctx.moveTo(lastx,lasty);
                        this.canvasctx.lineTo(x,y);
                        this.canvasctx.stroke();
                    }
                }
                lastx=x;
                lasty=y;
            }
        }
    };

    this.draw_x_axes=function(axis_i, num_x) {
        var axis_index=axis_i||0;
        var axis_plot=this.plots[axis_index];
        var axis_linewidth=2;

        this.canvasctx.strokeStyle='rgba(64,64,64,0.7)'; // TODO:

        var i;
        console.log("axis data:",axis_plot.datapairs);

        var min_x_inuse, max_x_inuse;

        // TODO: move this somehwere reusible
        if (this.conf.single_x_axis) {
            console.log("single x axis in use from",this.single_x_min,
                        "to",this.single_x_max);

            min_x_inuse=this.single_x_min;
            max_x_inuse=this.single_x_max;
        } else {
            min_x_inuse=(axis_plot.p_minx)?axis_plot.p_minx:axis_plot.min_x;
            max_x_inuse=(axis_plot.p_maxx)?axis_plot.p_maxx:axis_plot.max_x;
        }

        var dx=Math.round((max_x_inuse-min_x_inuse)/num_x),x;
        console.log("min max x dx",min_x_inuse,max_x_inuse,dx);

        if (dx<0.01) dx=1; //TODO:

        console.log("minmax x",min_x_inuse,max_x_inuse);

        this.canvasctx.strokeStyle='rgba(196,196,196,0.7)'; // TODO:
        this.canvasctx.fillStyle='rgba(196,196,196,0.7)';
        this.canvasctx.font = "12px Courier New";

        // x/t verticals and labels

		//dx=4;

        for (i=min_x_inuse; i<max_x_inuse; i+=dx) {
            x=this.x2chart(i, axis_plot);

            console.log("x vertical at x",i,"plot x",x);

            this.canvasctx.beginPath();
            this.canvasctx.lineWidth=axis_linewidth;
            this.canvasctx.moveTo(x,(this.conf.ymargin||5)); // top
            this.canvasctx.lineTo(x,this.conf.height-(this.conf.ymargin||5)); // bottom
            this.canvasctx.stroke();

            /*
              // for date-based labels
              var d=new Date(1000*i);
            console.log("date:",d.toISOString());
            var xlbl=d.toISOString();
            xlbl=(i-min_x_inuse);*/

			var xlbl;

			console.log("got to here",this.conf.x_label);
            if (this.conf.x_label) {
				console.log("using non-timeseries x label.");

				xlbl=Math.round(i-min_x_inuse)+' '+this.conf.x_label;
			} else {
				if ((max_x_inuse-min_x_inuse)>120.0) { // minutes if larger than 2min
					xlbl=(i-min_x_inuse)/60.0;
					xlbl=Math.round(xlbl)+' min';
				} else {
					xlbl=(i-min_x_inuse);
					xlbl=Math.round(xlbl)+' sec';
				}
			}

            this.canvasctx.save();
            this.canvasctx.translate(x,this.canvasobj.height-10); // 50
            this.canvasctx.rotate(-Math.PI/8); // /4
            this.canvasctx.fillText(xlbl,15,0);
            this.canvasctx.restore();
        }

    };

    this.draw_axes_grid=function(axis_i,num_x,num_y) {
        this.draw_x_axes(axis_i,num_x);

        var axis_index=axis_i||0;
        var axis_plot=this.plots[axis_index];
        var axis_linewidth=2;
        var i;

        // y horizs
        var min_y_inuse=(axis_plot.p_miny)?axis_plot.p_miny:axis_plot.min_y;
        var max_y_inuse=(axis_plot.p_maxy)?axis_plot.p_maxy:axis_plot.max_y;

        var dy=Math.round((max_y_inuse-min_y_inuse)/num_y),y;
        console.log("min max y dy",min_y_inuse,max_y_inuse,y);

        //var dy=Math.round(axis_plot.max_y/num_y);

        if (dy<=0.0) dy=0.2; // TODO:
		console.log("dy is ", dy);

        for (i=0; i<axis_plot.max_y; i+=dy) {
            y=this.y2chart(i, axis_plot);
            //console.log("horiz at y",y);

            this.canvasctx.beginPath();
            this.canvasctx.lineWidth=axis_linewidth;
            this.canvasctx.moveTo(0,y);
            this.canvasctx.lineTo(this.conf.width,y);
            this.canvasctx.stroke();
        }

        this.canvasctx.strokeStyle='rgba(196,196,196,0.7)';
        this.canvasctx.fillStyle='rgba(196,196,196,0.7)';
        this.canvasctx.font = "16px Courier New";
        
		// side axis w labels
        for (i=0; i<axis_plot.max_y; i+=dy) {
            y=this.y2chart(i, axis_plot);
            //console.log("tick at y",y);

            this.canvasctx.beginPath();
            this.canvasctx.lineWidth=2*axis_linewidth;
            this.canvasctx.moveTo(0,y);
            this.canvasctx.lineTo(20,y);
            this.canvasctx.stroke();

            this.canvasctx.fillText(Math.round(10*i)/10,10,y-4);
            //tx.fillText(this.data[i].name,x+textoff_x,y+textoff_y);
        }
    };

    // draw (at least vertical) axis labels coresponding to given axis
    this.draw_axes_lbls=function(axis_i,num_x,num_y) {
        var axis_index=axis_i||0;
        var axis_plot=this.plot[axis_index];
        var axis_linewidth=2;

        // todo: colors for this axis, maybe new label or something

        this.canvasctx.strokeStyle='rgba(196,196,196,0.7)';
        this.canvasctx.fillStyle='rgba(196,196,196,0.7)';
        this.canvasctx.font = "16px Courier";
        
		console.log("here dy is ",dy);
		// side axis w labels
        for (i=0; i<axis_plot.max_y; i+=dy) {
            y=this.y2chart(i, axis_plot);
            //console.log("tick at y",Math.round(y));

            this.canvasctx.beginPath();
            this.canvasctx.lineWidth=2*axis_linewidth;
            this.canvasctx.moveTo(0,y);
            this.canvasctx.lineTo(20,y);
            this.canvasctx.stroke();

            this.canvasctx.fillText(Math.round(i),25,y+5);
            //tx.fillText(this.data[i].name,x+textoff_x,y+textoff_y);
        }
    };

    this.draw_legend=function() {
        // this.canvasctx.fillRect((x-(ptsize/2)), (y-(ptsize/2)), ptsize, ptsize);

        var x_posn=this.conf.legend_x;
        var y_posn=this.conf.legend_y;
        var x_margin=this.conf.legend_x_margin;
        var y_margin=this.conf.legend_y_margin;
        var ptsize=this.conf.legend_ptsize;
        var alpha=this.conf.legend_alpha;

        var textoff_x=15;
        var textoff_y=7;
        var legend_dy=20; //px
        var legend_curr_y=y_posn+y_margin+ptsize;
        var i,x,y;

        // draw background rect with some transperency-
        // - height is single height times plots
        // - width is longest text plus icon area

        this.canvasctx.font = "12px Courier";

        var max_len_px=0, this_len;
        for (i=0; i<this.plots.length; i++) {
            this_len=this.canvasctx.measureText(this.plots[i].name).width;
            if (this_len>max_len_px) max_len_px=this_len;
            //console.log("this len:",this_len);
        }

        this.canvasctx.fillStyle="rgba(64,64,64,"+alpha+")";
        this.canvasctx.fillRect(x_posn, y_posn, (2*x_margin)+20+max_len_px,
                                legend_dy*this.plots.length+(2*y_margin));

        for (i=0; i<this.plots.length; i++) {
            x=x_posn+x_margin+(ptsize/2);
            y=legend_curr_y;

            //console.log("legend line",i,":",this.data[i].name,"at",x,y,"in",this.data[i].color);

            this.canvasctx.fillStyle="#ffffff";
            this.canvasctx.fillText(this.plots[i].name,x+textoff_x,y+textoff_y);

            this.canvasctx.fillStyle=this.plots[i].color;
            this.canvasctx.fillRect(x, y, ptsize, ptsize);
            legend_curr_y+=legend_dy;
        }
    };
}
