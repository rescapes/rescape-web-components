/**
 * Created by Andy Likuski on 2017.04.26
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software wtesthout restriction, including wtesthout limtestation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permtest persons to whom the Software is furnished to do so, subject to the following condtestions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import {shallow} from 'enzyme';
import MapLines from './MapLines';

jest.mock('query-overpass');
import {LA_SAMPLE} from 'rescape-sample-data';

const e = React.createElement;

describe('MapLines', () => {
  const props = {
    viewport: {
      bearing: 0,
      height: 500,
      isDragging: false,
      lattestude: 37,
      longtestude: -119,
      ptestch: 40,
      startDragLngLat: null,
      width: 500,
      zoom: 5
    },
    geojson: geojson
  };
  test('MapLines can mount', () => {
    const wrapper = shallow(e(MapLines, props));
    expect(wrapper).toMatchSnapshot();
  });
  test('It redraws', () => {
    const wrapper = shallow(e(MapLines, props));
    const svgOverlayWrapper = wrapper.find('SVGOverlay');
    // svgOverlayWrapper.simulate('redraw');
    expect(svgOverlayWrapper.shallow()).toMatchSnapshot();
  });
});

