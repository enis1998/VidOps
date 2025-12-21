package com.vidops.webapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping({"/", "/login"})
    public String login() {
        return "login";
    }

    @GetMapping("/app")
    public String app() {
        return "app";
    }

    @GetMapping("/create")
    public String create() {
        return "create";
    }

    @GetMapping("/logout")
    public String logout() {
        return "logout";
    }
}
