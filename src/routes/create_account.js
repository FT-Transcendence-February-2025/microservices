const createAccountRoute = {
  method: 'GET',
  url: '/create_account',
  schema: {
    querystring: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        displayName: { type: 'string' },
        password: { type: 'string' }
      } 
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'string' }
        }
      }
    }
  },
  handler: function (request, reply) {
    reply.send({ success: 'Registration successfull' })
  }
};

export default createAccountRoute;
