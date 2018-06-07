/**
 * Created by Andy Likuski on 2018.05.28
 * Copyright (c) 2018 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {reqStrPathThrowing, strPath, reqStrPath} from 'rescape-ramda';
import {eMap, resolveSvgReact, styleArithmetic} from 'rescape-helpers-component';
import * as R from 'ramda';
import {Component} from 'react';

const [G, Text, TSpan] = eMap(['g', 'text', 'tspan']);
/**
 * Each Sankey Svg Node is an Svg G element which draws the shape's pointData and uses the given text to
 * label the shape. The text is split by newline character and thus renders each desired line vertically
 * @param node
 * @param shape
 * @param text
 * @param title
 * @return {*}
 * @constructor
 */
export default ({node, shape, text, title}) => {
  return G(node,
    resolveSvgReact(reqStrPathThrowing('pointData', shape), R.omit(['pointData'], shape)),
    Text(R.omit(['children'], text),
      // Split text by new line, adding index * 1.2em to the dy each line
      R.addIndex(R.map)((segment, index) => TSpan({
        key: index.toString(),
        x: text.x,
        dy: styleArithmetic(R.add, index * 1.2, text.dy)
      }, segment), R.split('\n', text.children))
    )
    //Title(title)
  );
};
