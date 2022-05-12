# Full-stack authenticated web-application with NodeJS and TypeScript

## Characteristics:
* TypeScript for static typing and easier and quicker debugging and development
* Full-stack frontend and backend (API) in node
* Express web application framework loaded in ```expressLoader.ts``` in combination with the EJS templating engine in the ```views``` directory.
* Bootstrap for responsive mobile-first layouts
* typeORM for managing the database interactions to PostgreSQL
* typedi for services as Singleton-like classes in containers
* Routing-controllers for REST routes in express 
* Authentication with username, password and sessions integrated in express with routing-controllers authorization and current user checker. Basic functionalities as registration, forgot password, and confirm account are integrated as well
* DotEnv for system configuration in the ```.env``` file. Rename the ```.env.example``` file and insert your own settings
* class-transformer and class-validator to transform and validate class instantiations from plain JSON objects
* nodemailer to send emails
* Winston to log with different levels
* eslint as linter for JavaScript and TypeScript
* Jest as the javascript testing framework that also works with TypeScript defined in the directory ```test```

## How to start
1. Clone repo
2. Install ```node``` and ```npm``` (and possibly other package managers like ```yarn```)
3. Install PostgreSQL manually or using ```docker-compose.yml```. If using docker, adjust the user, password, and database name inside the YAML file to your preference. After starting postgres, create the database in PostgreSQL using the command-line or adjust the settings inside the ```tools/start-db.sh``` executable and run ```npm run db```. In case you want to seed the database with some instances of for example test users, you can additionally run ```npm run seed``` that executes the script in ```tools/seed-db.ts```
4. Rename ```.env.example``` to ```.env``` and adjust the settings for the application, postgres and nodemailer 
5. Run ```npm install``` to install all dependencies. In case there are some issues, run ```npm install --force``` instead.
6. Run ```npm run dev``` to build and start the application with active file monitoring

### Scripts
The following scripts can run using ```npm run ${script}```:
* ```clean```: removes the build (```dist```) directory
* ```copy-assets```: copies the ```views``` and ```assets``` directories to the ```dist``` directory
* ```lint```: fires the linter for all ```.js``` and ```.ts``` files
* ```tsc```: runs the typescript compiler
* ```db```: starts the database script in ```tools/start-db.sh```
* ```seed```: seeds the database as defined in ```tools/seed-db.ts```
* ```browserify```: bundles and converts the frontend scripts with use of modules
* ```build```: applies the clean, lint, typescript, copy-assets and browserify scripts
* ```dev-start```: builds and starts the application
* ```dev```: watches the ```src``` directory for changes in ```.ts``` and ```.ejs``` files and rebuilds and restarts the application
* ```start```: starts the application
* ```e2e```: execute jest for the E2E-tests defined in ```test/e2e```
* ```e2e-web```: execute jest for the E2E-web-tests defined in ```test/e2e/web```
* ```e2e-api```: execute jest for the E2E-api-tests defined in ```test/e2e/api```
* ```e2e-web```: execute jest for the E2E-web-tests defined in ```test/e2e/web```
* ```test.unit```: execute jest for the unit-tests defined in ```test/unit```
* ```test.e2e```: rebuild and execute E2E-tests in ```test/e2e```
* ```test.all```: execute ```test.unit``` and ```test.e2e```

## Structure
### Models
The models describe and handle the object with the database. The models are automatically adjusted in the database during build. The current implementation uses the three models ```User```, ```PrivateInformation```, and ```Session``` and are deemed required for the use of authentication. Both ```PrivateInformation``` and ```Session``` are related to the ```User``` model. 

### Repository
The repositories allow you to handle the models without having to query inside controllers and other parts. Each model has a repository although the ```PrivateInformationRepository``` currently has no defined functionality. 

### Services
The services allow you to use Singleton instances application-wide that are contained in Containers. The ```LoggerService``` enables the logging of error, warn, debug, and info messages. The ```MailService``` enables sending mails using the settings in ```.env```. If the NODE_ENV in ```.env``` is set to development it will use nodemailer's dummy email without sending an actual email. If the environment is set to production, it will use the nodemailer settings as defined in ```.env```.  The ```UserService``` enables querying to the ```UserRepository``` and the ```AuthService``` parses the authentication bearer token and validates the user. The services are accessible by ```Container.get(Service)``` in any file.

### Controllers
The controllers define the routes inside the application, both frontend and backend. The frontend routes are defined in ```RouteController```. These pages are rendered using express and EJS. The ```UserController``` and ```AuthController``` define API routes that are accessible using the JavaScript fetch function or using REST calls.  

### Events
The event scripts define the functionality on the frontend pages. These scripts are compiled, bundled and placed in the ```dist``` directory as well.

### Views
The fronted views are defined in the ```views``` directory. The ```index.ejs``` include the partials ```head```, ```nav```, ```footer``` and ```scripts```, and the corresponding page template. Each page includes its own script to not unnecessarily slow down the application. The mail templates are also defined in the ```views``` directory and likewise use EJS. 

### Authentication
The authentication enables users to register and login to the application. Authentication is defined inside the ```expressLoader.ts``` by the ```AuthorizationChecker.ts``` and ```CurrentUserChecker.ts```. Upon login, the user receives a session token that is stored in the ```Session``` model and database. A bearer token is composed of the username and session token and stored in base64 as a cookie in the user's browser. On every page the validity of this bearer token is checked and the user is logged out if the token is invalid or expired. The ```RouteController``` is able to use the ```@Authorized()``` and ```@CurrentUser()``` decorators to authorize the user to the pages.

After registration, a confirmation token is sent to the user's email-address that must be confirmed before the user is able to log in. The user is also able to request a new password when forgotten. In that case a password token is sent to the email-address that allows the user to choose a new password. 

