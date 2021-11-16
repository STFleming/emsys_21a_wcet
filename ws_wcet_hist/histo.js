// A histogram library for showing the WCET
//
// author: stf

class histo{

        constructor(svg, colour, numBins, minBin, maxBin, x, y, name) {
                // hard coded parameters
                this.binWidth = 2;
                this.binSpace = 1;
                this.maxHeight = 250; // the maximum allowable height of the histogram
                this.alpha = 0.95;

                this.colour = colour;

                this.svg = svg;
                this.numBins = numBins;
                this.minBin = minBin;
                this.maxBin = maxBin;
                this.x = x;
                this.y = y;
                this.name = name;

                // derived variables
                this.binSize = (maxBin - minBin)/numBins;

                // setup the bins
                this.bins = [ ];
                this.bins_staging = [ ]; // stage the values before exponential moving average
                for(var i =0; i<this.numBins; i++) {
                        this.bins[i] = 0;
                        this.bins_staging[i] = 0;
                }

                // for tracking the cumulative total in the bins
                this.total_samples = 0;
                this.cumulative_bins = [ ]

                this.clearDrawing(); // clear any currently drawn bins
                this.drawTitle(); // draw the title for this hist
                this.drawZoomOut(); // Zoom out button
                this.drawZoomIn(); // Zoom out button
                this.draw();
        }

        // Creates the cumulative totals bins
        cumulativeTotalBinCalc() {
                this.total_sample = 0;
                for(var i=0; i<this.numBins; i++) {
                        this.total_samples += this.bins[i];
                        this.cumulative_bins[i] = this.total_samples;
                }
        }

        // Get percentile bin -- returns the bin index for a given percentile with the
        // current data
        getPercentileBin(percentile) {
                var target_val = percentile*this.total_samples;
                for(var i=0; i<this.numBins; i++) {
                        if(this.cumulative_bins[i] > target_val)
                                return i-1;
                }
        }

        // Gets the value at a bin index
        binVal(idx) {
                return this.minBin + idx*this.binSize;
        }

        // gets the x pos of a bin index
        binPos(idx) {
                return this.x + idx*(this.binWidth + this.binSpace);
        }

        // Draws a dashed line at the percentile point
        drawPercentile(percentile, offset=0) {
                var idx = this.getPercentileBin(percentile);
                var label = (percentile*100).toFixed(2) + "% = " + this.binVal(idx).toFixed(2) + " us";
                if(idx == (this.numBins - 2)){
                        label = (percentile*100).toFixed(2) + "% >= " + this.binVal(idx).toFixed(2) + " us";
                }
                if(!Number.isNaN(this.binVal(idx)))
                        this.drawInfo(label, this.binPos(idx), 25 + offset);
        }

