const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://ec2-3-109-41-79.ap-south-1.compute.amazonaws.com:3001',
      changeOrigin: true,
      secure: false,
    })
  );
};
