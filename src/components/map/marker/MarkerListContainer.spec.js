/**
 * Created by Andy Likuski on 2017.02.06
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {mapStateToProps} from 'components/map/marker/MarkerListContainer';
import configureStore from 'redux-mock-store';

import {getCurrentConfig, privateConfig} from 'rescape-sample-data'
import initialState from 'initialState'
import {reqPathThrowing} from 'rescape-ramda'
import {activeUserSelectedRegionsSelector} from 'rescape-apollo';

const sampleConfig = getCurrentConfig(privateConfig);

describe('MarkerListContainer', () => {
    test('mapStateToProps flattens viewport props', () => {
      /*
      TODO Refactor to our component test format
        const store = mockStore(initialState(sampleConfig));
        const state = store.getState();

        const ownProps = {
            region: activeUserSelectedRegionsSelector(state)
        };

        expect(mapStateToProps(store.getState(), ownProps)).toMatchSnapshot();
        */
    });
});
