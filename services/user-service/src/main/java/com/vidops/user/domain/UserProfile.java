package com.vidops.user.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

  @Id
  private UUID id;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "full_name", nullable = false)
  private String fullName;

  @Column(nullable = false)
  private String plan = "FREE";

  @Column(nullable = false)
  private int credits = 0;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();

  @PreUpdate
  void onUpdate() { this.updatedAt = Instant.now(); }

  public UserProfile() {}

  public UserProfile(UUID id, String email, String fullName) {
    this.id = id;
    this.email = email;
    this.fullName = fullName;
  }

  public UUID getId() { return id; }
  public String getEmail() { return email; }
  public String getFullName() { return fullName; }
  public String getPlan() { return plan; }
  public int getCredits() { return credits; }
  public Instant getCreatedAt() { return createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }

  public void setId(UUID id) { this.id = id; }
  public void setEmail(String email) { this.email = email; }
  public void setFullName(String fullName) { this.fullName = fullName; }
  public void setPlan(String plan) { this.plan = plan; }
  public void setCredits(int credits) { this.credits = credits; }
}
