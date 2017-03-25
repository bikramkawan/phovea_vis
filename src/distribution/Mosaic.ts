/**
 * Created by Samuel Gratzl on 26.01.2016.
 */

import '../style.scss';
import * as d3 from 'd3';
import {onDOMNodeRemoved, mixin} from 'phovea_core/src';
import {Range} from 'phovea_core/src/range';
import {AVisInstance, IVisInstance, assignVis, ITransform} from 'phovea_core/src/vis';
import {IHistAbleDataType, ICategoricalValueTypeDesc, INumberValueTypeDesc} from 'phovea_core/src/datatype';
import {IStratification} from 'phovea_core/src/stratification';
import {IHistogram} from 'phovea_core/src/math';
import {toSelectOperation} from 'phovea_core/src/idtype';
import bindTooltip from 'phovea_d3/src/tooltip';
import {createHistData, IDistributionOptions, IHistData} from './internal';


export interface IMosaicOptions extends IDistributionOptions {
  /**
   * @default 20
   */
  width?: number;

  /**
   * @default 200
   */
  duration?: number;

  /**
   * target height such that the mosaic will fit
   * @default null
   */
  heightTo?: number;

  /**
   * @default 10
   */
  initialScale?: number;

  /**
   * @default true
   */
  selectAble?: boolean;
}

export default class Mosaic extends AVisInstance implements IVisInstance {
  private readonly options: IMosaicOptions = {
    width: 20,
    initialScale: 10,
    duration: 200,
    heightTo: null,
    selectAble: true,
    scale: [1, 1],
    rotate: 0,
    sort: 'asc'
  };

  private readonly $node: d3.Selection<Mosaic>;

  private hist: IHistogram;
  private histData: IHistData[];
  private $labels : d3.Selection<any>;

  constructor(public readonly data: IHistAbleDataType<ICategoricalValueTypeDesc|INumberValueTypeDesc>|IStratification, parent: Element, options: IMosaicOptions = {}) {
    super();
    mixin(this.options, {
      scale: [1, this.options.initialScale]
    }, options);

    if (typeof this.options.heightTo === 'number') {
      this.options.scale[1] = this.options.heightTo / this.data.dim[0];
    }

    this.$node = this.build(d3.select(parent));
    this.$node.datum(this);
    assignVis(this.node, this);
  }

  get rawSize(): [number, number] {
    return [this.options.width, this.data.dim[0]];
  }

  get node() {
    return <Element>this.$node.node();
  }

  private build($parent: d3.Selection<any>) {
    const size = this.size,
      data = this.data,
      o = this.options;

    const $svg = $parent.append('svg').attr({
      width: size[0],
      height: size[1],
      'class': 'phovea-mosaic'
    });
    const $scale = $svg.append('g').attr('transform', 'scale(' + o.scale[0] + ',' + o.scale[1] + ')');
    const $data = $scale.append('g');
    const $highlight = $scale.append('g').style('pointer-events', 'none').classed('phovea-select-selected', true);

    const l = (event: any, type: string, selected: Range) => {
      if (!this.histData) {
        return;
      }
      const highlights = this.histData.map((entry, i) => {
        const s = entry.range.intersect(selected);
        return {
          i,
          acc: entry.acc,
          v: s.size()[0]
        };
      }).filter((entry) => entry.v > 0);
      const $m = $highlight.selectAll('rect').data(highlights);
      $m.enter().append('rect').attr('width', '100%').classed('phovea-select-selected', true);
      $m.attr({
        y: (d) => d.acc,
        height: (d) => d.v
      }).style('opacity', 0);
      $m.transition().duration(o.duration).style('opacity', 1);
      $m.exit().remove();
    };
    if (o.selectAble) {
      data.on('select', l);
      onDOMNodeRemoved(<Element>$data.node(), () => data.off('select', l));
    }

    const onClick = o.selectAble ? (d) => {
        data.select(0, d.range, toSelectOperation(<MouseEvent>d3.event));
      } : null;

    this.data.hist().then((hist) => {
      this.hist = hist;
      const histData = this.histData = createHistData(hist, data, this.options.sort);

      const $m = $data.selectAll('rect').data(histData);
      $m.enter().append('rect')
        .attr('width', '100%')
        .call(bindTooltip<IHistData>((d) => `${d.name} ${d.v} entries (${Math.round(d.ratio * 100)}%)`))
        .on('click', onClick);
      $m.attr({
        y: (d) => d.acc,
        height: (d) => d.v,
        fill: (d) => d.color
      });

      this.$labels = $svg.append('g');
      this.drawLabels();

      this.fire('built');
      this.markReady();
      if (o.selectAble) {
        data.selections().then((selected) => {
          l(null, 'selected', selected);
        });
      }
    });

    return $svg;
  }

  locateImpl(range: Range) {
    if (range.isAll || range.isNone) {
      const s = this.size;
      return Promise.resolve({x: 0, y: 0, w: s[0], h: s[1]});
    }
    return (<any>this.data).data(range).then((data) => {
      const ex = d3.extent(data, (value) => this.hist.binOf(value));
      const h0 = this.histData[ex[0]];
      const h1 = this.histData[ex[1]];
      const y = Math.min(h0.acc, h1.acc);
      const y2 = Math.max(h0.acc + h0.v, h1.acc + h1.v);
      const scale = this.options.scale;
      return Promise.resolve({
        x: 0,
        width: this.rawSize[0]*scale[0],
        height: (y2 - y)*scale[1],
        y: y*scale[1]
      });
    });
  }

  transform(scale?: [number, number], rotate?: number): ITransform {
    const bak = {
      scale: this.options.scale || [1, 1],
      rotate: this.options.rotate || 0
    };
    if (arguments.length === 0) {
      return bak;
    }
    const size = this.rawSize;
    this.$node.attr({
      width: size[0] * scale[0],
      height: size[1] * scale[1]
    }).style('transform', 'rotate(' + rotate + 'deg)');
    this.$node.select('g').attr('transform', 'scale(' + scale[0] + ',' + scale[1] + ')');

    const act = {scale, rotate};
    this.fire('transform', act, bak);
    this.options.scale = scale;
    this.options.rotate = rotate;
    this.drawLabels();
    return act;
  }

  private drawLabels() {
    const rowHeight = this.size[1] / this.data.dim[0];
    this.$labels.attr({
      'display' : (rowHeight >= 10) ? 'inline' : 'none',
      'font-size' : (3/4 * rowHeight) + 'px'
    });
    const $n = this.$labels.selectAll('text').data(this.histData);
    $n.enter().append('text');
    const xPadding = 3;
    $n.attr({
       'alignment-baseline': 'central',
       x: xPadding,
       y: (d,i) => (d.acc + d.v / 2) * this.options.scale[1],
    }).text((d) => (d.name));
  }
}

export function create(data: IHistAbleDataType<ICategoricalValueTypeDesc|INumberValueTypeDesc>|IStratification, parent: Element, options?: IMosaicOptions) {
  return new Mosaic(data, parent, options);
}
