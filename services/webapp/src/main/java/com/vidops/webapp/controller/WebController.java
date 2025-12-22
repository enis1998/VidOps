package com.vidops.webapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String root() {
        return "redirect:/app";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/app")
    public String app() {
        return "app";
    }

    @GetMapping("/create")
    public String create() {
        // Back-compat for older links
        return "redirect:/app#create";
    }

    @GetMapping("/logout")
    public String logout() {
        return "logout";
    }
}
