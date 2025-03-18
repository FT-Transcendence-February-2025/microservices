const emailController = async (request, reply) => {
	const { email } = request.body;
	const changeResult = await emailService.changeEmail(request.user.id, email);
};