import * as express from 'express';
import { Container, Service } from 'typedi';
import { User } from '../models/User';
import { UserService } from "./UserService";
import { SessionRepository } from "../repositories/SessionRepository";
import { LoggerService } from "./LoggerService";
import { parse as cookieParse } from "cookie";

@Service()
export class AuthService {

    log = Container.get(LoggerService);

    public parseBearerAuthFromRequest(req: express.Request): { userName: string; signature: string } {
        const cookieHeader = req.header("Cookie");

        if (cookieHeader) {
            const parsedCookie = cookieParse(cookieHeader);
            if (Object.prototype.hasOwnProperty.call(parsedCookie, "bearer")) {
                const bearer = parsedCookie['bearer'];
                const decodedBase64 = Buffer.from(bearer, 'base64').toString('ascii');
                const userName = decodedBase64.split(':')[0];
                const signature = decodedBase64.split(':')[1];

                this.log.info('Credentials provided by the client');

                if (userName && signature) {
                    return { userName, signature };
                }
            }
        }

        const authorizationHeader = req.header("Authorization");
        if (typeof authorizationHeader == "string" && authorizationHeader.startsWith("Bearer ")) {
            const bearer = authorizationHeader.substring(7, authorizationHeader.length);

            try {
                const decodedBase64 = Buffer.from(bearer, 'base64').toString('ascii');
                const splitted = decodedBase64.split(':');
                const userName = splitted[0];
                const signature = splitted[1];

                if (userName && signature) {
                    return {userName, signature};
                }
            } catch (e) {
                this.log.info(e);
            }
        }

        this.log.info('No credentials provided by the client');
        return undefined;
    }

    public async validateUser(request: Request, username: string, signature: string): Promise<User> {
        const user = await Container.get(UserService).findByUsername(username, {
            "relations": ["private"]
        });

        if (user == null) {
            return undefined;
        }

        const sessions = await Container.get(SessionRepository).getSessions(user);
        if (sessions.filter(session => session.signature === signature).length > 0) {
           return user;
        }

        return undefined;
    }

}