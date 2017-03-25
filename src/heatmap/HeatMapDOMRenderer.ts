/**
 * Created by Samuel Gratzl on 26.12.2016.
 */


import * as d3 from 'd3';
import {Range, cell} from 'phovea_core/src/range';
import {onDOMNodeRemoved} from 'phovea_core/src';
import {toSelectOperation, defaultSelectionType} from 'phovea_core/src/idtype';
import {IScale} from './internal';
import {IHeatMapRenderer, ESelectOption} from './IHeatMapRenderer';
import {IHeatMapAbleMatrix} from './HeatMap';

export default class HeatMapDOMRenderer implements IHeatMapRenderer {
  private color: IScale;

  constructor(private readonly selectAble: ESelectOption = ESelectOption.CELL) {

  }

  rescale($node: d3.Selection<any>, dim: number[], scale: number[]) {
    $node.attr({
      width: dim[1] * scale[0],
      height: dim[0] * scale[1]
    });
    $node.select('g').attr('transform', 'scale(' + scale[0] + ',' + scale[1] + ')');
  }

  recolor($node: d3.Selection<any>, data: IHeatMapAbleMatrix, color: IScale, scale: number[]) {
    this.color = color;
    $node.selectAll('rect').attr('fill', (d) => color(d));
  }

  redraw($node: d3.Selection<any>, scale: number[]) {
    $node.selectAll('rect').attr('fill', (d) => this.color(d));
  }

  build(data: IHeatMapAbleMatrix, $parent: d3.Selection<any>, scale: [number, number], c: IScale, onReady: () => void) {
    const dims = data.dim, that = this;
    const width = dims[1], height = dims[0];

    const $svg = $parent.append('svg').attr({
      width: width * scale[0],
      height: height * scale[1],
      'class': 'phovea-heatmap'
    });
    const $g = $svg.append('g').attr('transform', 'scale(' + scale[0] + ',' + scale[1] + ')');
    this.color = c;

    data.data().then((arr) => {
      const $rows = $g.selectAll('g').data(arr);
      $rows.enter().append('g').each(function (row, i) {
        const $cols = d3.select(this).selectAll('rect').data(row);
        const $colsEnter = $cols.enter().append('rect').attr({
          width: 1,
          height: 1,
          x: (d, j) => j,
          y: i,
          fill: (d) => c(d)
        });
        if (that.selectAble !== ESelectOption.NONE) {
          $colsEnter.on('click', (d, j) => {
            data.selectProduct([cell(i, j)], toSelectOperation(<MouseEvent>d3.event));
          });
        }
        $colsEnter.append('title').text(String);

      });
      onReady();
    });
    const l = function (event, type, selected: Range[]) {
      $g.selectAll('rect').classed('phovea-select-' + type, false);
      if (selected.length === 0) {
        return;
      }
      selected.forEach((cell) => {
        cell.product((indices) => {
          $g.select(`g:nth-child(${indices[0] + 1})`).select(`rect:nth-child(${indices[1] + 1})`).classed('phovea-select-' + type, true);
        }, data.dim);
      });
    };
    if (this.selectAble !== ESelectOption.NONE) {
      data.on('selectProduct', l);
      onDOMNodeRemoved(<Element>$g.node(), function () {
        data.off('selectProduct', l);
      });
      data.productSelections().then(function (selected) {
        l(null, defaultSelectionType, selected);
      });
    }

    return $svg;
  }
}
