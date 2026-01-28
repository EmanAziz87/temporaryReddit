import type { Options } from "swagger-jsdoc";
export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Express API",
      version: "1.0.0",
      description: "A documentation for my TypeScript Express project",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/docs/*.yaml"],
};
