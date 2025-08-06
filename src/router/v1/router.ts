import { Router } from "express";
import { Hello } from "controller/main.controller";

const routerv1 = Router();

routerv1.route("/hello").get(Hello);

export default routerv1;