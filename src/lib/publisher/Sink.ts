import { Flux } from "./Flux";
import { EmitResult } from "./Sinks";

interface Sink<T> {
  asFlux(): Flux<T>;

  currentSubscriberCount(): number;

  emitComplete(): EmitResult;

  emitError(err: unknown): EmitResult;

  emitNext(value: T): EmitResult;
}

export default Sink;
