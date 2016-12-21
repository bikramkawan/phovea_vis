import {forTests, HeatMapImageRenderer} from '../src/heatmap';
import {parseMatrix} from 'phovea_d3/src/parser';
import * as d3 from 'd3';

describe('toScale', () => {
  it('handles negative and positive', () => {
    const value = {
      type: 'real',
      range: [-1, 1]
    };
    const domain = forTests.defaultDomain(value);
    const range = forTests.defaultColor(value);
    const scale = forTests.toScale(value).domain(domain).range(range);
    expect(scale(-1)).toEqual('#0000ff');
    expect(scale(0)).toEqual('#ffffff');
    expect(scale(1)).toEqual('#ff0000');
  });
  it('handles skewed data', () => {
    const value = {
      type: 'real',
      range: [-0.1, 10]
    };
    const domain = forTests.defaultDomain(value);
    const range = forTests.defaultColor(value);
    const scale = forTests.toScale(value).domain(domain).range(range);
    expect(scale(-0.1)).toEqual('#fcfcff');
    expect(scale(0)).toEqual('#ffffff');
    expect(scale(5)).toEqual('#ff8080');
    expect(scale(10)).toEqual('#ff0000');
  });
  it('handles positive', () => {
    const value = {
      type: 'real',
      range: [0, 1]
    };
    const domain = forTests.defaultDomain(value);
    const range = forTests.defaultColor(value);
    const scale = forTests.toScale(value).domain(domain).range(range);
    expect(scale(0)).toEqual('#ffffff');
    expect(scale(0.5)).toEqual('#ff8080'); // interpolation
    expect(scale(1)).toEqual('#ff0000');
  });
  it('handles negative', () => {
    const value = {
      type: 'real',
      range: [-1, 0]
    };
    const domain = forTests.defaultDomain(value);
    const range = forTests.defaultColor(value);
    const scale = forTests.toScale(value).domain(domain).range(range);
    expect(scale(-1)).toEqual('#0000ff');
    expect(scale(0)).toEqual('#ffffff');
  });
});

describe('HeatMapImageRenderer heatmapUrl', () => {
  it('handles negative and positive', () => {
    const render = new HeatMapImageRenderer();
    const data = parseMatrix([[-1,0],[0,1]]);
    const parent = d3.select(document.createElement('div'));
    const scale = [0, 1];
    const c = d3.scale.linear();
    const onready = null;
    render.build(data, parent, scale, c, onready);
    expect(render.image.src).toEqual('http://localhost:9876/null');
    // TODO: shouldn't the palette be in here?
    expect(parent[0][0].innerHTML).toEqual('<div class="phovea-heatmap"><canvas width="0" height="1" class="phovea-heatmap-data"></canvas><canvas width="0" height="1" class="phovea-heatmap-selection"></canvas></div>');
    // TODO: shouldn't it be an img tag?
  });
});
