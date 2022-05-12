import { Container } from "typedi";
import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    Delete,
    Get,
    JsonController,
    Post,
    Put
} from "routing-controllers";
import { UserService } from "../services/UserService";
import { User } from '../models/User';
import { LoggerService } from "../services/LoggerService";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, validate } from "class-validator";
import { PrivateInformation } from "../models/PrivateInformation";
import { MailService } from "../services/MailService";

const passwordPattern = new RegExp(process.env.PASSWORD_REGEX_PATTERN);

class CreateUserRequest {
    @IsString()
    @IsNotEmpty()
    @MinLength(Number(process.env.MIN_USERNAME_LENGTH))
    @MaxLength(100)
    userName: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    passwordConfirm: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @MaxLength(100)
    fullName: string;
}

class UpdateUserPasswordRequest {
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    newPasswordConfirm: string;
}

class UpdateProfileRequest {
    @IsString()
    @IsNotEmpty()
    @MinLength(Number(process.env.MIN_USERNAME_LENGTH))
    @MaxLength(100)
    userName: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @MaxLength(100)
    fullName: string;
}

class ValidEmail {
    @IsEmail()
    isEmail: string;
}

class ResetUserPasswordRequest {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    newPasswordConfirm: string;
}

@JsonController("/api/users")
export class UserController {
    log = Container.get(LoggerService);
    mailer = Container.get(MailService);

    @Get("")
    @Authorized()
    getMe(@CurrentUser() user: User): User | undefined {
        return user;
    }

    @Post("/forgot_password")
    async forgotPassword(@Body() body: {value: string}): Promise<string> {

        const checkType = new ValidEmail();
        checkType.isEmail = body.value;

        let user;
        if (await validate(checkType).then(errors => errors.length === 0)) {
            user = await Container.get(UserService).findByEmail(body.value);
        } else {
            user = await Container.get(UserService).findByUsername(body.value);
        }

        if (user) {
            user.generatePasswordToken();
            await Container.get(UserService).update(user);

            this.mailer.sendMailUsingTemplate(
                "forgot_password",
                user.private.email,
                "Reset your password",
                {token: user.passwordToken}
            );
        }

        return "OK";
    }

    @Post("/reset_password")
    async resetPassword(@Body() body: ResetUserPasswordRequest): Promise<string> {
        const errors = [];

        if (body.token === "" || body.newPassword === "" || body.newPasswordConfirm === "") {
            errors.push("Fill out all required fields");
        }

        const user = await Container.get(UserService).findByPasswordToken(body.token);
        if (user == null) {
            return JSON.stringify(["Invalid token"]);
        }

        if (body.newPassword != body.newPasswordConfirm) {
            errors.push("New passwords do not match");
        }

        if (!passwordPattern.test(body.newPassword)) {
            errors.push("Password is not conform the requirements");
        }

        if (errors.length > 0) {
            throw new BadRequestError(JSON.stringify(errors));
        }

        await user.hashPassword(body.newPassword);
        await user.clearPasswordToken();
        await Container.get(UserService).update(user);

        return "OK";
    }

    @Put("/update/profile")
    @Authorized()
    async updateProfileMe(@CurrentUser() user: User, @Body() body: UpdateProfileRequest): Promise<string> {
        const errors = [];
        if (body.userName === "" || body.email === "") {
            errors.push("Fill out all required fields");
        }

        const findUsername = await Container.get(UserService).findByUsername(body.userName);
        if (findUsername != null && findUsername.userID != user.userID) {
            errors.push("Username is unavailable");
        }

        const findUserEmail = await Container.get(UserService).findByEmail(body.email);
        if (findUserEmail != null && findUserEmail.userID != user.userID) {
            errors.push("Email is unavailable");
        }

        if (errors.length > 0) {
            throw new BadRequestError(JSON.stringify(errors));
        }

        user.userName = body.userName;
        user.private.email = body.email;
        user.private.fullName = body.fullName;

        await Container.get(UserService).update(user);
        return "User successfully updated";
    }

    @Put("/update/password")
    @Authorized()
    async updatePasswordMe(@CurrentUser() user: User, @Body() body: UpdateUserPasswordRequest): Promise<string> {
        const errors = [];
        if (body.currentPassword === "" || body.newPassword === "" || body.newPasswordConfirm === "") {
            errors.push("Fill out all required fields");
        }

        if (await user.comparePasswords(body.currentPassword) == false) {
            errors.push("Invalid current password");
        }

        if (body.newPassword != body.newPasswordConfirm) {
            errors.push("New passwords do not match");
        }

        if (!passwordPattern.test(body.newPassword)) {
            errors.push("Password is not conform the requirements");
        }

        if (errors.length > 0) {
            throw new BadRequestError(JSON.stringify(errors));
        }

        await user.hashPassword(body.newPassword);
        await Container.get(UserService).update(user);

        return "Password successfully updated";
    }

    @Delete("")
    @Authorized()
    async removeMe(@CurrentUser() user: User): Promise<string> {
        await Container.get(UserService).delete(user.userID);
        // await Container.get(UserService).update(user);
        return "User " + user.userName + " deleted";
    }

    @Post("")
    async createUser(@Body({ validate: true }) body: CreateUserRequest): Promise<User> {
        const errors = [];

        if (body.userName === "" || body.password === "" || body.passwordConfirm === "" || body.email === "") {
            errors.push("Please fill out all required fields");
        }

        if (await Container.get(UserService).findByUsername(body.userName) != null) {
            errors.push("Username is already in use");
        }

        if (body.userName.length < Number(process.env.MIN_USERNAME_LENGTH)) {
            errors.push("Username must be at least " + Number(process.env.MIN_USERNAME_LENGTH) + " characters");
        }

        if (body.password != body.passwordConfirm) {
            errors.push("Passwords do not match");
        }

        if (!passwordPattern.test(body.password)) {
            errors.push("Password is not conform the requirements");
        }

        if (await Container.get(UserService).findByEmail(body.email) != null) {
            errors.push("Email is already in use");
        }

        if (errors.length > 0) {
            throw new BadRequestError(JSON.stringify(errors));
        }

        const user = new User();
        user.userName = body.userName;
        user.password = body.password;
        user.private = new PrivateInformation();
        user.private.email = body.email;
        user.private.fullName = body.fullName;

        const newUser = await Container.get(UserService).create(user);
        if (newUser.userName !== undefined) {
            this.log.info("User registered!");

            this.mailer.sendMailUsingTemplate(
                "confirm_account",
                newUser.private.email,
                "Confirm your account!",
                {token: newUser.confirmToken}
            );

            return newUser;
        }

        return undefined;
    }
}