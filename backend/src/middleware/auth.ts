import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { User } from "../models/User";


export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
    };
}

// Extract Token

export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) : Promise<void> =>{
    let token : string | undefined;

    if(req.headers.authorization?.startsWith('Bearer ')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        res.status(401).json({message: 'Not Authorized - No token Provided'})
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
        }

        const user = await User.findById(decoded.id).select('-password');

        if(!user){
            res.status(401).json({message: 'User does not exist!'})
            return;
        }

        req.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
        }
        next();
    } catch (error) {
        res.status(401).json({message: 'Invalid token or expired token!'});
    }
};

export const optionalAuth = async(
    req: AuthRequest,
    _res: Response,
    next: NextFunction,
) : Promise<void> =>{
    let token : string | undefined;

    if(req.headers.authorization?.startsWith('Bearer ')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(token){
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {id: string};
            const user = await User.findById(decoded.id).select('-password');

            if(user){
                req.user = {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                };
            }
        } catch (error) {
            
        }
    }

    next();
}