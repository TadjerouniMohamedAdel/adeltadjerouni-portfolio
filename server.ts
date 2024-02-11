import * as build from "@remix-run/dev/server-build";
import { createRequestHandler } from "@netlify/remix-adapter";
import { installGlobals } from '@remix-run/node';
import sourceMapSupport from 'source-map-support';
 
sourceMapSupport.install();
installGlobals();

const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
});

export default handler;

export const config = {path: "/*", preferStatic: true }
