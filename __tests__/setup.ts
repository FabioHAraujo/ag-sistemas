// Polyfills para ambiente de teste Next.js
import { ReadableStream, TransformStream } from 'node:stream/web'
import { TextDecoder, TextEncoder } from 'node:util'
import { fetch, Headers, Request, Response } from 'undici'

// Polyfill globals do Web
global.ReadableStream = ReadableStream as typeof globalThis.ReadableStream
global.TransformStream = TransformStream as typeof globalThis.TransformStream
// biome-ignore lint: necessário para testes
// @ts-ignore
global.TextEncoder = TextEncoder
// biome-ignore lint: necessário para testes
// @ts-ignore
global.TextDecoder = TextDecoder

// Polyfill fetch API
global.fetch = fetch as typeof globalThis.fetch
global.Headers = Headers as typeof globalThis.Headers
global.Request = Request as typeof globalThis.Request
global.Response = Response as typeof globalThis.Response
