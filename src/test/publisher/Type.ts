interface Type<T> extends Function {
  new (...args: any[]): T;
}

export default Type;
