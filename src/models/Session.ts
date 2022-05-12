import {
    Entity,
    ManyToOne,
    Column,
    AfterLoad,
    PrimaryColumn
} from 'typeorm';
import { User } from "./User";
import { bigIntToNumber } from "../util/PostGresUtil";

@Entity({name: "sessions"})
export class Session {

    @PrimaryColumn()
    public signature: string;

    @Column({name: "created_at", type: "bigint", default: Date.now()})
    public createdAt: number;

    @ManyToOne(() => User, user => user.userID, {
        primary: true,
        onDelete: "CASCADE",
        cascade: true
    })
    public user: User;

    @AfterLoad()
    convertBalanceToNumber(): void {
        this.createdAt = bigIntToNumber(this.createdAt);
    }
}