const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // 1. Get token from the header
  const authHeader = req.header('Authorization');

  // Check if header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // 2. Extract the actual token string (removing 'Bearer ')
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Add user id from payload to request object
    req.userId = decoded.userId;
    
    // Move to the next function/route controller
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;