import Disposer from "./Disposer";
import Subscriber from "./Subscriber";

interface Publisher<T> {
  subscribe(s: Subscriber<T>): Disposer;
}

export default Publisher;
