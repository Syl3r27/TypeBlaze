import { Router , Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';
import { error } from 'node:console';


const router = Router();

function signToken(id: string): string {
    return jwt.sign({ id }, process.env.JWT_SECRET as string,{
        expiresIn: '7d',
    })
}

// POST /api/auth/register

router.post('/register', async(req: Request, res: Response): Promise<void> =>{
    try {
        const {username, email , password} = req.body;

        if(!username || !email || !password){
            res.status(400).json({message: 'All fields are required'});
            return
        }

        const existingUser = await User.findOne({
            $or: [{email}, {username}],
        });

        if(existingUser){
            res.status(409).json({
                message:
                existingUser.email === email
                    ?'Email already registered'
                    :'Username already taken'
            });
            return;
        }

        const user = await User.create({username, email, password});
        const token = signToken(user._id.toString());

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                stats: user.stats,
            },
        });
    } catch (error) {
        res.status(500).json({message:'Registration Failed', error: error})
    }
});

// POST api/auth/login

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as {
        email: string;
        password: string;
    };

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password required' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if(!user) {
        res.status(401).json({ message: "Invalid Credentials"});
        return;
    }

    const isMatch = await user?.comparePassword(password);

    if(!isMatch) {
        res.status(401).json({message: 'Invalid Credentials'});
    }

    const token = signToken(user._id.toString());

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        stats: user.stats,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

export default router;