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

drawFrame(0);
d3.select('#slider')
    .on('input', function() {
        const frame = this.value;
        drawFrame(frame);
        d3.select('#timeLabel')
            .text(`Frame ${frame}`);
    });

let currentFrame = 0;
setInterval(() => {
    drawFrame(currentFrame);
    currentFrame = (currentFrame + 1) % 23;
    d3.select('#timeLabel')
        .text(`Frame ${currentFrame}`);
    d3.select('#slider')
        .attr('value', `${currentFrame}`)
}, 500);