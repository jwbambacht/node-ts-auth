import {
    Controller,
    Get,
    Render,
    CurrentUser,
    Authorized,
    ExpressErrorMiddlewareInterface,
    UnauthorizedError,
    UseAfter, QueryParam
} from "routing-controllers";
import { Container } from "typedi";
import { LoggerService } from "../services/LoggerService";
import * as express from 'express';
import { User } from "../models/User";
import { UserRepository } from "../repositories/UserRepository";
import { MailService } from "../services/MailService";
import { UserService } from "../services/UserService";

class UnauthorizedHandler implements ExpressErrorMiddlewareInterface {
    error(error: Error, req: express.Request, res: express.Response): void {
        if (error instanceof UnauthorizedError) {
            res.redirect("/login");
            return;
        }
    }
}

@Controller()
@UseAfter(UnauthorizedHandler)
export class RouteController {
    log = Container.get(LoggerService);
    mailer = Container.get(MailService);

    @Get("/")
    @Get("/home")
    @Render("index.ejs")
    GetHome(): unknown {
        return {page: "home"};
    }

    @Get("/forgot-password")
    @Render("index.ejs")
    GetForgotPassword(): unknown {
        return {page: "forgot_password"};
    }

    @Get("/reset-password")
    @Render("index.ejs")
    async GetResetPassword(@QueryParam("token", {required: false}) token: string): Promise<unknown> {
        let message;
        if (token !== undefined) {
            message = await Container.get(UserRepository).isPasswordTokenValid(token);
            return {page: "reset_password", token: token, message: message};
        }
        return {page: "reset_password", token: "", message: message || ""};
    }

    @Get("/confirm-account")
    @Render("index.ejs")
    async GetConfirmAccount(@QueryParam("token") token: string): Promise<unknown> {
        if (token === undefined || token === "") {
            return {page: "confirm_account", success: false, message: "Token is undefined"};
        }

        let message;
        let success = true;

        const result = await Container.get(UserRepository).isConfirmTokenValid(token);

        if (typeof result === 'object') {
            (result as User).confirmAccount();
            await Container.get(UserService).update(result);
        } else {
            success = false;
            message = result;
        }

        return {page: "confirm_account", success: success, message: message};
    }

    @Get("/login")
    @Render("index.ejs")
    GetLogin(): unknown {
        return {page: "login"};
    }

    @Get("/register")
    @Render("index.ejs")
    GetRegister(): unknown {
        return {page: "register"};
    }

    @Authorized()
    @Get("/account")
    @Render("index.ejs")
    async getAccount(@CurrentUser() user: User): Promise<unknown> {
        return {page: "account", user: user};
    }
}