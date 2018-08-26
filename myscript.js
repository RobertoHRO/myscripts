
function plot() {
    plotinfo=[];

    for (let index = 0; index < (arguments.length-1)/2; index++) {

        plotinfo[index] = {
            dat_filename:  arguments[2*index],
            name: arguments[2*index+1],       
            dat_dt: 0.001,
            dat_start: -1,
            dat_end: -1,
            dat_datatype: "float32",
            yaxis: "y" + (index+1),
            type: 'scatter'    };    
    }

    var HTMLelement = arguments[arguments.length-1];
    plotWrapper(HTMLelement, plotinfo);
}

async function plotWrapper(HTMLelement, plotinfo, layout) {
    //plotinfo = plotinfo.reverse();

    // ensure that no file is multiply loaded
    allFileNames = plotinfo.map(plotinfo => plotinfo.dat_filename);    
    var uniqueFileNames = [...new Set(allFileNames)];

    var DB = {};
    for (let index=0; index < uniqueFileNames.length; index++){
        DB[uniqueFileNames[index]] = await d3.buffer(uniqueFileNames[index]).then(data => new DataView(data));
    } 
    
    // loop over elements of plotinfo
    for (let index = 0; index < plotinfo.length; index++) {

        var propsOfData = Object.keys(plotinfo[index]);
        
        if (propsOfData.indexOf('dat_filename') != -1) {

            if (plotinfo[index].dat_start === -1) {
                var numBytes = DB[plotinfo[index].dat_filename].byteLength
                var startByte = 0;
            } else {
                var numBytes = plotinfo[index].dat_end - plotinfo[index].dat_start;           
                var startByte = plotinfo[index].dat_start;     
            }
            var numElements = numBytes/4;
            var vector_x = new Float32Array(numElements);            
            var vector_y = new Float32Array(numElements);
            
            for (var i=0, off=startByte; i<numElements; i++, off+=4) {
                if (i==0){
                    vector_x[i] = 0;
                }
                else {
                    vector_x[i] = vector_x[i-1]+plotinfo[index].dat_dt;
                }

                vector_y[i] = DB[plotinfo[index].dat_filename].getFloat32(off, false); 
            }

            plotinfo[index].x = vector_x;
            plotinfo[index].y = vector_y;

            delete plotinfo[index].dat_filename;
            delete plotinfo[index].dat_start;
            delete plotinfo[index].dat_end;
            delete plotinfo[index].dat_dt;
            delete plotinfo[index].dat_end;
            delete plotinfo[index].dat_datatype;
            //console.log(plotinfo[index].dat_filename);
        }

    }
    Plotly.newPlot(HTMLelement, plotinfo, layout);
}    

// construct layout   

function defaultLayout(plotinfo){
    
    var allAxisNames = plotinfo.map(plotinfo => plotinfo.yaxis);
    var uniqueAxisNames = [...new Set(allAxisNames)];
    numPlots = uniqueAxisNames.length;
    
    if (numPlots==1) {
        return {};
    }else{

        // subplot + padding + subplot + padding + subplot = 1
        // numPlots*subplotHeigth + (numPlots-1)*padding = 1
        // subplotHeigth = (1-(numPlots-1)*padding)/numPlots
        
        var padding = 0.05;
        var subplotHeigth = (1-(numPlots-1)*padding)/numPlots;
        var layout = {};
        
        for (let index = 0; index < numPlots; index++) {

            // //index 0
            // yStart = 0;     
            // yEnd = subplotHeigth;

            // // index 1
            // yStart = subplotHeigth+padding;
            // yend = 2*subplotHeigth+padding;

            // // index 2
            // yStart = 2*subplotHeigth+2*padding;
            // yend   = 3*subplotHeigth+2*padding;


            yStart =  index*subplotHeigth + index*padding;
            yEnd   = (index+1)*subplotHeigth + index*padding;

            // console.log('start - end:  ' + yStart + ' - ' + yEnd); 
            
            layout["yaxis" + (index+1)] = { domain: [yStart, yEnd], 
                                            title: "Toll",
                                            titlefont: {size: 18}};
            layout["xaxis" + (index+1)] = {anchor: "y" + (index+1)};
        }
    }

/*         var layout = {            
        legend: {traceorder: 'reversed'},
        xaxis1: {anchor: 'y1'},
        xaxis2: {anchor: 'y2'},
        xaxis3: {anchor: 'y3'},            
        yaxis1: {domain: [0, 0.266]},
        yaxis2: {domain: [0.366, 0.633]},
        yaxis3: {domain: [0.733, 1]}
        }; */

        layout["margin"] = {
            l: 70,
            r: 50,
            b: 50,
            t: 50,
            pad: 4
            };
            layout["paper_bgcolor"] = '#FFFFFF';
            layout["plot_bgcolor"]  = '#FFFFFF';
            layout["showlegend"]= false;
            
            
    return layout;
}