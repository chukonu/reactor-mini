import { Flux } from "./Flux";
import { EmitResult } from "./Sinks";

interface Sink<T> {
  asFlux(): Flux<T>;

  emitComplete(): void;

  emitError(err: unknown): void;

  emitNext(value: T): EmitResult;
}

export default Sink;
