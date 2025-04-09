import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

export default async function swaggerPlugin (fastify, _options) {
  fastify.register(fastifySwagger, {
    exposeRoute: true,
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Matchmaking service API',
        description: 'The matchmaking service api documentation',
        version: '1.0.0'
      },
      servers: [{
        url: 'http://localhost:3000'
        // description: 'Development server'
      }],
      tags: [
        { name: 'tournament', description: 'Tournament related end-points' },
        { name: 'match', description: 'Matchmaking related end-points' }
      ],
      externalDocs: {
        url: 'https://github.com/FT-Transcendence-February-2025/matchmaking-service',
        description: 'Find more info here'
      }
    }
  })

  fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, _request, _reply) => { return swaggerObject },
    transformSpecificationClone: true
  })
}