        // Add an info line
        drawInfo(text, x, offset=5) {
                // Draw the vertical line                
                this.svg.append("line")
                        .attr("id", this.name+"_histbin")
                        .attr("x1", x)
                        .attr("y1", this.y + this.maxHeight + 15 + offset)
                        .attr("x2", x)
                        .attr("y2", this.y)
                        .attr("stroke-width", 1)
                        .attr("stroke", this.colour.highlight)
                        .attr("stroke-dasharray", ("3,3"));

                this.svg.append("text")
                        .attr("id", this.name+"_histbin")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "12px")
                        .attr("fill", this.colour.highlight)
                        .attr("x", x - 10)
                        .attr("y", this.y + this.maxHeight + 30 + offset)
                        .text(text);
        }

        // Draw Title
        drawTitle() {
                this.svg.append("text")
                        .attr("id", this.name+"_title")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "24px")
                        .attr("fill", this.colour.base)
                        .attr("x", this.x)
                        .attr("y", this.y - 20)
                        .text(this.name);
        }

        // draws a button that can increase the maximum and (zoom) out 
        drawZoomOut(){
               var that = this;
               this.svg.append("text")
                       .attr("id", this.name+"_zoomout")
                       .attr("font-family", "sans-serif")
                       .attr("font-size", "36px")
                       .attr("fill", this.colour.base)
                       .attr("x", this.x  + this.numBins*(this.binWidth + this.binSpace) + 30)
                       .attr("y", this.y)
                       .on("mouseover", function() { 
                               d3.select("#"+that.name+"_zoomout").attr("fill", that.colour.highlight);
                       })
                       .on("mouseout", function() {
                               d3.select("#"+that.name+"_zoomout").attr("fill", that.colour.base); 
                       })
                       .on("click", function() {
                               that.incMax(that);
                       })
                       .text("-");
        }

        clear() {
                this.total_samples = 0;
                for(var i=0; i<this.numBins; i++) {
                        this.bins[i] = 0;
                        this.cumulative_bins[i] = 0;
                }
        }

        incMax(cur){
                cur.maxBin = cur.maxBin + 25.0;
                cur.binSize = (cur.maxBin - cur.minBin)/cur.numBins;
                cur.clear();
                console.log("Incrementing the max max:" + this.maxBin);
        }

        decMax(cur){
                cur.maxBin = cur.maxBin - 25.0;
                cur.binSize = (cur.maxBin - cur.minBin)/cur.numBins;
                cur.clear();
                console.log("Decrementing the max max:" + this.minBin);
        }

        drawZoomIn(){
               var that = this;
               this.svg.append("text")
                       .attr("id", this.name+"_zoomin")
                       .attr("font-family", "sans-serif")
                       .attr("font-size", "36px")
                       .attr("fill", this.colour.base)
                       .attr("x", this.x  + this.numBins*(this.binWidth + this.binSpace) + 30)
                       .attr("y", this.y + 50)
                       .on("mouseover", function() { 
                               d3.select("#"+that.name+"_zoomin").attr("fill", that.colour.highlight);
                       })
                       .on("mouseout", function() {
                               d3.select("#"+that.name+"_zoomin").attr("fill", that.colour.base); 
                       })
                       .on("click", function() {
                               that.decMax(that);
                       })
                       .text("+");
        }

        // Applies an exponential moving average (called once we want to draw)
        ema(){
                for(var i=0; i<this.numBins; i++) {
                        this.bins[i] = (this.bins[i] + this.bins_staging[i])*this.alpha + (this.alpha - 1.0)*this.bins[i];
                }
        }

        // Draws the histogram from the current data stored
        draw() {
                this.clearDrawing();
                this.cumulativeTotalBinCalc();

                this.ema(); // apply all the values set to be staged in an EMA fashion
                this.clearStaging(); // clear all the values in the staging area

                // scale
                var maxv = this.maxVal();
                var hist_linear_scale = d3.scaleLinear().domain([0, maxv]).range([0,this.maxHeight]);

                for(var i=0; i < this.numBins; i++) {
                    var dbins = this.svg.append("rect")
                        .attr("id", this.name+"_histbin")
                        .attr("x", this.x + i*(this.binWidth + this.binSpace))
                        .attr("y", this.y + this.maxHeight - hist_linear_scale(this.bins[i]))
                        .attr("fill", this.colour.base)
                        .attr("width", this.binWidth)
                        .attr("height", hist_linear_scale(this.bins[i]));
                }

                // info lines on the histogram
                this.drawInfo(this.minBin + " us", this.x);
                this.drawInfo(" >= "+this.maxBin + " us", this.x + this.numBins*(this.binWidth + this.binSpace));

                // Percentiles
                this.drawPercentile(0.5);
                this.drawPercentile(0.75, 15);
                this.drawPercentile(0.99, 30);
                this.drawPercentile(0.9999, 45);

        }

        // deletes all the histogram bins shown rendered on the display
        clearDrawing() { d3.selectAll("#"+this.name+"_histbin").remove(); this.total_samples = 0; }

        // Max val -- returns the value in the largest bin
        maxVal() { 
                var max = 0;
                for(var i=0; i<this.numBins; i++) {
                        if(this.bins[i] > max)
                                max = this.bins[i];
                }
                return max;
        }

        // clear staging area
        clearStaging(){
                for(var i = 0; i<this.numBins; i++) {
                        this.bins_staging[i] = 0;
                }
        }

        addItem(item){
                // convert the item to a floating point number
                var val = parseFloat(item);

                // determine which bin it should be in and increment
                if(val > this.minBin) {
                    var shifted = val - this.minBin;
                    var divided = shifted / this.binSize;
                    var rounded = Math.floor(divided);
                    if(rounded >= this.numBins){
                        this.bins_staging[this.numBins-1] = this.bins_staging[this.numBins-1] + 1;
                    } else {
                        this.bins_staging[rounded] = this.bins_staging[rounded] + 1;
                    }
                } else {
                        this.bins_staging[0] = this.bins_staging[0] + 1;
                }
                
        }

}
