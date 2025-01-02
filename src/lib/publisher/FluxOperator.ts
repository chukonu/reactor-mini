import { Flux } from "./Flux";

abstract class FluxOperator<I, O> extends Flux<I> {
  constructor(private readonly source: Flux<I>) {
    super();
  }
}

export default FluxOperator;
