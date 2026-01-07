exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy and awake',
    timestamp: new Date().toISOString()
  });
};