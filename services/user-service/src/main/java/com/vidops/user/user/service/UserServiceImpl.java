package com.vidops.user.user.service;

import com.vidops.user.user.entity.UserProfile;
import com.vidops.user.user.enums.Plan;
import com.vidops.user.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repo;

    public UserServiceImpl(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public UserProfile create(UserProfile user) {
        return repo.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserProfile> get(UUID id) {
        return repo.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfile getOrThrow(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    @Override
    @Transactional
    public UserProfile update(UUID id, String fullName, Plan plan, Integer credits) {
        UserProfile u = getOrThrow(id);

        if (fullName != null && !fullName.isBlank()) u.setFullName(fullName);
        if (plan != null) u.setPlan(plan);
        if (credits != null) u.setCredits(credits);

        return repo.save(u);
    }

    @Override
    @Transactional
    public UserProfile update(UserProfile user) {
        return repo.save(user);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        repo.deleteById(id);
    }

    @Override
    @Transactional
    public UserProfile upsertFromAuth(UUID userId, String email, String fullName, Instant createdAt) {
        // 1) ID ile varsa dön
        Optional<UserProfile> byId = repo.findById(userId);
        if (byId.isPresent()) return byId.get();

        // 2) Email ile varsa dön
        Optional<UserProfile> byEmail = repo.findByEmail(email);
        if (byEmail.isPresent()) return byEmail.get();

        // 3) Yoksa oluştur
        UserProfile u = new UserProfile();
        u.setId(userId);
        u.setEmail(email);

        // fullName geldiyse onu kullan; yoksa email'den türet (Google vb.)
        String effectiveName = (fullName != null && !fullName.isBlank())
                ? fullName.trim()
                : deriveNameFromEmail(email);

        u.setFullName(effectiveName);

        u.setPlan(Plan.FREE);
        u.setCredits(0);
        u.setCreatedAt(createdAt != null ? createdAt : Instant.now());

        return repo.save(u);
    }

    private String deriveNameFromEmail(String email) {
        if (email == null || email.isBlank()) return "User";
        int idx = email.indexOf("@");
        String base = (idx > 0) ? email.substring(0, idx) : email;
        if (base.isBlank()) return "User";
        return base.replace(".", " ").replace("_", " ").trim();
    }
}
