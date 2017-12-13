/**
 * Created by Andy Likuski on 2016.05.26
 * Copyright (c) 2016 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import PropTypes from 'prop-types';
import region from 'components/region/RegionContainer';
import styles from './Current.style';
import React from 'react';
import {eMap} from 'helpers/componentHelpers';
import * as R from 'ramda';
import prettyFormat from 'pretty-format';

const [Div, Region] =
  eMap(['div', region]);

/**
 * Displays the Region of the current state and eventually a Region selector.
 * This might also be modified to display all available regions, perhaps on a continental map
 */
class Current extends React.Component {
  render() {
    return R.cond([
      [R.propEq('loading'), () => this.renderLoading()],
      [R.has('error'), error => this.renderError(error)],
      [R.has('data'), data => this.renderData(data)],
      [R.T, () => this.renderError(new Error("Expected loading, error, or data from Apollo wrapper, didn't get anything"))]
    ])(this.props);
  }

  renderLoading() {
    return Div();
  }

  renderError(error) {
    return Div();
  }

  renderData({region}) {
    return Div(
      {className: 'current'},
      Region({
          region,
          style: {
            width: this.props.style.width,
            height: this.props.style.height
          }
        },
        null
      )
    );
  }
}

const {
  number,
  shape
} = PropTypes;

/**
 * Expect the current region
 * @type {{region: *}}
 */
Current.propTypes = {
  style: shape({
    width: number.isRequired,
    height: number.isRequired
  })
};

export default Current;
