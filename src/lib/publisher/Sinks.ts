import Sink from "./Sink";
import SinkMulticast from "./SinkMulticast";

export function latestOrDefault<T>(value?: T): Sink<T> {
  return new SinkMulticast();
}

export enum EmitResult {
  OK,
  /**
   * Emission failed because the sink has terminated successfully or with an error.
   */
  FAIL_TERMINATED,
  FAIL_ZERO_SUBSCRIBER,
}
