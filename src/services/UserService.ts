import { Container } from "typedi";
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { LoggerService } from "../services/LoggerService";
import { FindOneOptions } from "typeorm";
import { PrivateInformationRepository } from "../repositories/PrivateInformationRepository";

@Service()
export class UserService {

    log = Container.get(LoggerService);

    constructor(@OrmRepository() private userRepository: UserRepository,
                @OrmRepository() private privateRepository: PrivateInformationRepository) {}

    public findByUsername(userName: string, options?: FindOneOptions): Promise<User | undefined> {
        return this.userRepository.findOne({
            userName
        }, options);
    }

    public findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({
            where: {
                private: {
                    email: email
                }
            },
            relations: ["private"]
        });
    }

    public findByPasswordToken(passwordToken: string, options?: FindOneOptions): Promise<User | undefined> {
        return this.userRepository.findOne({
            passwordToken
        }, options);
    }

    public findByConfirmToken(confirmToken: string, options?: FindOneOptions): Promise<User | undefined> {
        return this.userRepository.findOne({
            confirmToken
        }, options);
    }

    public async create(user: User): Promise<User> {
        this.log.info('Create a user');
        await this.privateRepository.save(user.private);
        return this.userRepository.save(user);
    }

    public async update(user: User): Promise<User> {
        this.log.info('Update a user');
        if (user.private !== undefined) {
            user.private = await this.privateRepository.save(user.private);
        }
        return this.userRepository.save(user);
    }

    public async delete(userID: string): Promise<void> {
        this.log.info('Delete a user');
        await this.userRepository.delete(userID);
        return;
    }

}