/**
 * Created by Samuel Gratzl on 26.12.2016.
 */

import * as d3 from 'd3';
import {Range} from 'phovea_core/src/range';
import {IVisInstanceOptions} from 'phovea_core/src/vis';
import {
  VALUE_TYPE_CATEGORICAL,
  IHistAbleDataType, INumberValueTypeDesc, ICategoricalValueTypeDesc
} from 'phovea_core/src/datatype';
import {IStratification} from 'phovea_core/src/stratification';
import {ICatHistogram, IHistogram} from 'phovea_core/src/math';

export const SORT = {
  asc: 'asc',
  desc: 'desc'

};


export interface IHistData {
  readonly v: number;
  readonly acc: number;
  readonly ratio: number;
  readonly range: Range;
  readonly name: string;
  readonly color: string;
}

function createCategoricalHistData(hist: ICatHistogram, sort?: string): IHistData[] {
  const categories: any[] = hist.categories,
    cols = hist.colors || d3.scale.category10().range(),
    total = hist.validCount;
  let data = [],
    acc = 0;
  hist.forEach((b, i) => {
    data[i] = {
      v: b,
      acc: acc,
      ratio: b / total,
      range: hist.range(i),

      name: (typeof categories[i] === 'string') ? categories[i] : categories[i].name,
      color: (categories[i].color === undefined) ? cols[i] : categories[i].color
    };
    acc += b;
  });
  acc = 0;
  data.sort((a, b) => sort == 'asc' ? (a.v - b.v) : (b.v - a.v));
  data.forEach((d) => {
    d.acc = acc;
    acc += d.v;
  });

  return data;
}

function createNumericalHistData(hist: IHistogram, range: number[]): IHistData[] {
  const data = [],
    cols = d3.scale.linear<string, string>().domain(range).range(['#111111', '#999999']),
    total = hist.validCount,
    binWidth = (range[1] - range[0]) / hist.bins;
  let acc = 0;
  hist.forEach((b, i) => {
    data[i] = {
      v: b,
      acc: acc,
      ratio: b / total,
      range: hist.range(i),

      name: 'Bin ' + (i + 1) + ' (center: ' + d3.round((i + 0.5) * binWidth, 2) + ')',
      color: cols((i + 0.5) * binWidth)
    };
    acc += b;
  });
  return data;
}


export function createHistData(hist: IHistogram, data: IHistAbleDataType<ICategoricalValueTypeDesc|INumberValueTypeDesc>|IStratification, sort?: string) {
  if (data.desc.type === 'stratification') {
    return createCategoricalHistData(<ICatHistogram>hist, sort);
  }
  const d = (<IHistAbleDataType<ICategoricalValueTypeDesc|INumberValueTypeDesc>>data).valuetype;
  if (d.type === VALUE_TYPE_CATEGORICAL) {
    return createCategoricalHistData(<ICatHistogram>hist, sort);
  }
  return createNumericalHistData(hist, (<INumberValueTypeDesc>d).range);
}


export function resolveHistMax(hist: IHistogram, totalHeight: ITotalHeight): Promise<number> {
  const op: ((hist: IHistogram) => number|boolean) = typeof totalHeight === 'function' ? (<(hist: IHistogram) => number|boolean>totalHeight) : () => <number|boolean>totalHeight;
  return Promise.resolve<number|boolean>(op(hist)).then((r: number|boolean) => {
    if (r === true) {
      return hist.validCount;
    }
    if (r === false) {
      return hist.largestBin;
    }
    return <number>r;
  });
}

/**
 * Sort by alphabetical order of the object
 * @param sortCriteria
 * @param a
 * @param b
 */
export function sortObjectByName(sortCriteria, a, b) {
  const aVal = a.name.toUpperCase();
  const bVal = b.name.toUpperCase();

  if (sortCriteria === SORT.asc) {
    return (aVal.localeCompare(bVal));
                                
  } else if (sortCriteria === SORT.desc) {
    return (bVal.localeCompare(aVal));
  }
}


export declare type ITotalHeight = number|boolean|((hist: IHistogram) => number|boolean|Promise<number|boolean>);

export interface IDistributionOptions extends IVisInstanceOptions {
  /**
   * @default 'asc'
   */
  sort?: string;
}
