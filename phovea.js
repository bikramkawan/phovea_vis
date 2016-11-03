/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

//register all extensions in the registry following the given pattern
module.exports = function(registry) {
  //registry.push('extension-type', 'extension-id', function() { return System.import('./src/extension_impl'); }, {});
  registry.push('vis', 'axis', function() { return System.import('./src/axis'); }, {
  'name': 'Axis',
  'icon': 'axis_icon.svg',
  'scaling': 'height-only',
  'filter': [
   'vector',
   '(real|int)'
  ],
  'options': {
   'tickSize': {
    'type': 'int',
    'range': [
     1,
     null
    ],
    'default': 2
   },
   'orient': {
    'type': 'categorical',
    'categories': [
     'left',
     'right',
     'top',
     'bottom'
    ],
    'default': 'left'
   }
  }
 });

  registry.push('vis', 'barplot', function() { return System.import('./src/barplot'); }, {
  'name': 'Bar Plot',
  'icon': 'barplot_icon.png',
  'sizeDependsOnDataDimension': [
   false,
   true
  ],
  'filter': [
   'vector',
   '(real|int)'
  ]
 });

  registry.push('vis', 'table', function() { return System.import('./src/table'); }, {
  'name': 'Table',
  'filter': '(matrix|table|vector)',
  'sizeDependsOnDataDimension': true
 });

  registry.push('vis', 'scatterplot', function() { return System.import('./src/scatterplot'); }, {
  'name': 'ScatterPlot',
  'filter': 'matrix'
 });

  registry.push('vis', 'caleydo-vis-heatmap', function() { return System.import('./src/heatmap'); }, {
  'name': 'HeatMap',
  'icon': 'heatmap_icon.svg',
  'sizeDependsOnDataDimension': true,
  'filter': 'matrix'
 });

  registry.push('vis', 'caleydo-vis-heatmap1d', function() { return System.import('./src/heatmap'); }, {
  'name': 'HeatMap 1D',
  'icon': 'heatmap_icon.svg',
  'sizeDependsOnDataDimension': [
   false,
   true
  ],
  'scaling': 'height-only',
  'filter': 'vector'
 });

  registry.push('vis', 'caleydo-vis-kaplanmeier', function() { return System.import('./src/kaplanmeier'); }, {
  'name': 'Kaplanmeier Plot',
  'icon': 'kaplanmeier_icon.svg',
  'sizeDependsOnDataDimension': [
   false,
   false
  ],
  'scaling': 'aspect',
  'filter': [
   'vector',
   'int'
  ]
 });

  registry.push('vis', 'caleydo-vis-histogram', function() { return System.import('./src/distribution'); }, {
  'name': 'Histogram',
  'icon': 'distribution_histogram_icon.png',
  'filter': [
   '(vector|matrix|stratification)',
   '(categorical|real|int)'
  ]
 });

  registry.push('vis', 'caleydo-vis-mosaic', function() { return System.import('./src/distribution'); }, {
  'name': 'Mosaic',
  'factory': 'createMosaic',
  'icon': 'distribution_mosaic_icon.png',
  'sizeDependsOnDataDimension': [
   false,
   true
  ],
  'scaling': 'height-only',
  'filter': [
   '(vector|stratification)',
   'categorical'
  ]
 });

  registry.push('vis', 'caleydo-vis-pie', function() { return System.import('./src/distribution'); }, {
  'name': 'Pie',
  'factory': 'createPie',
  'icon': 'distribution_pie_icon.png',
  'scaling': 'aspect',
  'filter': [
   '(vector|stratification)',
   'categorical'
  ]
 });

  registry.push('vis', 'caleydo-vis-box', function() { return System.import('./src/box'); }, {
  'name': 'BoxPlot',
  'icon': 'box_icon.png',
  'scaling': 'aspect',
  'filter': [
   'vector',
   '(real|int)'
  ]
 });

  registry.push('vis', 'phovea_vis', function() { return System.import('./src/force_directed_graph'); }, {
  'name': 'Force Directed Graph',
  'filter': 'graph',
  'icon': 'force_directed_graph.svg',
  'sizeDependsOnDataDimension': [
   false,
   false
  ]
 });
};

