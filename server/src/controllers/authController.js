const createAuthController = (authService) => ({
  async register(req, res) {
    const data = await authService.register(req.body);

    res.status(201).json({
      success: true,
      data
    });
  },

  async login(req, res) {
    const data = await authService.login(req.body);

    res.status(200).json({
      success: true,
      data
    });
  }
});

module.exports = createAuthController;
