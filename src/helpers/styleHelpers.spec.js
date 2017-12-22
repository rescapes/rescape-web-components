import {styleMultiplier, createScaledPropertyGetter, getClass} from './styleHelpers';
import {getClassAndStyle, getStyleObj} from 'helpers/styleHelpers';

describe('styles', () => {
  test('getClass', () => {
    expect(getClass('chicken', 'outsidePen')).toEqual('chicken-outside-pen');
  });
  test('getClassAndStyle', () => {
    const viewObj =  {
      chickenOutsidePen: {
        style: {
          border: 'coop'
        }
      }
    }
    expect(getClassAndStyle('chickenOutsidePen', viewObj)).toEqual({
      className: 'chicken-outside-pen',
      style: {
        border: 'coop'
      }
    });
    expect(getClassAndStyle('sheepGotoHeaven', viewObj)).toEqual({
      className: 'sheep-goto-heaven'
    });
  });
  test('getStyleObj', () => {
    const viewObj = {
      chickenOutsidePen: {
        style: {
          border: 'coop'
        }
      },
      sheepGoToHeaven: {}
    }
    expect(getStyleObj('chickenOutsidePen', viewObj)).toEqual({
      style: {
        border: 'coop'
      }
    });
    expect(getStyleObj('sheepGotoHeaven', viewObj)).toEqual({
    });
  });

  test('styleMultiplier', () => {
    expect(styleMultiplier(100, 0.25)).toEqual(25);
  });

  test('createScaledPropertyGetter', () => {
    expect(createScaledPropertyGetter([2, 4, 8], 'margin', 2)).toEqual({margin: 8});
    expect(() => createScaledPropertyGetter([2, 4, 8], 'margin', 'mayo')).toThrow();
    expect(() => createScaledPropertyGetter([2, 'tuna fish', 8], 'margin', 1)).toThrow();
  });
});
