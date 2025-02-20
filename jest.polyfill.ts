import { TextEncoder, TextDecoder } from 'util';
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

import fetch, { Request, Response } from 'node-fetch';
(global as any).fetch = fetch;
(global as any).Request = Request;
(global as any).Response = Response;
