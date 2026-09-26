import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Authorization header is required' });
    
    const given = authHeader.split(' ');
    if (given.length !== 2 || given[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization format. Format must be Bearer <token>' });
    }
    
    const token = given[1];
    if (!token) return res.status(401).json({ error: 'Token is required' });

    const decode = jwt.verify(token, JWT_SECRET);
    if (!decode || !decode.userId) { 
      return res.status(403).json({ error: 'Invalid token payload' });
    } 

    req.userId = decode.userId;
    req.username = decode.username;
    if (req.body && typeof req.body === 'object') {
      req.body.userId = decode.userId;
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: err.message });
  }
}