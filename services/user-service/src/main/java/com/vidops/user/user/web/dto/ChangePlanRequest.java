package com.vidops.user.user.web.dto;

import com.vidops.user.user.enums.Plan;
import jakarta.validation.constraints.NotNull;

public class ChangePlanRequest {

    @NotNull
    private Plan plan;

    public ChangePlanRequest() {}

    public ChangePlanRequest(Plan plan) {
        this.plan = plan;
    }

    public Plan getPlan() {
        return plan;
    }

    public void setPlan(Plan plan) {
        this.plan = plan;
    }
}
