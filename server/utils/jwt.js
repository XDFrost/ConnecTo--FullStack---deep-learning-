import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const maxAge = 3 * 24 * 60 * 60 * 1000; 

const createToken = (email, userId) => {
    return jsonwebtoken.sign({email, userId}, process.env.JWT_KEY, {expiresIn: maxAge});
}

export default createToken;