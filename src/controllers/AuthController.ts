import { Container } from "typedi";
import {
    Authorized,
    BadRequestError,
    Body,
    Get,
    JsonController,
    Post
} from "routing-controllers";
import { UserService } from "../services/UserService";
import { SessionRepository } from "../repositories/SessionRepository";
import { LoggerService } from "../services/LoggerService";
import { IsNotEmpty, IsString } from "class-validator";

class AuthCredentialsRequest {
    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

@JsonController("/api/auth")
export class AuthController {
    log = Container.get(LoggerService);

    @Post("/login")
    async postLogin(@Body() body: AuthCredentialsRequest): Promise<object> {
        const user = await Container.get(UserService).findByUsername(body.userName);

        if (user == null) {
            throw new BadRequestError("Invalid username and/or password");
        }

        if (!user.confirmed) {
            throw new BadRequestError("Please confirm your account from the email we sent.");
        }

        if (await user.comparePasswords(body.password) === false) {
            throw new BadRequestError("Invalid username and/or password");
        }

        return await Container.get(SessionRepository).createSession(user);
    }

    @Authorized()
    @Get("/validate")
    testSignature(): string {
        return "ok!";
    }
}