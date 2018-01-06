/**
 * Created by Andy Likuski on 2018.01.01
 * Copyright (c) 2018 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Box as box, Flex as flex, Image as image} from 'rebass';
import {composeViewsFromStruct, eMap, nameLookup, propsFor} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {throwing} from 'rescape-ramda';

const {reqStrPath} = throwing;
const [Div, Box, Flex, Image] = eMap(['div', box, flex, image]);

// Adapted from http://jxnblk.com/writing/posts/patterns-for-style-composition-in-react/

/**
 * Creates a full size Box
 * @param props
 * @constructor
 */
export const Grid = props =>
  Div(R.merge(props, {
      style: {
        display: 'inline-block',
        verticalAlign: 'top'
      },
    })
  );


/**
 * Creates a half-size Grid
 * @param props
 * @return {*}
 * @constructor
 */
export const Half = props =>
  Grid(R.merge(props, {
      width: 1 / 2
    })
  );

/**
 * Creates a third-size Grid
 * @param props
 * @return {*}
 * @constructor
 */
export const Third = props =>
  Grid(R.merge(props, {
      width: 1 / 3
    })
  );

/**
 * Creates a quarter-size Grid
 * @param props
 * @return {*}
 * @constructor
 */
export const Quarter = props =>
  Grid(R.merge(props, {
      width: 1 / 4
    })
  );

/**
 * Creates a flex Box with automatic sizing
 * @param props
 * @return {*}
 * @constructor
 */
export const FlexAuto = props =>
  Flex(R.merge(props, {
      flex: '1 1 auto'
    })
  );

export const Logo = props => {

  const c = nameLookup({
    logo: true,
    logoImage: true
  });

  const viewProps = propsFor(
    composeViewsFromStruct({
      props: {
        [c.logo]: {},
        [c.logoImage]: {
          src: reqStrPath('logoSrc')
        }
      },

      styles: {
        [c.logo]: props.style,
        [c.logoImage]: {
        }
      }
    }, props).views
  );

  return Box(viewProps(c.logo),
    Image(viewProps(c.logoImage))
  );
};
