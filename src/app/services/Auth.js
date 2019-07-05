import jwt from 'jsonwebtoken';
import User from 'app/models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import UserToken from "app/models/UserToken";

class Auth {

    ctx = null;
    user;
    minimalUser;
    payload;
    secondAttempt;
    _token;

    constructor(ctx) {
        this.ctx = ctx;
        this.secondAttempt = false;
    }

    async verify() {
        this.payload = jwt.verify(this.token, process.env.JWT_SECRET);
    }

    async refreshExpiredToken() {
        const decoded = jwt.decode(this.token);
        const tokenInDb = await UserToken.findById(decoded.id);
        if (!tokenInDb) {
            throw new Error('token not found');
        }
        await tokenInDb.delete();

        const user = await User.findById(decoded.sub);
        try {
            this._token = await user.generateToken();
            await this.verify();
        } catch (e) {
            throw new Error('expired token can not be refreshed');
        }
    }

    async logout() {
        const {id} = this.payload;
        const tokenInDb = await UserToken.findById(id);
        if (!tokenInDb) {
            throw new Error('token not found');
        }
        await tokenInDb.delete();
    }

    async loginById(id) {
        const user = await User.findById(id);
        if (user) {
            return await user.generateToken();
        }
        return null;
    }

    getUserId() {
        try {
            const {sub} = this.payload;
            return sub;
        } catch (e) {
            return null;
        }
    }

    async getUser() {
        if (!this.user) {
            const {sub} = this.payload;
            this.user = await User.findById(sub);
        }

        return this.user;
    }

    getMinimalUser() {
        if (!this.minimalUser) {
            const {sub} = this.payload;
            this.minimalUser = new User({_id: mongoose.Types.ObjectId(sub)});
        }

        return this.minimalUser;
    }

    get token() {
        if (!this._token) {
            if (this.ctx.request.query.token) {
                this._token = this.ctx.request.query.token;
            } else {
                this._token = this.ctx.request.header.authorization.replace(/^Bearer/g, '').trim();
            }

        }

        return this._token
    }

    async attemptLogin(email, password) {
        const user = await User.findOne({
            email,
        });

        if (user && bcrypt.compareSync(password, user.password.replace('$2y$', '$2b$'))) {
            this._token = await user.generateToken();
            this.user = user;
            this.minimalUser = user;
            return
        }
        throw new Error(`ایمیل یا کلمه عبور اشتباه است`);
    }

    async attemptRegister(email, password, other = {}) {
        const duplicate = await User.findOne({
            email
        });
        if (duplicate) {
            throw new Error(`ایمیل تکراری است`);
        }

        const user = new User({
            ...other,
            email,
            password: bcrypt.hashSync(password, 10),
        });
        await user.save();
        this._token = await user.generateToken();
        this.user = user;
        this.minimalUser = user;
    }
}

export default Auth;
