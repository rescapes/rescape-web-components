/**
 * Created by Andy Likuski on 2018.01.14
 * Copyright (c) 2018 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {eMap} from 'rescape-helpers-component';
import Sankey, {c as cSankey} from 'components/map/sankey/Sankey';
import SankeyNodeLegend, {c} from 'components/map/sankey/SankeyNodeLegend';
import {apolloContainerTests} from 'rescape-helpers-component';
import {asyncParentPropsForSankey} from 'components/map/sankey/SankeyContainer.spec';
import {samplePropsMaker} from 'components/map/sankey/SankeyContainer';
import makeSchema from 'schema/schema';
import {sampleInitialState} from 'helpers/testHelpers';

const schema = makeSchema();

// Test this container
const [Container] = eMap([SankeyNodeLegend]);
// Find this React component
const componentName = 'SankeyNodeLegend';
// Find this class in the data renderer
const childClassDataName = c.sankeyNodeLegendBox;
// Find this class in the loading renderer
const childClassLoadingName = c.sankeyNodeLegendLoading;
// Find this class in the error renderer
const childClassErrorName = c.sankeyError;

// Use this to get properties from parent containers to test our container
// This returns a promise for consistency across tests. Some parent test props are async
const asyncParentPropsForSankeyNodeLegend = async () => {
  return asyncParentPropsForSankey().then(
    samplePropsMaker
  ).then(props => Sankey.views({data: props}).views[cSankey.sankeyLegendLink]
  );
};

describe('SankeyNodeLegend', () => apolloContainerTests({
    initialState: sampleInitialState,
    schema,
    Container,
    componentName,
    childClassDataName,
    childClassLoadingName,
    childClassErrorName,
    asyncParentProps: asyncParentPropsForSankeyNodeLegend
  })
);
