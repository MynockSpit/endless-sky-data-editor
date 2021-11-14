import { useReducer, useEffect } from 'react';
import _ from 'lodash';

export interface GenericObject {
  [key: string]: any;
}

export type UnsubscribeFn = () => void;

export interface Subscribers<Data> {
  [key: string]: {
    update: (data: Data, unsubscribe: UnsubscribeFn) => void;
    unsubscribe: UnsubscribeFn;
    previousData?: Data;
    path?: _.PropertyPath;
  };
}

export type SetDataUpdaterFn<Data> = (data: Data) => Data;
export type SetDataFn<Data> = ((
  updaterFunction: SetDataUpdaterFn<Data>
) => void) &
  ((data: Data) => void) &
  ((path: _.PropertyPath, updaterFunction: SetDataUpdaterFn<any>) => void) &
  ((path: _.PropertyPath, data: any) => void);
export type SaveSideEffectFn<Data> = (data: Data) => void;

export type UseDataFn<Data> = (() => [Data, SetDataFn<Data>]) &
  ((path: _.PropertyPath) => [any, SetDataFn<any>]);

export type GetDataFn<Data> = (() => Data) & ((path: _.PropertyPath) => any);

export type UnsubscribeFromDataFn = () => void;
export type SubscribeToDataFn = (
  triggerOnChange: () => void,
  path?: _.PropertyPath
) => UnsubscribeFromDataFn;

// type Data = any
// so, essentially this is a pub/sub store
// you make a new dataHook like this:
// const [useState, setState, getState, subscribeToState] = makeStateHook(imageLibrary)
// useState subscribes Functional Components to the state object
// setState is how you update state
// getState is a non-subscription method for getting state
// subscribeToState lets you run an arbitrary function when state changes; it returns an unsubscribe function
export function makeStateHook<Data extends GenericObject>(
  data?: Data
): [UseDataFn<Data>, SetDataFn<Data>, GetDataFn<Data>, SubscribeToDataFn] {
  let subscriberId = 0;
  const subscribers: Subscribers<Data> = {};

  // make sure data is defaulted to an object
  // doing it here so that we can ignore typescript's BS in an isolated spot
  if (data === undefined) {
    // @ts-ignore - seriously, buzz off TS
    data = {};
  }

  // iterate through the subscribers and force updates on all of them
  // pass them the unsubscribe function in case they want to stop listening dynamically
  function updateSubscribers() {
    Object.values(subscribers).forEach((subscriber) => {
      if (subscriber.path) {
        let currentData = _.get(data, subscriber.path);
        if (subscriber.previousData !== currentData) {
          subscriber.previousData = currentData;
          subscriber.update(_.cloneDeep(currentData), subscriber.unsubscribe);
        }
      } else {
        subscriber.update(_.cloneDeep(data), subscriber.unsubscribe);
      }
    });
  }

  // this hook is what lets us subscribe to updated (by registering a subscription
  // and providing a mechanism to force updates)
  const useData: UseDataFn<Data> = (path?: _.PropertyPath): [any, any] => {
    // this forceUpdate function needs to return a new value when it's run
    // originally, this was a fn that flopped between `true` and `false`, but that has issues when it's run twice in quick succession
    // instead, increment, but cycle after 100
    // that way, set would need to be fired 100 times to "update" to the same value
    const [, forceUpdate] = useReducer((c) => (c > 100 ? 0 : c+1), 0);

    // register this component's forceUpdate as a subscriber
    // subscribers get triggered by "updateAllHooks"
    useEffect(() => {
      return subscribeToData(() => {
        forceUpdate()
      }, path);
    }, [forceUpdate]);

    if (path) {
      return [
        _.get(data, path),
        (dataOrFn) => setData(path, dataOrFn as SetDataUpdaterFn<Data> | Data),
      ];
    } else {
      return [data, setData];
    }
  };

  // sets the new value of the data, then updates all hooks subscribed to the data
  function setData(
    pathOrDataOrDataFn: _.PropertyPath | SetDataUpdaterFn<Data> | Data,
    dataOrFn?: SetDataUpdaterFn<Data> | Data
  ) {
    if (arguments.length === 2) {
      // two arguments means that the first argument is a lodash-style Path and the second is either new data or an updater function
      let path = pathOrDataOrDataFn as _.PropertyPath;

      let nextData = _.cloneDeep(data); // prepare for new data

      let newData =
        typeof dataOrFn === 'function'
          ? (dataOrFn as SetDataUpdaterFn<any>)(_.get(nextData, path)) // either run the updater to get new data
          : dataOrFn; // or, if it's not an updater, use it as new data

      _.set(nextData, path, newData); // set it

      data = nextData;
    } else if (arguments.length === 1) {
      // one argument means that the first argument is either new data or an updater function

      data =
        typeof pathOrDataOrDataFn === 'function'
          ? (pathOrDataOrDataFn as SetDataUpdaterFn<Data>)(_.cloneDeep(data)) // either run the updater to get new data
          : (pathOrDataOrDataFn as Data); // or, if it's not an updater, use it as new data
    }

    updateSubscribers();
  }

  const getData: GetDataFn<Data> = (path?: _.PropertyPath) => {
    if (path) {
      return _.get(data, path);
    } else {
      return data;
    }
  };

  // provide a function that should be fired when the data is changed
  // returns a function that should be run when you want to unsubscribe
  const subscribeToData: SubscribeToDataFn = (triggerOnChange, path) => {
    const mySubscriberId = subscriberId;
    subscriberId += 1;

    // make an unsubscribe function, then store it
    function unsubscribe() {
      delete subscribers[mySubscriberId];
    }
    subscribers[mySubscriberId] = {
      update: triggerOnChange,
      unsubscribe,
      path,
      previousData: path ? _.get(data, path) : undefined,
    };

    // returning the unsubscribe fn to allow subscribers to store it for later use,
    // and it makes the useEffect (in useData) unsubscribe automatically on unmount
    return unsubscribe;
  };

  return [useData, setData, getData, subscribeToData];
}
