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
    public UserProfile update(UUID id, String fullName) {
        UserProfile u = getOrThrow(id);

        if (fullName != null && !fullName.isBlank()) {
            u.setFullName(fullName.trim());
        }

        u.setUpdatedAt(Instant.now());
        return repo.save(u);
    }

    /**
     * YENİ: Kullanıcının planını değiştir (upgrade/downgrade/cancel)
     * credits'i kullanıcı buradan değiştiremez.
     */
    @Override
    @Transactional
    public UserProfile changePlan(UUID id, Plan newPlan) {
        if (newPlan == null) {
            throw new IllegalArgumentException("Plan cannot be null");
        }

        UserProfile u = getOrThrow(id);
        u.setPlan(newPlan);
        u.setUpdatedAt(Instant.now());
        return repo.save(u);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        repo.deleteById(id);
    }

    /**
     * Auth-service'den event geldiğinde veya /me endpoint'i self-heal yaptığında çağrılır.
     * "Gerçek upsert" gibi davranır: varsa email/fullName gibi alanları günceller.
     */
    @Override
    @Transactional
    public UserProfile upsertFromAuth(UUID userId, String email, String fullName, Instant createdAt) {

        // 1) ID ile bul
        Optional<UserProfile> byId = repo.findById(userId);
        if (byId.isPresent()) {
            UserProfile u = byId.get();
            applyAuthFields(u, email, fullName);
            u.setUpdatedAt(Instant.now());
            return repo.save(u);
        }

        // 2) Email ile bul (eski kullanıcıyla eşleştirme)
        if (email != null && !email.isBlank()) {
            Optional<UserProfile> byEmail = repo.findByEmail(email);
            if (byEmail.isPresent()) {
                UserProfile u = byEmail.get();
                // önemli: id boşsa/başka ise userId ile sabitlemek isteyebilirsin
                // çoğu senaryoda id zaten dolu olur, ama emin olmak için:
                if (u.getId() == null) {
                    u.setId(userId);
                }
                applyAuthFields(u, email, fullName);
                u.setUpdatedAt(Instant.now());
                return repo.save(u);
            }
        }

        // 3) Yoksa oluştur
        UserProfile u = new UserProfile();
        u.setId(userId);
        u.setEmail(email);

        String effectiveName = (fullName != null && !fullName.isBlank())
                ? fullName.trim()
                : deriveNameFromEmail(email);

        u.setFullName(effectiveName);

        u.setPlan(Plan.FREE);
        u.setCredits(0);
        u.setCreatedAt(createdAt != null ? createdAt : Instant.now());
        u.setUpdatedAt(Instant.now()); // entity'de updatedAt varsa

        return repo.save(u);
    }

    private void applyAuthFields(UserProfile u, String email, String fullName) {
        if (email != null && !email.isBlank()) {
            u.setEmail(email);
        }

        // fullName geldiyse onu yaz
        if (fullName != null && !fullName.isBlank()) {
            u.setFullName(fullName.trim());
            return;
        }

        // fullName yoksa ve mevcut boşsa email'den türet
        if (u.getFullName() == null || u.getFullName().isBlank()) {
            u.setFullName(deriveNameFromEmail(email));
        }
    }

    private String deriveNameFromEmail(String email) {
        if (email == null || email.isBlank()) return "User";
        int idx = email.indexOf("@");
        String base = (idx > 0) ? email.substring(0, idx) : email;
        if (base.isBlank()) return "User";
        return base.replace(".", " ").replace("_", " ").trim();
    }
}
