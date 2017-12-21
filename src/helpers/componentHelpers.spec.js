/**
 * Created by Andy Likuski on 2017.10.17
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import * as R from 'ramda';
import {propLensEqual, mergeActionsForViews, makeTestPropsFunction, liftAndExtract} from './componentHelpers';
import {
  awaitMakeApolloTestPropsFunction,
  errorOrLoadingOrData, makeApolloTestPropsFunction, mergePropsForViews, mergeStylesIntoViews, nameLookup, propsFor
} from 'helpers/componentHelpers';

describe('componentHelpers', () => {
  test('propLensEqual', () => {
    const foul = {ball: 'left field'};
    const fair = {ball: 'left field'};
    const strike = {ball: 'catcher'};
    const lens = R.lensPath(['yuk', 'dum', 'boo', 'bum']);
    expect(propLensEqual(
      lens,
      {yuk: {dum: {boo: {bum: foul}}}},
      {yuk: {dum: {boo: {bum: fair}}}}
    )).toEqual(true);
    expect(propLensEqual(
      lens,
      {yuk: {dum: {boo: {bum: foul}}}},
      {yuk: {dum: {boo: {bum: strike}}}}
    )).toEqual(false);
  });

  test('mergeActionsForViews', () => {
    const mergeProps = mergeActionsForViews({aComponent: ['action1', 'action2'], bComponent: ['action2', 'action3']});
    const stateProps = {a: 1, views: {aComponent: {stuff: 1}, bComponent: {moreStuff: 2}}};
    const dispatchProps = {
      action1: R.identity,
      action2: R.identity,
      action3: R.identity
    };
    // mergeProps should merge stateProps and dispatchProps but copy the actions to stateProps.views according
    // to the mapping given to mergeActionsForViews
    expect(mergeProps(R.merge(stateProps, dispatchProps))).toEqual(
      R.merge({
        a: 1,
        views: {
          aComponent: {stuff: 1, action1: R.identity, action2: R.identity},
          bComponent: {moreStuff: 2, action2: R.identity, action3: R.identity}
        }
      }, dispatchProps)
    );
  });

  test('mergePropsForViews', () => {
    const mergeProps = mergePropsForViews({
      aComponent: {foo: 'foo', bar: 'store.bar'},
      bComponent: {bar: 'store.bar', zwar: 'zwar'}
    });
    const props = {
      a: 1,
      views: {aComponent: {stuff: 1}, bComponent: {moreStuff: 2}},
      foo: 1,
      store: {
        bar: 2
      },
      zwar: 3
    };

    // mergeProps should merge stateProps and dispatchProps but copy the actions to stateProps.views according
    // to the mapping given to mergeActionsForViews
    expect(mergeProps(props)).toEqual(
      {
        a: 1,
        views: {
          aComponent: {stuff: 1, foo: 1, bar: 2},
          bComponent: {moreStuff: 2, bar: 2, zwar: 3}
        },
        foo: 1,
        store: {
          bar: 2
        },
        zwar: 3
      }
    );
  });

  test('makeTestPropsFunction', () => {
    const sampleState = ({a: 1, views: {aComponent: {stuff: 1}, bComponent: {moreStuff: 2}}});
    const sampleOwnProps = {style: {width: 100}};
    const mapStateToProps = (state, ownProps) => R.merge(state, ownProps);
    const dispatchResults = {
      action1: R.identity,
      action2: R.identity,
      action3: R.identity
    };
    const mapDispatchToProps = (dispatch, ownProps) => dispatchResults;
    // given mapStateToProps, mapDispatchToProps, and mergeProps we get a function back
    // that then takes sample state and ownProps. The result is a merged object based on container methods
    // and sample da
    expect(makeTestPropsFunction(mapStateToProps, mapDispatchToProps)(sampleState, sampleOwnProps))
      .toEqual(
        R.merge({
          a: 1,
          style: {width: 100},
          views: {
            aComponent: {stuff: 1},
            bComponent: {moreStuff: 2}
          }
        }, dispatchResults)
      );
  });

  test('awaitMakeApolloTestPropsFunction', async () => {
    const sampleState = ({data: {regionId: 'oakland'}, views: {aComponent: {stuff: 1}, bComponent: {moreStuff: 2}}});
    const sampleOwnProps = {style: {width: 100}};
    const mapStateToProps = (state, ownProps) => R.merge(state, ownProps);
    const dispatchResults = {
      action1: R.identity,
      action2: R.identity,
      action3: R.identity
    };
    const mapDispatchToProps = (dispatch, ownProps) => dispatchResults;
    // given mapStateToProps, mapDispatchToProps, and mergeProps we get a function back
    // that then takes sample state and ownProps. The result is a merged object based on container methods
    // and sample data. Next apply the apollo query
    const queryObj = {
      query: `
          query region($regionId: String!) {
              store {
                  region(id: $regionId) {
                      id
                      name
                  },
              }
          }
      `,
      args: {
        options: ({data: {regionId}}) => ({
          variables: {
            regionId
          }
        })
      }
    };
    const value = await makeApolloTestPropsFunction(mapStateToProps, mapDispatchToProps, queryObj)(sampleState, sampleOwnProps).then(
      either => new Promise((resolve, reject) => either.map(resolve).leftMap(reject))
    );

    expect(value).toEqual(
      R.merge({
        // Expect this data came from Apollo
        data: {store: {region: {id: "oakland", name: "Oakland"}}},
        style: {width: 100},
        views: {
          aComponent: {stuff: 1},
          bComponent: {moreStuff: 2}
        }
      }, dispatchResults)
    );
  });

  test('liftAndExtract', () => {
    // Pretend R.identity is a component function
    expect(
      liftAndExtract(R.identity, {a: {my: 'props'}, b: {your: 'props'}})
    ).toEqual(
      [{my: 'props'}, {your: 'props'}]
    );
  });

  test('mergeStylesIntoViews', () => {
    const props = {
      style: {
        styleFromProps: 'blue'
      },
      views: {
        someProp: {foo: 1}
      }
    };
    const expected = {
      style: {
        styleFromProps: 'blue'
      },
      views: {
        someProp: {
          style: {
            styleFromProps: 'blue',
            color: 'red'
          },
          foo: 1
        }
      }
    };
    // Should work with styles as an object
    expect(
      mergeStylesIntoViews(
        {
          someProp: R.merge({
            color: 'red'
          }, props.style)
        },
        props
      )
    ).toEqual(expected);

    // Should work with styles as a function expecting props
    expect(
      mergeStylesIntoViews(
        p => ({
          someProp: R.merge({
            color: 'red'
          }, p.style)
        }),
        props
      )
    ).toEqual(expected);

  });

  test('nameLookup', () => {
    expect(nameLookup({toast: true, is: true, good: true})).toEqual(
      {toast: 'toast', is: 'is', good: 'good'}
    );
  });

  test('errorOrLoadingOrData', () => {
    const func = errorOrLoadingOrData(
      p => p.bad,
      p => p.okay,
      p => p.good
    );
    expect(func({data: {error: true}, bad: 'bad'})).toEqual('bad');
    expect(func({data: {loading: true}, okay: 'okay'})).toEqual('okay');
    expect(func({data: {store: true}, good: 'good'})).toEqual('good');
  });

  test('propsFor', () => {
    const viewProps = {
      fooProps: {
        style: {
          color: 'red'
        },
        bar: 1
      }
    };
    expect(propsFor('fooProps', viewProps)).toEqual(
      {
        className: 'foo-props',
        style: {
          color: 'red'
        },
        bar: 1
      }
    );
    expect(propsFor('bermudaProps', viewProps)).toEqual(
      {className: 'bermuda-props'}
    );
  });
});
