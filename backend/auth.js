import jwt from 'jsonwebtoken';

const JWT_SECRET = "nishantverma01042005";

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Authorization header is required' });
  const given = authHeader.split(' ');
  if( given.length !== 2 || given[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization format' });
  }
  const token = given[1];
  console.log('Received token:', token);

  if (!token) return res.status(401).json({ error: 'Token is required' });
 const decode =  jwt.verify(token, JWT_SECRET);
  if (!decode) { 
    return res.status(403).json({ error: 'Invalid token' });
  } 
  req.body.userId = decode.userId; // Attach user info to request object
  console.log('Decoded user:', decode);
  next(); // Proceed to the next middleware or route handler
}