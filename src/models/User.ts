import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    Column,
    BeforeInsert,
    AfterLoad
} from 'typeorm';
import { PrivateInformation } from './PrivateInformation';
import { Exclude } from "class-transformer";
import * as bcrypt from 'bcryptjs';
import { bigIntToNumber } from "../util/PostGresUtil";
import { generateToken } from "../util/Util";

@Entity({name: "users"})
export class User {
    @PrimaryGeneratedColumn("uuid", {name: "user_id"})
    public userID: string;

    @Column({name: "username", unique: true})
    public userName: string;

    @Exclude()
    @Column()
    password: string;

    @Exclude()
    @Column({name: "password_token", nullable: true})
    passwordToken: string;

    @Exclude()
    @Column({name: "password_token_expiry", type: "bigint", nullable: true})
    passwordTokenExpiry: number

    @Column({name: "confirmed", nullable: false, default: false})
    confirmed: boolean;

    @Column({name: "confirm_token", nullable: true, default: generateToken()})
    confirmToken: string;

    @OneToOne(() => PrivateInformation, pi => pi.user, {
        eager: true
    })
    public private: PrivateInformation;

    @Column({name: "created_at", type: "bigint", default: Date.now()})
    public createdAt: number;

    @BeforeInsert()
    async hashPassword(password = this.password): Promise<void> {
        this.password = await bcrypt.hash(password, 10);
    }

    async comparePasswords(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }

    @AfterLoad()
    convertBalanceToNumber(): void {
        this.createdAt = bigIntToNumber(this.createdAt);
    }

    generatePasswordToken(): void {
        this.passwordToken = generateToken();
        this.passwordTokenExpiry = new Date(new Date().setHours(new Date().getHours() + 1)).getTime();
    }

    clearPasswordToken(): void {
        this.passwordTokenExpiry = null;
        this.passwordToken = null;
    }

    confirmAccount(): void {
        this.confirmed = true;
        this.confirmToken = null;
    }
}