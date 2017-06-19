import Store from '../store/store';
import Router from './router';

export function isOpen() {
  Store.isOpen();
}

export function updateSearchStatus() {
  Store.updateSearchStatus();
}

export function isExpanded() {
  Store.isExpanded();
}

export function pager() {
  Router.pager();
}

export function updateSearchWords(name) {
  Store.updateSearchWords(name);
}
