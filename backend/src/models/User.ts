import mongoose, {Schema, Document} from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    createdAt:Date;
    stats: {
        totalTests: number;
        totalTime: number;
        bestWpm : number;
        avgWpm : number;
        avgAccuracy: number;
    };
    comparePassword(candidate: string):Promise<boolean>;
};

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 4,
            maxlength: 20,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required : true,
            minLength: 6,
        },
        stats : {
            totalTests: {type: Number, default: 0},
            totalTime: {type: Number, default: 0},
            bestWpm: {type: Number, default:0},
            avgWpm: {type: Number, default: 0},
            avgAccuracy : {type: Number, default: 0},
        },
    },
    {timestamps : true}
);


// Password ko hash krna save krne ke pehle taki kisi ko real pass pta na chale

UserSchema.pre<IUser>('save', async function (){
    if(!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
})

// Compare Password

UserSchema.methods.comparePassword = async function (candidate: string) : Promise<boolean>{
    return bcrypt.compare(candidate, this.password);
}

// Remove Password from JSON O/P
UserSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};


export const User = mongoose.model<IUser>('User', UserSchema);