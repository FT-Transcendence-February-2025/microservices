const registrationService = (request, reply) => {
  const { email, displayName, password } = request.body;
  reply.send({ success: 'HELLO THERE' });
}

export default registrationService;
