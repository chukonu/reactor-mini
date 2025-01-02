/**
 * Methods of class Flux are defined separately here to avoid circular
 * dependency.
 */

import Consumer from "./Consumer";
import { Flux } from "./Flux";
import FluxArray from "./FluxArray";
import FluxPeek from "./FluxPeek";

/**
 * Static Methods
 */

declare module "./Flux" {
  namespace Flux {
    function fromArray<T>(array: T[]): Flux<T>;
  }
}

function fluxFromArray<T>(array: T[]): Flux<T> {
  return new FluxArray(array);
}

Flux.fromArray = fluxFromArray;

/**
 * Instance Methods
 */

declare module "./Flux" {
  interface Flux<T> {
    doOnNext(cb: Consumer<T>): Flux<T>;
  }
}

function doOnNext<T>(this: Flux<T>, cb: Consumer<T>): Flux<T> {
  return new FluxPeek(this, cb);
}

Flux.prototype.doOnNext = doOnNext;
