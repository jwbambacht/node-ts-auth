import { Container } from "typedi";
import { EntityRepository, getRepository, Raw, Repository } from 'typeorm';
import { User } from '../models/User';
import { Session } from "../models/Session";
import { randomBytes } from "crypto";
import { LoggerService } from "../services/LoggerService";

@EntityRepository(Session)
export class SessionRepository extends Repository<Session> {
    log = Container.get(LoggerService);
    expireTime = Number(process.env.SESSION_EXPIRY_IN_MINUTES) * 60000;
    frontendTimeMargin = 10 * 1000;

    public async createSession(user: User): Promise<object> {
        const session = new Session();
        session.user = user;
        session.signature = randomBytes(32).toString("hex");
        session.createdAt = Date.now();

        await getRepository(Session).save(session);

        return {
            signature: session.signature,
            expiresAt: this.expireTime - this.frontendTimeMargin
        };
    }

    public async getSessions(user: User): Promise<Session[]> {
        return await getRepository(Session).find({
            where: {
                "user": user
            }
        });
    }

    public async cleanSessions(): Promise<void> {
        try {
            const repo = await getRepository(Session);
            const sessions = await repo.find({
                where: {
                    "createdAt": Raw(alias => `${Date.now().toString()} - ${alias} > ${this.expireTime}`)
                }
            });

            if (sessions.length > 0) {
                this.log.info(`Deleting ${sessions.length} stale session...`);
                for (const session of sessions) {
                    await repo.delete(session);
                }
            }
        } catch (e) {
            this.log.error(e);
        }
    }
}