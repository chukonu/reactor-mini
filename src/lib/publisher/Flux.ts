import Disposer from "./Disposer";
import Publisher from "./Publisher";
import Subscriber from "./Subscriber";

export abstract class Flux<T> implements Publisher<T> {
  abstract subscribe(s: Subscriber<T>): Disposer;
  abstract subscribe(): Disposer;
}
