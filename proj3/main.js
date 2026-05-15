import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const width = 1000;
const height = 700;

const svg = d3.select('svg');

const xScale = d3.scaleLinear()
    .domain([-0.151, 0.151])
    .range([0, width]);
const yScale = d3.scaleLinear()
    .domain([0.151, -0.151])
    .range([0, height]);

const color = d3.scaleSequential()
    .domain([16,30])
    .interpolator(d3.interpolateInferno);

let curFrame = 0;

//draw images function
function drawFrame(frameNum) {
    d3.json(`data/frame_${frameNum}.json`)
        .then(data => {
            const time = data[0].time;
            const date = new Date(time);
            const hms = time.substring(time.indexOf('T') + 1, time.indexOf('.'))
            const time_txt = date.toDateString() + ` ${hms}`
            //want day abr, day # month abbr year time GMT
            d3.select('#timeDisplay')
                .text(time_txt)
            const cells = svg.selectAll('.cell').data(data);
            cells.enter()
                .append('circle')
                .attr('class', 'cell')
                .merge(cells)
                .attr('cx', d => xScale(d.x))
                .attr('cy', d => yScale(d.y))
                .attr('r', 2)
                .attr('fill', d => color(d.temp));
            cells.exit().remove();
        });
}
//initial image rendering
drawFrame(0);
d3.select('#slider')
    .on('input', function() {
        curFrame = +this.value;
        drawFrame(curFrame);
        d3.select('#timeLabel')
            .text(`Frame ${curFrame}`);
    });

//auto cycle
let running = false;
let myInt = null;
d3.select('#cycle_button')
    .on('click', function() {
        if(!running) {
            myInt = setInterval(() => {
                curFrame = (curFrame + 1) % 71;
                drawFrame(curFrame);
                d3.select('#timeLabel')
                    .text(`Frame ${curFrame}`);
                d3.select('#slider')
                    .property('value', `${curFrame}`)
                }, 1000);
        } else {
            clearInterval(myInt);
        }
        running = !running;
    });

//legend

const legendWidth = 300;
const legendHeight = 20;

const legendSvg = d3.select('#legend')
    .append('svg')
    .attr('width', legendWidth + 60)
    .attr('height', 60)

const defs = legendSvg.append('defs');
const gradient = defs.append('linearGradient')
    .attr('id', 'temp-gradient');

gradient.selectAll('stop')
    .data(d3.range(0, 1.01, 0.1))
    .enter()
    .append('stop')
    .attr('offset', d => `${d*100}%`)
    .attr('stop-color', d =>
        color(16 + d*(30-16))
    );

legendSvg.append('rect')
    .attr('x', 30)
    .attr('y', 10)
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .style('fill', 'url(#temp-gradient)')

legendSvg.append('text')
    .attr('x', 30)
    .attr('y', 45)
    .attr('fill', 'white')
    .style('font-size', '14px')
    .text('16°C');

legendSvg.append('text')
    .attr('x', legendWidth + 10)
    .attr('y', 45)
    .attr('fill', 'white')
    .style('font-size', '14px')
    .text('30°C');