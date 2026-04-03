import {Router, Response} from 'express'
import { Result } from '../models/Result'
import { User } from '../models/User'
import { AuthRequest, optionalAuth, protect } from '../middleware/auth';


const router = Router();

// POST /api/stats/result -- Save a test result
router.post('/result', optionalAuth, async(req: AuthRequest, res:Response):Promise<void> => {
    try {
        const {wpm, accuracy, errors, duration, mode, wordCount, guestId} = req.body;
        
        const result = await Result.create({
            userId: req.user?.id || undefined,
            guestId: !req.user ? guestId: undefined,
            wpm,
            accuracy,
            errors,
            duration,
            mode,
            wordCount,
        })

        // Update User Stats if Logged In

        if(req.user?.id) {
            const user = await User.findById(req.user.id);
            
            if(user){
                const allResults = await Result.find({ userId: req.user.id});
                const total = allResults.length;
                const avgWpm = Math.round(allResults.reduce((a, r)=> a+r.wpm,0)/total);
                const avgAccuracy = Math.round(allResults.reduce((a, r)=> a+r.accuracy,0)/total);
                const bestWpm = Math.max(...allResults.map((r)=> r.wpm));

                user.stats = {
                    totalTests: total,
                    totalTime: allResults.reduce((a,r)=> a+r.duration,0),
                    bestWpm,
                    avgWpm,
                    avgAccuracy,
                };
                await user.save();
            }
        };

        res.status(201).json({success: true, result})
    } catch (error) {
        res.status(500).json({ message : 'Failed to save Result', error: error})
    }
});

// GET /api/stats/history - Get Users History

router.get('/history', protect, async (req: AuthRequest, res: Response): Promise<void> =>{
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page -1 ) * limit;

        const [results, total] = await Promise.all ([
            Result.find({userId: req.user!.id})
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit),
            Result.countDocuments({userId : req.user!.id})
        ]);

        res.json({
            success: true,
            results,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch history', error: error})
    }
});


// GET /api/stats/leaderboard — Global leaderboard
router.get('/leaderboard', async (_req, res: Response): Promise<void> => {
  try {
    const results = await Result.find({ userId: { $exists: true } })
      .sort({ wpm: -1 })
      .limit(20)
      .populate('userId', 'username');

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: err });
  }
});

export default router;