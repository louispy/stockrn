import _ from 'lodash';
import {SetStateAction} from 'react';

export const getDuplicateIndices = <T>(arr: T[], key: keyof T): number[] => {
  const seen: any = {};
  const result = new Set<number>();
  arr.forEach((item, i) => {
    if (seen[item[key]] !== undefined) {
      result.add(i);
      result.add(seen[item[key]]);
    }
    seen[item[key]] = i;
  });

  return Array.from(result.values());
};

export const setItem = <T>(
  arr: T[],
  dispatcher: React.Dispatch<SetStateAction<T[]>>,
  idx: number,
  field: keyof T | null,
  value: any,
) => {
  const items = [...arr];
  if (field) {
    items[idx] = _.assign(items[idx], {[field]: value});
  } else {
    items[idx] = value;
  }
  dispatcher(items);
};

export const deleteItem = <T>(
  arr: T[],
  dispatcher: React.Dispatch<SetStateAction<T[]>>,
  idx: number,
) => {
  if (arr.length <= 1) return;
  const items = [...arr];
  _.pullAt(items, idx);
  dispatcher(items);
};

export const addItem = <T>(
  arr: T[],
  dispatcher: React.Dispatch<SetStateAction<T[]>>,
  idx: number,
  value: T,
) => {
  const items = [...arr];
  items.splice(idx + 1, 0, value);
  dispatcher(items);
};
