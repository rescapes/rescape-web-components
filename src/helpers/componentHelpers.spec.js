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
import {
  propLensEqual, mergeActionsForViews, makeTestPropsFunction, liftAndExtract,
  renderChoicepoint, joinComponents, loadingCompleteStatus, makeApolloTestPropsFunction, mergePropsForViews,
  mergeStylesIntoViews,
  nameLookup, propsFor,
  propsForSansClass, reqStrPath, strPath, itemizeProps, applyToIfFunction, keyWith, hasStrPath
} from 'helpers/componentHelpers';
import {throwing} from 'rescape-ramda';

const {reqPath} = throwing;

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


    const mergeProps = mergePropsForViews(props => ({
      aComponent: {foo: 1, bar: reqStrPath('data.store.bar')},
      bComponent: R.merge(
        {
          bar: reqStrPath('data.store.bar'),
          // say we need width in bComponent's props, not just its props.styles
          width: reqStrPath('views.bComponent.styles.width')
        },
        reqStrPath('data.someExtraProps', props)
      )
    }));
    const props = {
      views: {
        aComponent: {stuff: 1},
        bComponent: {moreStuff: 2, styles: {width: 10}}
      },
      data: {
        a: 1,
        store: {
          bar: 2
        },
        someExtraProps: {
          bat: 'can',
          man: 'pan'
        }
      }
    };

    // mergeProps should merge stateProps and dispatchProps but copy the actions to stateProps.views according
    // to the mapping given to mergeActionsForViews
    expect(mergeProps(props)).toEqual(
      {
        views: {
          aComponent: {stuff: 1, foo: 1, bar: 2},
          bComponent: R.merge(
            {moreStuff: 2, bar: 2, styles: {width: 10}, width: 10},
            props.data.someExtraProps
          )
        },
        data: {
          a: 1,
          store: {
            bar: 2
          },
          someExtraProps: {
            bat: 'can',
            man: 'pan'
          }
        }
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
        data: R.merge(
          loadingCompleteStatus, {
            store: {region: {id: "oakland", name: "Oakland"}},
            regionId: 'oakland'
          }),
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
        // Some existing property foo that we don't care about
        someView: {foo: 1}
      }
    };
    const expected = {
      style: {
        styleFromProps: 'blue'
      },
      views: {
        someView: {
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
          // If we want these styles in our view
          someView: {
            color: 'red',
            styleFromProps: 'blue'
          }
        },
        props
      )
    ).toEqual(expected);

    // Should work with styles as a function expecting props
    expect(
      mergeStylesIntoViews(
        p => ({
          // If we want these styles in our view, one of which is from props.style
          someView: R.merge({
            color: 'red'
          }, p.style)
        }),
        props
      )
    ).toEqual(expected);

    // Should work with styles as a function expecting props
    expect(
      mergeStylesIntoViews({
          someView: {
            style: {
              color: 'red',
              styleFromProps: 'blue'
            },
            className: 'foo bar'
          }
        },
        props
      )
    ).toEqual(R.set(R.lensPath(['views', 'someView', 'className']), 'foo bar', expected));

  });

  test('nameLookup', () => {
    expect(nameLookup({toast: true, is: true, good: true})).toEqual(
      {toast: 'toast', is: 'is', good: 'good'}
    );
  });

  test('renderChoicepoint', () => {
    const func = renderChoicepoint(
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

  test('propsForSansClass', () => {
    const viewProps = {
      fooProps: {
        style: {
          color: 'red'
        },
        bar: 1
      }
    };
    expect(propsForSansClass('fooProps', viewProps)).toEqual(
      {
        style: {
          color: 'red'
        },
        bar: 1
      }
    );
    expect(propsForSansClass('bermudaProps', viewProps)).toEqual(
      {}
    );
  });

  test('joinComponents', () => {
    expect(joinComponents(key => ({key, separate: 'me'}), [
      key => ({key, a: 1}),
      key => ({key, a: 2}),
      key => ({key, a: 3})
    ])).toEqual([
      {key: 0, a: 1},
      {key: 1, separate: 'me'},
      {key: 2, a: 2},
      {key: 3, separate: 'me'},
      {key: 4, a: 3}
    ]);
  });

  test('reqStrPath', () => {
    expect(reqStrPath('foo.bar.goo', {
      foo: {
        bar: {
          goo: 1
        }
      }
    })).toEqual(1);

    expect(() => reqStrPath('foo.bar.goo', {
      foo: {
        car: {
          goo: 1
        }
      }
    })).toThrow();
  });

  test('strPath', () => {
    expect(strPath('foo.bar.goo', {
      foo: {
        bar: {
          goo: 1
        }
      }
    })).toEqual(1);

    expect(strPath('foo.bar.goo', {
      foo: {
        car: {
          goo: 1
        }
      }
    })).toEqual(undefined);
  });

  test('itemizeProps', () => {
    expect(itemizeProps({
        name: 'props',
        a: 1,
        b: R.prop('cucumber'),
        c: item => R.add(2, item.c)
      },
      {
        name: 'item',
        cucumber: 'tasty',
        c: 5
      }
    )).toEqual(
      {
        name: 'props',
        a: 1,
        b: 'tasty',
        c: 7
      }
    );
  });

  test('applyToIfFunction', () => {
    expect(applyToIfFunction({kangaroo: 1}, R.prop('kangaroo'))).toEqual(1)
    expect(applyToIfFunction({kangaroo: 1}, 'rat')).toEqual('rat')
  })

  test('keyWith', () => {
    // With constant
    expect(keyWith('id', {
      id: 1,
      billy: 'low ground'
    })).toEqual({
      key: 1,
      id: 1,
      billy: 'low ground'
    })

    // With func that is resolvec later
    const billyFunc = (props, d) => 'low ground'
    expect(keyWith('billy', {
      id: 1,
      billy: billyFunc
    })).toEqual({
      key: billyFunc,
      id: 1,
      billy: billyFunc
    })
  })

  test('hasStrPath', () => {
    expect(hasStrPath('tan.khaki.pants', {tan: {khaki: {pants: false}}})).toEqual(true)
    expect(hasStrPath('tan.khaki.blazer', {tan: {khaki: {pants: false}}})).toEqual(false)
  })
});
