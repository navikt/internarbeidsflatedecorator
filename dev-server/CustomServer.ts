import type { Serve, Server as BunServer } from 'bun';

import {
  Route,
  WebSocketRoute,
  BunRequest,
  Handler,
  Method,
  Part,
  BunServerWebsocket,
  BaseRoute,
  BunServerMetadata,
} from './types';
import { NotFoundResponse } from './responses/NotFoundResponse';
import { ErrorResponse } from './responses/ErrorResponse';
import { InternalServerErrorResponse } from './responses/InternalServerErrorResponse';
import { SuccessResponse } from './responses/SuccessResponse';

export class CustomServer {
  #routes: Route[] = [];
  #websocketRoutes: WebSocketRoute[] = [];
  #serverOptions: Serve.Options<BunServerMetadata>;
  #server?: BunServer<BunServerMetadata>;
  #corsAllowedOrigins?: string | undefined;
  #corsAllowedMethods?: string | undefined;

  constructor() {
    this.#serverOptions = {
      development: true,
      port: 4000,
      fetch: this.#fetch,
      websocket: {
        open: this.#openWS,
        close: this.#closeWS,
        message: this.#onMessage,
      },
    };
  }

  #addHeaders = (response: Response) => {
    if (this.#corsAllowedOrigins) {
      response.headers.append(
        'Access-Control-Allow-Origin',
        this.#corsAllowedOrigins,
      );
    }
    if (this.#corsAllowedMethods) {
      response.headers.append(
        'Access-Control-Allow-Methods',
        this.#corsAllowedMethods,
      );
    }
    response.headers.append('Access-Control-Allow-Headers', '*');
    return response;
  };

  #prepareResponse = (
    res: Response | Promise<Response>,
  ): Response | Promise<Response> => {
    if (res instanceof Promise) {
      return res
        .then((response) => this.#addHeaders(response))
        .catch((error) => {
          if (error instanceof ErrorResponse) {
            return error;
          } else {
            return new InternalServerErrorResponse(
              typeof error === 'string' ? error : 'Det skjedde en uventet feil',
            );
          }
        });
    }

    return this.#addHeaders(res);
  };

  #fetch = (
    req: Request,
    server: BunServer<BunServerMetadata>,
  ): Response | Promise<Response> | undefined => {
    const url = new URL(req.url);
    const pathName = url.pathname;
    console.log(`[${req.method}] ${pathName}`);

    if (req.method === 'OPTIONS') {
      return this.#addHeaders(new SuccessResponse());
    }
    for (const route of this.#routes) {
      if (req.method !== route.method) continue;
      const { isMatch, params } = this.#matchRoute(route.parts, pathName);
      if (isMatch) {
        const request = req as BunRequest;
        request.upgrade = (metadata) =>
          this.#upgradeConnection(route.path, req, metadata);
        if (params) request.params = params;
        request.haveParam = (key) => hasParam(key, params);
        const res = route.handler(request, server);
        return this.#prepareResponse(res);
      }
    }
    console.log(`Found no handler for ${req.method}: ${pathName}`);
    return new NotFoundResponse(
      `Found no handler matching this path: ${pathName}`,
    );
  };

  setAllowedOrigin = (allowedOrigin?: string) => {
    this.#corsAllowedOrigins = allowedOrigin;
  };

  setAllowedMethods = (...allowedMethods: Method[]) => {
    this.#corsAllowedMethods = allowedMethods.join(',');
  };

  get = (path: string, handler: Handler) => {
    this.#addRouteHandler('GET', path, handler);
  };

  post = (path: string, handler: Handler) => {
    this.#addRouteHandler('POST', path, handler);
  };

  put = (path: string, handler: Handler) => {
    this.#addRouteHandler('PUT', path, handler);
  };

  delete = (path: string, handler: Handler) => {
    this.#addRouteHandler('DELETE', path, handler);
  };

  #addRouteHandler = (method: Method, path: string, handler: Handler) => {
    const parts = this.#buildParts(path);
    this.#routes.push({
      handler,
      method,
      path,
      parts,
    });
  };

  #buildParts = (path: string): Part[] => {
    const parts = path.split('/');
    const res: Part[] = [];
    for (const part of parts) {
      const partToAdd: Part = {
        isParam: false,
        name: part,
      };
      if (part.startsWith(':')) {
        partToAdd.isParam = true;
        partToAdd.name = partToAdd.name.substring(1);
      }
      res.push(partToAdd);
    }
    return res;
  };

  #matchRoute = (
    routeParts: Route['parts'],
    requestPath: string,
  ): { isMatch: boolean; params: Record<string, string> } => {
    const requestParts = requestPath.split('/');

    if (requestParts.length !== routeParts.length) {
      return { isMatch: false, params: {} };
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
      const requestPart = requestParts[i];
      const routePart = routeParts[i];
      if (routePart.isParam) {
        params[routePart.name] = requestPart;
      } else if (routePart.name !== requestPart) {
        return { isMatch: false, params: {} };
      }
    }
    return { isMatch: true, params };
  };

  #openWS = (ws: BunServerWebsocket): void | Promise<void> => {
    for (const route of this.#websocketRoutes) {
      const { isMatch, params } = this.#matchRoute(route.parts, ws.data.path);
      if (isMatch) {
        return route.handler.open(ws, params);
      }
    }
  };

  #closeWS = (ws: BunServerWebsocket): void | Promise<void> => {
    for (const route of this.#websocketRoutes) {
      const { isMatch, params } = this.#matchRoute(route.parts, ws.data.path);
      if (isMatch) {
        return route.handler.close(ws, params);
      }
    }
  };

  #onMessage = (
    ws: BunServerWebsocket,
    message: string | Buffer,
  ): void | Promise<void> => {
    for (const route of this.#websocketRoutes) {
      const { isMatch, params } = this.#matchRoute(route.parts, ws.data.path);
      if (isMatch) {
        return route.handler.message(ws, message, params);
      }
    }
  };

  addWebSocketHandler = <T>(
    path: string,
    handler: WebSocketRoute<T>['handler'],
  ) => {
    const parts = this.#buildParts(path);
    this.#websocketRoutes.push({ path, parts, handler });
  };

  #upgradeConnection = <T>(
    path: string,
    request: Request,
    metadata?: T,
  ): boolean | undefined => {
    const parts = this.#buildParts(path);
    const pathname = new URL(request.url).pathname;
    const websocketRoute: BaseRoute = {
      parts,
      path: pathname,
    };

    return this.#server!.upgrade(request, {
      data: {
        metadata: metadata as Record<string, T> | undefined,
        ...websocketRoute,
      },
    });
  };

  listen = () => {
    this.#server = Bun.serve(this.#serverOptions);
    console.log('Listening on port', this.#server.port);
  };

  stop = () => {
    void this.#server?.stop();
  };
}

const hasParam = <T extends Record<string, string>>(
  key: string,
  params: T,
): params is T & { [K in typeof key]: string } => {
  return key in params && params[key] !== '';
};
