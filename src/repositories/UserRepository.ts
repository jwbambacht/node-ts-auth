import { EntityRepository, Repository } from 'typeorm';
import { User } from '../models/User';
import { Container } from "typedi";
import { UserService } from "../services/UserService";
import { LoggerService } from "../services/LoggerService";

@EntityRepository(User)
export class UserRepository extends Repository<User>  {
    log = Container.get(LoggerService);

    async isPasswordTokenValid(token: string): Promise<boolean | string> {
        const user = await Container.get(UserService).findByPasswordToken(token);

        if (user === null) {
            return "Token is invalid";
        }

        if (Date.now() > user.passwordTokenExpiry) {
            user.clearPasswordToken();
            await Container.get(UserService).update(user);

            return "Token is expired";
        }

        if (user.passwordToken === token) {
            return true;
        }

        return "Token is invalid";
    }

    async isConfirmTokenValid(token: string): Promise<User | string> {
        const user = await Container.get(UserService).findByConfirmToken(token);

        if (user == null) {
            return "Token is invalid";
        }

        if (user.confirmToken === token) {
            return user;
        }

        return "Token is invalid";
    }
}