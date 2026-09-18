interface Props<T> {
  data?: T | undefined;
  error?: string | undefined;
  statusCode: number;
}

export class BaseResponse<T = undefined> extends Response {
  constructor({ data, error, statusCode }: Props<T>) {
    super(JSON.stringify(data), {
      status: statusCode,
      ...(error !== undefined && { statusText: error }),
    });
  }
}
